-- Supabase Auth admin access for the static GitHub Pages admin.
-- Run this in the Supabase SQL editor after creating the admin user in Authentication.
--
-- After running the schema block, add your admin user with:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'LA_TUA_EMAIL_ADMIN'
-- on conflict (user_id) do update set email = excluded.email;

alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;

alter table if exists public.orders
  add column if not exists order_number text;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_tavernetta_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_tavernetta_admin() from public;
grant execute on function public.is_tavernetta_admin() to anon, authenticated;

revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant update (status) on table public.orders to authenticated;

drop policy if exists tavernetta_public_select_orders on public.orders;
drop policy if exists tavernetta_public_select_order_items on public.order_items;
drop policy if exists tavernetta_public_update_order_status on public.orders;
drop policy if exists tavernetta_admin_select_orders on public.orders;
drop policy if exists tavernetta_admin_select_order_items on public.order_items;
drop policy if exists tavernetta_admin_update_order_status on public.orders;
drop policy if exists tavernetta_admin_users_self_select on public.admin_users;

create policy tavernetta_admin_users_self_select
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

create policy tavernetta_admin_select_orders
  on public.orders
  for select
  to authenticated
  using (public.is_tavernetta_admin());

create policy tavernetta_admin_select_order_items
  on public.order_items
  for select
  to authenticated
  using (public.is_tavernetta_admin());

create policy tavernetta_admin_update_order_status
  on public.orders
  for update
  to authenticated
  using (public.is_tavernetta_admin())
  with check (
    public.is_tavernetta_admin()
    and status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')
  );

create or replace function public.update_public_order_status(p_order_id text, p_status text)
returns table(id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order_id text;
begin
  if not public.is_tavernetta_admin() then
    raise exception 'ADMIN_NOT_ALLOWED';
  end if;

  if nullif(btrim(coalesce(p_order_id, '')), '') is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if p_status not in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled') then
    raise exception 'INVALID_ORDER_STATUS';
  end if;

  update public.orders
  set status = p_status
  where public.orders.id::text = p_order_id
  returning public.orders.id::text into updated_order_id;

  if updated_order_id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  return query select updated_order_id;
end;
$$;

revoke all on function public.update_public_order_status(text, text) from public;
grant execute on function public.update_public_order_status(text, text) to authenticated;

-- Global ordering switch used by the admin "In vacanza" control.
create table if not exists public.restaurant_settings (
  id boolean primary key default true check (id),
  orders_paused boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.restaurant_settings (id, orders_paused)
values (true, false)
on conflict (id) do nothing;

alter table public.restaurant_settings enable row level security;
revoke all on table public.restaurant_settings from anon, authenticated;

create or replace function public.get_public_ordering_status()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'ordersPaused', coalesce(settings.orders_paused, false),
    'updatedAt', settings.updated_at
  )
  from public.restaurant_settings as settings
  where settings.id = true;
$$;

revoke all on function public.get_public_ordering_status() from public;
grant execute on function public.get_public_ordering_status() to anon, authenticated;

create or replace function public.set_ordering_paused(p_orders_paused boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_settings public.restaurant_settings%rowtype;
begin
  if not public.is_tavernetta_admin() then
    raise exception 'ADMIN_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  if p_orders_paused is null then
    raise exception 'INVALID_ORDERING_STATUS' using errcode = 'P0001';
  end if;

  insert into public.restaurant_settings (id, orders_paused, updated_at, updated_by)
  values (true, p_orders_paused, now(), auth.uid())
  on conflict (id) do update
  set orders_paused = excluded.orders_paused,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  returning * into saved_settings;

  return jsonb_build_object(
    'ordersPaused', saved_settings.orders_paused,
    'updatedAt', saved_settings.updated_at
  );
end;
$$;

revoke all on function public.set_ordering_paused(boolean) from public;
grant execute on function public.set_ordering_paused(boolean) to authenticated;

create or replace function public.block_order_when_paused()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(
    (select settings.orders_paused from public.restaurant_settings as settings where settings.id = true),
    false
  ) then
    raise exception 'ORDERING_PAUSED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.block_order_when_paused() from public;

drop trigger if exists tavernetta_block_order_when_paused on public.orders;
create trigger tavernetta_block_order_when_paused
before insert on public.orders
for each row
execute function public.block_order_when_paused();

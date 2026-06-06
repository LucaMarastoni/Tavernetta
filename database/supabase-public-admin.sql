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

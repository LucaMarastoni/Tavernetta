-- Supabase public access required by the static admin orders page.
-- Run this in the Supabase SQL editor after the main Supabase schema exists.

alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;

alter table if exists public.orders
  add column if not exists order_number text;

grant usage on schema public to anon, authenticated;
grant select on table public.orders to anon, authenticated;
grant select on table public.order_items to anon, authenticated;
grant update (status) on table public.orders to anon, authenticated;

do $$
begin
  if to_regclass('public.orders') is not null and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'tavernetta_public_select_orders'
  ) then
    create policy tavernetta_public_select_orders
      on public.orders
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.order_items') is not null and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_items'
      and policyname = 'tavernetta_public_select_order_items'
  ) then
    create policy tavernetta_public_select_order_items
      on public.order_items
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.orders') is not null and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'tavernetta_public_update_order_status'
  ) then
    create policy tavernetta_public_update_order_status
      on public.orders
      for update
      to anon, authenticated
      using (true)
      with check (
        status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')
      );
  end if;
end $$;

create or replace function public.update_public_order_status(p_order_id text, p_status text)
returns table(id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order_id text;
begin
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
grant execute on function public.update_public_order_status(text, text) to anon, authenticated;

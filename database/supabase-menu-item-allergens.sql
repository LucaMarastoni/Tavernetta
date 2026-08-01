-- Menu admin fields and Supabase Auth policies.
-- Run this after database/supabase-public-admin.sql so public.is_tavernetta_admin() exists.

alter table public.menu_items
  add column if not exists allergen_nuts boolean not null default false,
  add column if not exists allergen_milk boolean not null default false,
  add column if not exists allergen_frozen boolean not null default false,
  add column if not exists allergen_gluten boolean not null default false,
  add column if not exists allergen_eggs boolean not null default false,
  add column if not exists allergen_fish boolean not null default false,
  add column if not exists allergen_mollusks boolean not null default false,
  add column if not exists allergen_crustaceans boolean not null default false;

comment on column public.menu_items.allergen_nuts is 'Frutta a guscio';
comment on column public.menu_items.allergen_milk is 'Latte e derivati';
comment on column public.menu_items.allergen_frozen is 'Congelati';
comment on column public.menu_items.allergen_gluten is 'Glutine';
comment on column public.menu_items.allergen_eggs is 'Uova e derivati';
comment on column public.menu_items.allergen_fish is 'Pesce';
comment on column public.menu_items.allergen_mollusks is 'Molluschi';
comment on column public.menu_items.allergen_crustaceans is 'Crostacei';

alter table if exists public.categories enable row level security;
alter table if exists public.menu_items enable row level security;
alter table if exists public.ingredients enable row level security;
alter table if exists public.menu_item_ingredients enable row level security;
alter table if exists public.extra_ingredients enable row level security;

grant usage on schema public to anon, authenticated;

grant select on table public.categories to anon, authenticated;
grant select on table public.menu_items to anon, authenticated;
grant select on table public.ingredients to anon, authenticated;
grant select on table public.menu_item_ingredients to anon, authenticated;
grant select on table public.extra_ingredients to anon, authenticated;

grant insert, update on table public.categories to authenticated;
grant insert, update on table public.menu_items to authenticated;
grant insert, update on table public.ingredients to authenticated;
grant insert, delete on table public.menu_item_ingredients to authenticated;
grant update (extra_price) on table public.extra_ingredients to authenticated;

drop policy if exists tavernetta_public_select_menu_items on public.menu_items;
drop policy if exists tavernetta_public_update_menu_item_flags on public.menu_items;

drop policy if exists tavernetta_public_select_categories on public.categories;
drop policy if exists tavernetta_admin_insert_categories on public.categories;
drop policy if exists tavernetta_admin_update_categories on public.categories;

drop policy if exists tavernetta_public_select_menu_items_active on public.menu_items;
drop policy if exists tavernetta_admin_insert_menu_items on public.menu_items;
drop policy if exists tavernetta_admin_update_menu_items on public.menu_items;

drop policy if exists tavernetta_public_select_ingredients on public.ingredients;
drop policy if exists tavernetta_admin_insert_ingredients on public.ingredients;
drop policy if exists tavernetta_admin_update_ingredients on public.ingredients;

drop policy if exists tavernetta_public_select_menu_item_ingredients on public.menu_item_ingredients;
drop policy if exists tavernetta_admin_insert_menu_item_ingredients on public.menu_item_ingredients;
drop policy if exists tavernetta_admin_delete_menu_item_ingredients on public.menu_item_ingredients;

drop policy if exists tavernetta_public_select_extra_ingredients on public.extra_ingredients;
drop policy if exists tavernetta_admin_update_extra_ingredient_prices on public.extra_ingredients;

create policy tavernetta_public_select_categories
  on public.categories
  for select
  to anon, authenticated
  using (active = true or public.is_tavernetta_admin());

create policy tavernetta_admin_insert_categories
  on public.categories
  for insert
  to authenticated
  with check (public.is_tavernetta_admin());

create policy tavernetta_admin_update_categories
  on public.categories
  for update
  to authenticated
  using (public.is_tavernetta_admin())
  with check (public.is_tavernetta_admin());

create policy tavernetta_public_select_menu_items_active
  on public.menu_items
  for select
  to anon, authenticated
  using (active = true or public.is_tavernetta_admin());

create policy tavernetta_admin_insert_menu_items
  on public.menu_items
  for insert
  to authenticated
  with check (public.is_tavernetta_admin());

create policy tavernetta_admin_update_menu_items
  on public.menu_items
  for update
  to authenticated
  using (public.is_tavernetta_admin())
  with check (public.is_tavernetta_admin());

create policy tavernetta_public_select_ingredients
  on public.ingredients
  for select
  to anon, authenticated
  using (active = true or public.is_tavernetta_admin());

create policy tavernetta_admin_insert_ingredients
  on public.ingredients
  for insert
  to authenticated
  with check (public.is_tavernetta_admin());

create policy tavernetta_admin_update_ingredients
  on public.ingredients
  for update
  to authenticated
  using (public.is_tavernetta_admin())
  with check (public.is_tavernetta_admin());

create policy tavernetta_public_select_menu_item_ingredients
  on public.menu_item_ingredients
  for select
  to anon, authenticated
  using (
    public.is_tavernetta_admin()
    or exists (
      select 1
      from public.menu_items
      where public.menu_items.id = menu_item_ingredients.menu_item_id
        and public.menu_items.active = true
    )
  );

create policy tavernetta_admin_insert_menu_item_ingredients
  on public.menu_item_ingredients
  for insert
  to authenticated
  with check (public.is_tavernetta_admin());

create policy tavernetta_admin_delete_menu_item_ingredients
  on public.menu_item_ingredients
  for delete
  to authenticated
  using (public.is_tavernetta_admin());

create policy tavernetta_public_select_extra_ingredients
  on public.extra_ingredients
  for select
  to anon, authenticated
  using (active = true or public.is_tavernetta_admin());

create policy tavernetta_admin_update_extra_ingredient_prices
  on public.extra_ingredients
  for update
  to authenticated
  using (public.is_tavernetta_admin())
  with check (public.is_tavernetta_admin() and extra_price >= 0);

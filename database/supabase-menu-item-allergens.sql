-- Boolean allergen flags on menu_items.
-- Run this in the Supabase SQL editor.

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

grant usage on schema public to anon, authenticated;
grant select on table public.menu_items to anon, authenticated;
grant update (
  spicy,
  vegetarian,
  allergen_nuts,
  allergen_milk,
  allergen_frozen,
  allergen_gluten,
  allergen_eggs,
  allergen_fish,
  allergen_mollusks,
  allergen_crustaceans
) on table public.menu_items to anon, authenticated;

do $$
begin
  if to_regclass('public.menu_items') is not null and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'menu_items'
      and policyname = 'tavernetta_public_select_menu_items'
  ) then
    create policy tavernetta_public_select_menu_items
      on public.menu_items
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.menu_items') is not null and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'menu_items'
      and policyname = 'tavernetta_public_update_menu_item_flags'
  ) then
    create policy tavernetta_public_update_menu_item_flags
      on public.menu_items
      for update
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;

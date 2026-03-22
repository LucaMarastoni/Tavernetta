create table if not exists categories (
  id integer primary key autoincrement,
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  active integer not null default 1 check (active in (0, 1)),
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists menu_items (
  id integer primary key autoincrement,
  category_id integer not null references categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null,
  base_price real not null check (base_price >= 0),
  image_url text,
  tags text not null default '[]',
  active integer not null default 1 check (active in (0, 1)),
  featured integer not null default 0 check (featured in (0, 1)),
  sort_order integer not null default 0,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists ingredients (
  id integer primary key autoincrement,
  name text not null,
  slug text not null unique,
  allergen_info text,
  active integer not null default 1 check (active in (0, 1)),
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists menu_item_ingredients (
  id integer primary key autoincrement,
  menu_item_id integer not null references menu_items(id) on delete cascade,
  ingredient_id integer not null references ingredients(id) on delete restrict,
  is_removable integer not null default 1 check (is_removable in (0, 1)),
  sort_order integer not null default 0,
  unique (menu_item_id, ingredient_id)
);

create table if not exists extra_ingredients (
  id integer primary key autoincrement,
  ingredient_id integer not null references ingredients(id) on delete restrict,
  extra_price real not null default 0 check (extra_price >= 0),
  active integer not null default 1 check (active in (0, 1)),
  sort_order integer not null default 0,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists menu_item_allowed_extras (
  id integer primary key autoincrement,
  menu_item_id integer not null references menu_items(id) on delete cascade,
  extra_ingredient_id integer not null references extra_ingredients(id) on delete restrict,
  unique (menu_item_id, extra_ingredient_id)
);

create table if not exists product_options (
  id integer primary key autoincrement,
  menu_item_id integer not null references menu_items(id) on delete cascade,
  option_group_name text not null,
  option_group_slug text not null,
  option_name text not null,
  price_delta real not null default 0,
  is_default integer not null default 0 check (is_default in (0, 1)),
  sort_order integer not null default 0,
  active integer not null default 1 check (active in (0, 1)),
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists orders (
  id integer primary key autoincrement,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  privacy_accepted_at text not null,
  order_type text not null check (order_type in ('pickup', 'delivery')),
  address text,
  preferred_time text,
  notes text,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')
  ),
  subtotal real not null check (subtotal >= 0),
  delivery_fee real not null default 0 check (delivery_fee >= 0),
  total real not null check (total >= 0),
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists order_items (
  id integer primary key autoincrement,
  order_id integer not null references orders(id) on delete cascade,
  menu_item_id integer references menu_items(id) on delete set null,
  item_name_snapshot text not null,
  base_price_snapshot real not null check (base_price_snapshot >= 0),
  final_unit_price real not null check (final_unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total real not null check (line_total >= 0),
  customization_json text not null,
  notes text,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_categories_active_order on categories(active, sort_order);
create index if not exists idx_menu_items_category_active on menu_items(category_id, active, sort_order);
create index if not exists idx_menu_items_featured on menu_items(featured, active);
create index if not exists idx_menu_item_ingredients_item on menu_item_ingredients(menu_item_id, sort_order);
create index if not exists idx_extra_ingredients_active on extra_ingredients(active, sort_order);
create index if not exists idx_menu_item_allowed_extras_item on menu_item_allowed_extras(menu_item_id);
create index if not exists idx_product_options_item_group on product_options(menu_item_id, option_group_slug, sort_order);
create index if not exists idx_orders_status_created on orders(status, created_at desc);
create index if not exists idx_orders_phone_created on orders(customer_phone, created_at desc);
create index if not exists idx_order_items_order on order_items(order_id);

create trigger if not exists trg_categories_updated_at
after update on categories
for each row
when old.updated_at = new.updated_at
begin
  update categories
  set updated_at = datetime('now')
  where id = new.id;
end;

create trigger if not exists trg_menu_items_updated_at
after update on menu_items
for each row
when old.updated_at = new.updated_at
begin
  update menu_items
  set updated_at = datetime('now')
  where id = new.id;
end;

create trigger if not exists trg_ingredients_updated_at
after update on ingredients
for each row
when old.updated_at = new.updated_at
begin
  update ingredients
  set updated_at = datetime('now')
  where id = new.id;
end;

create trigger if not exists trg_extra_ingredients_updated_at
after update on extra_ingredients
for each row
when old.updated_at = new.updated_at
begin
  update extra_ingredients
  set updated_at = datetime('now')
  where id = new.id;
end;

create trigger if not exists trg_product_options_updated_at
after update on product_options
for each row
when old.updated_at = new.updated_at
begin
  update product_options
  set updated_at = datetime('now')
  where id = new.id;
end;

create trigger if not exists trg_orders_updated_at
after update on orders
for each row
when old.updated_at = new.updated_at
begin
  update orders
  set updated_at = datetime('now')
  where id = new.id;
end;

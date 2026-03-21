create table if not exists categories (
  id integer primary key autoincrement,
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at text not null default (datetime('now'))
);

create table if not exists menu_items (
  id integer primary key autoincrement,
  category_id integer not null references categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null,
  price real not null check (price >= 0),
  image_url text,
  tags text not null default '[]',
  allergens text not null default '[]',
  available integer not null default 1 check (available in (0, 1)),
  featured integer not null default 0 check (featured in (0, 1)),
  sort_order integer not null default 0,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists customers (
  id integer primary key autoincrement,
  full_name text not null,
  phone text not null unique,
  email text,
  created_at text not null default (datetime('now'))
);

create table if not exists orders (
  id integer primary key autoincrement,
  customer_id integer not null references customers(id) on delete restrict,
  order_type text not null check (order_type in ('pickup', 'delivery')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  address text,
  preferred_time text,
  notes text,
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
  unit_price_snapshot real not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  line_total real not null check (line_total >= 0),
  created_at text not null default (datetime('now'))
);

create index if not exists idx_categories_sort_order on categories(sort_order);
create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_menu_items_sort_order on menu_items(sort_order);
create index if not exists idx_menu_items_available on menu_items(available);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_order_items_order on order_items(order_id);

create trigger if not exists trg_menu_items_updated_at
after update on menu_items
for each row
when old.updated_at = new.updated_at
begin
  update menu_items
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

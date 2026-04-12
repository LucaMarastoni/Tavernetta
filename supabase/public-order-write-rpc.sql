create or replace function public.create_public_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_name text := nullif(btrim(coalesce(payload #>> '{customer,name}', '')), '');
  customer_phone text := nullif(btrim(coalesce(payload #>> '{customer,phone}', '')), '');
  customer_email text := nullif(btrim(coalesce(payload #>> '{customer,email}', '')), '');
  order_type text := coalesce(nullif(btrim(coalesce(payload #>> '{order,orderType}', '')), ''), 'pickup');
  address text := nullif(btrim(coalesce(payload #>> '{order,address}', '')), '');
  preferred_time text := nullif(btrim(coalesce(payload #>> '{order,preferredTime}', '')), '');
  order_notes text := nullif(btrim(coalesce(payload #>> '{order,notes}', '')), '');
  privacy_accepted boolean := coalesce(nullif(payload #>> '{order,privacyAccepted}', '')::boolean, false);
  subtotal_value numeric := coalesce(nullif(payload #>> '{totals,subtotal}', '')::numeric, 0);
  delivery_fee_value numeric := coalesce(nullif(payload #>> '{totals,deliveryFee}', '')::numeric, 0);
  total_value numeric := coalesce(nullif(payload #>> '{totals,total}', '')::numeric, 0);
  items_payload jsonb := coalesce(payload -> 'items', '[]'::jsonb);
  item_payload jsonb;
  created_order public.orders%rowtype;
  normalized_phone text;
  normalized_email text;
  item_name_snapshot text;
  item_quantity integer;
  base_price_snapshot numeric;
  final_unit_price numeric;
  line_total_value numeric;
begin
  if jsonb_typeof(items_payload) <> 'array' or jsonb_array_length(items_payload) = 0 then
    raise exception 'EMPTY_CART' using errcode = 'P0001';
  end if;

  if customer_name is null then
    raise exception 'INVALID_CUSTOMER_NAME' using errcode = 'P0001';
  end if;

  normalized_phone := regexp_replace(coalesce(customer_phone, ''), '[^0-9+]', '', 'g');

  if length(normalized_phone) < 7 then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;

  normalized_email := customer_email;

  if normalized_email is not null and normalized_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID_EMAIL' using errcode = 'P0001';
  end if;

  if order_type not in ('pickup', 'delivery') then
    raise exception 'INVALID_ORDER_TYPE' using errcode = 'P0001';
  end if;

  if not privacy_accepted then
    raise exception 'PRIVACY_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  if order_type = 'delivery' and address is null then
    raise exception 'ADDRESS_REQUIRED' using errcode = 'P0001';
  end if;

  if subtotal_value < 0 or delivery_fee_value < 0 or total_value < 0 then
    raise exception 'INVALID_ORDER_TOTAL' using errcode = 'P0001';
  end if;

  insert into public.orders (
    customer_name,
    customer_phone,
    customer_email,
    privacy_accepted_at,
    order_type,
    address,
    preferred_time,
    notes,
    status,
    subtotal,
    delivery_fee,
    total
  )
  values (
    customer_name,
    customer_phone,
    normalized_email,
    now(),
    order_type,
    case when order_type = 'delivery' then address else null end,
    preferred_time,
    order_notes,
    'pending',
    subtotal_value,
    delivery_fee_value,
    total_value
  )
  returning *
  into created_order;

  for item_payload in
    select value from jsonb_array_elements(items_payload)
  loop
    item_name_snapshot := nullif(btrim(coalesce(item_payload ->> 'itemNameSnapshot', '')), '');
    item_quantity := coalesce(nullif(item_payload ->> 'quantity', '')::integer, 0);
    base_price_snapshot := coalesce(nullif(item_payload ->> 'basePriceSnapshot', '')::numeric, -1);
    final_unit_price := coalesce(nullif(item_payload ->> 'finalUnitPrice', '')::numeric, -1);
    line_total_value := coalesce(nullif(item_payload ->> 'lineTotal', '')::numeric, -1);

    if item_name_snapshot is null then
      raise exception 'INVALID_MENU_ITEM' using errcode = 'P0001';
    end if;

    if item_quantity < 1 then
      raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
    end if;

    if base_price_snapshot < 0 or final_unit_price < 0 or line_total_value < 0 then
      raise exception 'INVALID_ORDER_TOTAL' using errcode = 'P0001';
    end if;

    insert into public.order_items (
      order_id,
      menu_item_id,
      item_name_snapshot,
      base_price_snapshot,
      final_unit_price,
      quantity,
      line_total,
      customization_json,
      notes
    )
    values (
      created_order.id,
      case
        when nullif(btrim(coalesce(item_payload ->> 'menuItemId', '')), '') is null then null
        else (item_payload ->> 'menuItemId')::uuid
      end,
      item_name_snapshot,
      base_price_snapshot,
      final_unit_price,
      item_quantity,
      line_total_value,
      coalesce(item_payload -> 'customization', '{}'::jsonb),
      nullif(btrim(coalesce(item_payload ->> 'notes', '')), '')
    );
  end loop;

  return jsonb_build_object(
    'orderId', created_order.id,
    'orderNumber', created_order.order_number,
    'status', created_order.status,
    'subtotal', created_order.subtotal,
    'deliveryFee', created_order.delivery_fee,
    'total', created_order.total,
    'createdAt', created_order.created_at
  );
end;
$$;

revoke all on function public.create_public_order(jsonb) from public;
grant execute on function public.create_public_order(jsonb) to anon;
grant execute on function public.create_public_order(jsonb) to authenticated;

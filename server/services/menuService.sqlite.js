import { getDatabase } from '../db/database.js';
import { HttpError } from '../utils/httpError.js';

function proxyMediaUrl(url) {
  if (!url) {
    return '';
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'images.unsplash.com') {
      return `/api/media?src=${encodeURIComponent(url)}`;
    }

    return url;
  } catch {
    return url;
  }
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeMenuItem(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    name: row.name,
    slug: row.slug,
    description: row.description,
    basePrice: Number(row.base_price),
    imageUrl: proxyMediaUrl(row.image_url || ''),
    tags: parseJsonArray(row.tags),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    sortOrder: row.sort_order ?? 0,
    hasCustomization: Boolean(row.has_customization),
  };
}

function normalizeIngredient(row) {
  return {
    id: row.id,
    ingredientId: row.ingredient_id,
    name: row.name,
    slug: row.slug,
    allergenInfo: row.allergen_info || null,
    isRemovable: row.is_removable === null ? null : Boolean(row.is_removable),
    sortOrder: row.sort_order ?? 0,
  };
}

function normalizeExtra(row) {
  return {
    id: row.id,
    extraIngredientId: row.id,
    ingredientId: row.ingredient_id,
    name: row.name,
    slug: row.slug,
    allergenInfo: row.allergen_info || null,
    extraPrice: Number(row.extra_price),
    sortOrder: row.sort_order ?? 0,
  };
}

function normalizeOption(row) {
  return {
    id: row.id,
    groupName: row.option_group_name,
    groupSlug: row.option_group_slug,
    optionName: row.option_name,
    priceDelta: Number(row.price_delta),
    isDefault: Boolean(row.is_default),
    sortOrder: row.sort_order ?? 0,
  };
}

function groupOptions(optionRows) {
  const groupMap = new Map();

  optionRows.forEach((option) => {
    const existingGroup = groupMap.get(option.groupSlug);

    if (existingGroup) {
      existingGroup.options.push(option);
      return;
    }

    groupMap.set(option.groupSlug, {
      name: option.groupName,
      slug: option.groupSlug,
      options: [option],
    });
  });

  return [...groupMap.values()].map((group) => ({
    ...group,
    options: group.options.sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id),
  }));
}

const baseMenuItemSelect = `
  select
    menu_items.id,
    menu_items.category_id,
    categories.slug as category_slug,
    menu_items.name,
    menu_items.slug,
    menu_items.description,
    menu_items.base_price,
    menu_items.image_url,
    menu_items.tags,
    menu_items.active,
    menu_items.featured,
    menu_items.sort_order,
    exists (
      select 1
      from menu_item_ingredients
      where menu_item_ingredients.menu_item_id = menu_items.id
        and menu_item_ingredients.is_removable = 1
    )
    or exists (
      select 1
      from menu_item_allowed_extras
      inner join extra_ingredients on extra_ingredients.id = menu_item_allowed_extras.extra_ingredient_id
      where menu_item_allowed_extras.menu_item_id = menu_items.id
        and extra_ingredients.active = 1
    )
    or exists (
      select 1
      from product_options
      where product_options.menu_item_id = menu_items.id
        and product_options.active = 1
    ) as has_customization
  from menu_items
  inner join categories on categories.id = menu_items.category_id
`;

export function getActiveCategoriesSqlite(database = getDatabase()) {
  return database
    .prepare(
      `
        select id, name, slug, sort_order
        from categories
        where active = 1
        order by sort_order asc, name asc
      `,
    )
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sort_order ?? 0,
    }));
}

export function getActiveMenuItemsSqlite({ categorySlug } = {}, database = getDatabase()) {
  const filters = ['menu_items.active = 1', 'categories.active = 1'];
  const params = [];

  if (categorySlug) {
    filters.push('categories.slug = ?');
    params.push(categorySlug);
  }

  return database
    .prepare(
      `
        ${baseMenuItemSelect}
        where ${filters.join(' and ')}
        order by categories.sort_order asc, menu_items.sort_order asc, menu_items.name asc
      `,
    )
    .all(...params)
    .map(normalizeMenuItem);
}

export function getMenuCatalogSqlite(database = getDatabase()) {
  const categories = getActiveCategoriesSqlite(database);
  const items = getActiveMenuItemsSqlite({}, database);
  const itemsById = Object.fromEntries(items.map((item) => [String(item.id), item]));

  return {
    categories: categories
      .map((category) => ({
        ...category,
        items: items.filter((item) => item.categoryId === category.id),
      }))
      .filter((category) => category.items.length > 0),
    featuredItems: items.filter((item) => item.featured).slice(0, 4),
    itemsById,
  };
}

export function getMenuItemByIdSqlite(menuItemId, database = getDatabase()) {
  const row = database
    .prepare(
      `
        ${baseMenuItemSelect}
        where menu_items.id = ?
          and menu_items.active = 1
          and categories.active = 1
      `,
    )
    .get(Number(menuItemId));

  if (!row) {
    throw new HttpError(404, 'MENU_ITEM_NOT_FOUND', 'Questo prodotto non e disponibile.');
  }

  return normalizeMenuItem(row);
}

export function getMenuItemCustomizationSqlite(menuItemId, database = getDatabase()) {
  const normalizedMenuItemId = Number(menuItemId);
  const item = getMenuItemByIdSqlite(normalizedMenuItemId, database);

  const ingredientRows = database
    .prepare(
      `
        select
          menu_item_ingredients.id,
          ingredients.id as ingredient_id,
          ingredients.name,
          ingredients.slug,
          ingredients.allergen_info,
          menu_item_ingredients.is_removable,
          menu_item_ingredients.sort_order
        from menu_item_ingredients
        inner join ingredients on ingredients.id = menu_item_ingredients.ingredient_id
        where menu_item_ingredients.menu_item_id = ?
          and ingredients.active = 1
        order by menu_item_ingredients.sort_order asc, ingredients.name asc
      `,
    )
    .all(normalizedMenuItemId)
    .map(normalizeIngredient);

  const extraRows = database
    .prepare(
      `
        select
          extra_ingredients.id,
          extra_ingredients.ingredient_id,
          ingredients.name,
          ingredients.slug,
          ingredients.allergen_info,
          extra_ingredients.extra_price,
          extra_ingredients.sort_order
        from menu_item_allowed_extras
        inner join extra_ingredients on extra_ingredients.id = menu_item_allowed_extras.extra_ingredient_id
        inner join ingredients on ingredients.id = extra_ingredients.ingredient_id
        where menu_item_allowed_extras.menu_item_id = ?
          and extra_ingredients.active = 1
          and ingredients.active = 1
        order by extra_ingredients.sort_order asc, ingredients.name asc
      `,
    )
    .all(normalizedMenuItemId)
    .map(normalizeExtra);

  const optionGroups = groupOptions(
    database
      .prepare(
        `
          select
            id,
            option_group_name,
            option_group_slug,
            option_name,
            price_delta,
            is_default,
            sort_order
          from product_options
          where menu_item_id = ?
            and active = 1
          order by sort_order asc, option_group_slug asc, id asc
        `,
      )
      .all(normalizedMenuItemId)
      .map(normalizeOption),
  );

  return {
    item,
    defaultIngredients: ingredientRows,
    removableIngredients: ingredientRows.filter((ingredient) => ingredient.isRemovable),
    allowedExtras: extraRows,
    optionGroups,
    pricing: {
      currency: 'EUR',
      basePrice: item.basePrice,
    },
  };
}

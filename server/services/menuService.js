import { getDatabase } from '../db/database.js';

function parseListField(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function normalizeMenuItem(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url || '',
    tags: parseListField(row.tags),
    allergens: parseListField(row.allergens),
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    sortOrder: row.sort_order ?? 0,
  };
}

export function getPublicMenuCatalog(database = getDatabase()) {
  const categoryRows = database
    .prepare('select id, name, slug, sort_order from categories order by sort_order asc, name asc')
    .all();
  const itemRows = database
    .prepare(
      `
        select
          id,
          category_id,
          name,
          slug,
          description,
          price,
          image_url,
          tags,
          allergens,
          available,
          featured,
          sort_order
        from menu_items
        where available = 1
        order by sort_order asc, name asc
      `,
    )
    .all();

  const items = itemRows.map(normalizeMenuItem);
  const itemsById = Object.fromEntries(items.map((item) => [String(item.id), item]));

  const categories = categoryRows
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sort_order ?? 0,
      items: items.filter((item) => item.categoryId === row.id),
    }))
    .filter((category) => category.items.length > 0);

  return {
    categories,
    featuredItems: items.filter((item) => item.featured).slice(0, 4),
    itemsById,
  };
}

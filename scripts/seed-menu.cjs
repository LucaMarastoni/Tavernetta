#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

/**
 * CONFIG
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MENU_JSON_PATH =
  process.env.MENU_JSON_PATH || path.join(process.cwd(), "menu.json");
const CUSTOMIZABLE_CATEGORY_SLUGS = new Set([
  "le-pizze",
  "le-bianche",
  "le-speciali",
  "i-calzoni",
  "calzoni-in-fritteria",
]);
const DEFAULT_EXTRA_INGREDIENTS = [
  { ingredientSlug: "mozzarella", extraPrice: 1.5, sortOrder: 10 },
  { ingredientSlug: "bufala-campana-dop", extraPrice: 3, sortOrder: 20 },
  { ingredientSlug: "burrata", extraPrice: 3.5, sortOrder: 30 },
  { ingredientSlug: "stracciatella", extraPrice: 3, sortOrder: 40 },
  { ingredientSlug: "gorgonzola", extraPrice: 2, sortOrder: 50 },
  { ingredientSlug: "nduja", extraPrice: 2.5, sortOrder: 60 },
  { ingredientSlug: "salamino-piccante", extraPrice: 2.5, sortOrder: 70 },
  { ingredientSlug: "olive-nere", extraPrice: 1.2, sortOrder: 80 },
  { ingredientSlug: "funghi-freschi", extraPrice: 2, sortOrder: 90 },
  { ingredientSlug: "porcini", extraPrice: 2.5, sortOrder: 100 },
  { ingredientSlug: "prosciutto", extraPrice: 2.2, sortOrder: 110 },
  { ingredientSlug: "crudo-di-parma-dop-24-30-mesi", extraPrice: 3.5, sortOrder: 120 },
  { ingredientSlug: "scamorza-affumicata", extraPrice: 2.2, sortOrder: 130 },
  { ingredientSlug: "grana", extraPrice: 1.5, sortOrder: 140 },
  { ingredientSlug: "peperoni-grigliati", extraPrice: 1.8, sortOrder: 150 },
  { ingredientSlug: "cipolla", extraPrice: 1, sortOrder: 160 },
  { ingredientSlug: "tonno", extraPrice: 2.8, sortOrder: 170 },
  { ingredientSlug: "patate-cubettate-al-forno", extraPrice: 1.8, sortOrder: 180 },
  { ingredientSlug: "philadelphia", extraPrice: 2.2, sortOrder: 190 },
  { ingredientSlug: "basilico", extraPrice: 0.8, sortOrder: 200 },
];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Errore: devi impostare SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nelle variabili d'ambiente."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"]/g, "")
    .replace(/&/g, " e ")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

const CATEGORY_META_BY_KEY = {
  "le classiche": { name: "Le Classiche", slug: "le-pizze" },
  "le pizze": { name: "Le Classiche", slug: "le-pizze" },
  "le bianche": { name: "Le Bianche", slug: "le-bianche" },
  "le speciali": { name: "Le Speciali", slug: "le-speciali" },
  "i calzoni": { name: "I Calzoni", slug: "i-calzoni" },
  "calzoni in fritteria": {
    name: "Calzoni in Fritteria",
    slug: "calzoni-in-fritteria",
  },
};

function normalizeCategoryKey(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function loadMenuJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File menu non trovato: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!parsed || !Array.isArray(parsed.menu)) {
    throw new Error("Il JSON non contiene una chiave 'menu' valida.");
  }

  return parsed.menu;
}

function buildSeedData(menuSections) {
  const categories = [];
  const menuItems = [];
  const ingredientsMap = new Map();
  const menuItemIngredients = [];

  menuSections.forEach((section, categoryIndex) => {
    const rawCategoryName = normalizeText(section.categoria);
    const categoryMeta =
      CATEGORY_META_BY_KEY[normalizeCategoryKey(rawCategoryName)] || {
        name: rawCategoryName,
        slug: slugify(rawCategoryName),
      };
    const categoryName = categoryMeta.name;
    const categorySlug = categoryMeta.slug;

    categories.push({
      name: categoryName,
      slug: categorySlug,
      sort_order: categoryIndex + 1,
      active: true,
    });

    (section.items || []).forEach((item, itemIndex) => {
      const itemName = normalizeText(item.nome);
      const itemSlug = `${categorySlug}-${slugify(itemName)}`;

      const ingredientList = Array.isArray(item.ingredienti)
        ? item.ingredienti.map(normalizeText).filter(Boolean)
        : [];

      const description = ingredientList.join(", ");

      menuItems.push({
        category_name: categoryName,
        category_slug: categorySlug,
        name: itemName,
        slug: itemSlug,
        description: description || null,
        base_price: Number(item.prezzo || 0),
        image_path: null,
        active: item.active !== false,
        featured: false,
        sort_order: itemIndex + 1,
        spicy: Boolean(item.piccante),
        vegetarian: Boolean(item.vegetariana),
        note: item.note ? normalizeText(item.note) : null,
      });

      ingredientList.forEach((ingredientName, ingredientIndex) => {
        const ingredientSlug = slugify(ingredientName);
        const isCustomizableCategory = CUSTOMIZABLE_CATEGORY_SLUGS.has(categorySlug);

        if (!ingredientsMap.has(ingredientSlug)) {
          ingredientsMap.set(ingredientSlug, {
            name: ingredientName,
            slug: ingredientSlug,
            active: true,
          });
        }

        menuItemIngredients.push({
          menu_item_slug: itemSlug,
          ingredient_slug: ingredientSlug,
          is_removable: isCustomizableCategory,
          sort_order: ingredientIndex + 1,
        });
      });
    });
  });

  return {
    categories,
    menuItems,
    ingredients: Array.from(ingredientsMap.values()),
    menuItemIngredients,
  };
}

function chunkArray(array, size = 200) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function upsertInChunks(table, rows, onConflict) {
  if (!rows.length) {
    return;
  }

  for (const chunk of chunkArray(rows, 200)) {
    const { error } = await supabase.from(table).upsert(chunk, {
      onConflict,
    });

    if (error) {
      throw new Error(`Errore upsert su ${table}: ${error.message}`);
    }
  }
}

async function insertInChunks(table, rows) {
  if (!rows.length) {
    return;
  }

  for (const chunk of chunkArray(rows, 200)) {
    const { error } = await supabase.from(table).insert(chunk);

    if (error) {
      throw new Error(`Errore insert su ${table}: ${error.message}`);
    }
  }
}

async function runQuery(label, promise) {
  const { data, error } = await promise;
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
  return data;
}

async function syncExtraIngredients(ingredientBySlug) {
  const desiredExtras = DEFAULT_EXTRA_INGREDIENTS.map((extra) => {
    const ingredient = ingredientBySlug.get(extra.ingredientSlug);

    if (!ingredient) {
      throw new Error(
        `Ingrediente extra non trovato per slug: ${extra.ingredientSlug}`
      );
    }

    return {
      ingredient_id: ingredient.id,
      extra_price: extra.extraPrice,
      active: true,
      sort_order: extra.sortOrder,
    };
  });

  const ingredientIds = desiredExtras.map((extra) => extra.ingredient_id);
  const existingExtras = await runQuery(
    "Errore lettura extra_ingredients",
    supabase
      .from("extra_ingredients")
      .select("id, ingredient_id, extra_price, active, sort_order")
      .in("ingredient_id", ingredientIds)
  );

  const existingExtraByIngredientId = new Map(
    existingExtras.map((extra) => [String(extra.ingredient_id), extra])
  );
  const extrasToInsert = [];
  const extrasToUpdate = [];

  desiredExtras.forEach((extra) => {
    const existingExtra = existingExtraByIngredientId.get(
      String(extra.ingredient_id)
    );

    if (!existingExtra) {
      extrasToInsert.push(extra);
      return;
    }

    const priceChanged = Number(existingExtra.extra_price) !== extra.extra_price;
    const activeChanged = Boolean(existingExtra.active) !== extra.active;
    const sortOrderChanged =
      Number(existingExtra.sort_order) !== extra.sort_order;

    if (priceChanged || activeChanged || sortOrderChanged) {
      extrasToUpdate.push({
        id: existingExtra.id,
        ...extra,
      });
    }
  });

  await insertInChunks("extra_ingredients", extrasToInsert);

  for (const extra of extrasToUpdate) {
    const { error } = await supabase
      .from("extra_ingredients")
      .update({
        extra_price: extra.extra_price,
        active: extra.active,
        sort_order: extra.sort_order,
      })
      .eq("id", extra.id);

    if (error) {
      throw new Error(
        `Errore update su extra_ingredients: ${error.message}`
      );
    }
  }

  return runQuery(
    "Errore rilettura extra_ingredients",
    supabase
      .from("extra_ingredients")
      .select("id, ingredient_id")
      .in("ingredient_id", ingredientIds)
  );
}

async function main() {
  console.log("→ Lettura menu JSON...");
  const menuSections = loadMenuJson(MENU_JSON_PATH);

  console.log("→ Preparazione dati...");
  const { categories, menuItems, ingredients, menuItemIngredients } =
    buildSeedData(menuSections);

  console.log(`Categorie: ${categories.length}`);
  console.log(`Piatti: ${menuItems.length}`);
  console.log(`Ingredienti unici: ${ingredients.length}`);
  console.log(`Relazioni piatto-ingrediente: ${menuItemIngredients.length}`);

  console.log("→ Upsert categories...");
  await upsertInChunks("categories", categories, "slug");

  const categoriesFromDb = await runQuery(
    "Errore lettura categories",
    supabase.from("categories").select("id, name, slug")
  );

  const categoryBySlug = new Map(categoriesFromDb.map((c) => [c.slug, c]));

  const menuItemsForDb = menuItems.map((item) => {
    const category = categoryBySlug.get(item.category_slug);
    if (!category) {
      throw new Error(`Categoria non trovata per slug: ${item.category_slug}`);
    }

    return {
      category_id: category.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      base_price: item.base_price,
      image_path: item.image_path,
      active: item.active,
      featured: item.featured,
      sort_order: item.sort_order,
      spicy: item.spicy,
      vegetarian: item.vegetarian,
      note: item.note,
    };
  });

  console.log("→ Upsert menu_items...");
  await upsertInChunks("menu_items", menuItemsForDb, "slug");

  const menuItemsFromDb = await runQuery(
    "Errore lettura menu_items",
    supabase.from("menu_items").select("id, slug")
  );

  const menuItemBySlug = new Map(menuItemsFromDb.map((m) => [m.slug, m]));

  console.log("→ Upsert ingredients...");
  await upsertInChunks("ingredients", ingredients, "slug");

  const ingredientsFromDb = await runQuery(
    "Errore lettura ingredients",
    supabase.from("ingredients").select("id, slug")
  );

  const ingredientBySlug = new Map(ingredientsFromDb.map((i) => [i.slug, i]));

  console.log("→ Upsert extra_ingredients...");
  const extraIngredientsFromDb = await syncExtraIngredients(ingredientBySlug);
  const extraIngredientByIngredientId = new Map(
    extraIngredientsFromDb.map((extra) => [String(extra.ingredient_id), extra])
  );

  console.log("→ Sincronizzazione menu_item_ingredients...");

  const touchedMenuItemIds = menuItemsForDb
    .map((item) => menuItemBySlug.get(item.slug)?.id)
    .filter(Boolean);

  for (const chunk of chunkArray(touchedMenuItemIds, 200)) {
    const { error } = await supabase
      .from("menu_item_ingredients")
      .delete()
      .in("menu_item_id", chunk);

    if (error) {
      throw new Error(
        `Errore delete su menu_item_ingredients: ${error.message}`
      );
    }
  }

  const relationsForDb = menuItemIngredients.map((rel) => {
    const menuItem = menuItemBySlug.get(rel.menu_item_slug);
    const ingredient = ingredientBySlug.get(rel.ingredient_slug);

    if (!menuItem) {
      throw new Error(
        `Piatto non trovato per slug relazione: ${rel.menu_item_slug}`
      );
    }

    if (!ingredient) {
      throw new Error(
        `Ingrediente non trovato per slug relazione: ${rel.ingredient_slug}`
      );
    }

    return {
      menu_item_id: menuItem.id,
      ingredient_id: ingredient.id,
      is_removable: rel.is_removable,
      sort_order: rel.sort_order,
    };
  });

  for (const chunk of chunkArray(relationsForDb, 500)) {
    const { error } = await supabase
      .from("menu_item_ingredients")
      .insert(chunk);

    if (error) {
      throw new Error(
        `Errore insert su menu_item_ingredients: ${error.message}`
      );
    }
  }

  console.log("→ Sincronizzazione menu_item_allowed_extras...");

  const menuItemIdsForExtras = menuItems
    .filter((item) => CUSTOMIZABLE_CATEGORY_SLUGS.has(item.category_slug))
    .map((item) => menuItemBySlug.get(item.slug)?.id)
    .filter(Boolean);

  for (const chunk of chunkArray(menuItemIdsForExtras, 200)) {
    const { error } = await supabase
      .from("menu_item_allowed_extras")
      .delete()
      .in("menu_item_id", chunk);

    if (error) {
      throw new Error(
        `Errore delete su menu_item_allowed_extras: ${error.message}`
      );
    }
  }

  const extraLinksForDb = menuItemIdsForExtras.flatMap((menuItemId) =>
    DEFAULT_EXTRA_INGREDIENTS.map((extra) => {
      const ingredient = ingredientBySlug.get(extra.ingredientSlug);
      const extraIngredient = ingredient
        ? extraIngredientByIngredientId.get(String(ingredient.id))
        : null;

      if (!extraIngredient) {
        throw new Error(
          `Extra non trovato per slug ingrediente: ${extra.ingredientSlug}`
        );
      }

      return {
        menu_item_id: menuItemId,
        extra_ingredient_id: extraIngredient.id,
      };
    })
  );

  for (const chunk of chunkArray(extraLinksForDb, 500)) {
    const { error } = await supabase
      .from("menu_item_allowed_extras")
      .insert(chunk);

    if (error) {
      throw new Error(
        `Errore insert su menu_item_allowed_extras: ${error.message}`
      );
    }
  }

  console.log("✅ Seed completato con successo.");
}

main().catch((err) => {
  console.error("❌ Seed fallito:");
  console.error(err.message);
  process.exit(1);
});

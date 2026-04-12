export const CUSTOMIZABLE_CATEGORY_SLUGS = new Set([
  'le-pizze',
  'le-bianche',
  'le-speciali',
  'i-calzoni',
  'calzoni-in-fritteria',
]);

const EXTRA_GROUPS = {
  formaggi: { id: 'formaggi', name: 'Formaggi', order: 10 },
  salumi: { id: 'salumi', name: 'Salumi', order: 20 },
  verdure: { id: 'verdure', name: 'Verdure e sapori', order: 30 },
  speciali: { id: 'speciali', name: 'Speciali', order: 40 },
  ingredienti: { id: 'ingredienti', name: 'Ingredienti', order: 90 },
};

const DEFAULT_EXTRA_PROFILES = [
  {
    slug: 'mozzarella',
    extraPrice: 1.5,
    sortOrder: 10,
    groupId: 'formaggi',
    labelWhenAbsent: 'Mozzarella',
    labelWhenPresent: 'Doppia mozzarella',
    allowWhenPresent: true,
  },
  {
    slug: 'bufala-campana-dop',
    extraPrice: 3,
    sortOrder: 20,
    groupId: 'formaggi',
    labelWhenAbsent: 'Bufala campana DOP',
    description: 'Aggiunta fuori cottura',
  },
  {
    slug: 'burrata',
    extraPrice: 3.5,
    sortOrder: 30,
    groupId: 'formaggi',
    labelWhenAbsent: 'Burrata',
  },
  {
    slug: 'stracciatella',
    extraPrice: 3,
    sortOrder: 40,
    groupId: 'formaggi',
    labelWhenAbsent: 'Stracciatella',
  },
  {
    slug: 'gorgonzola',
    extraPrice: 2,
    sortOrder: 50,
    groupId: 'formaggi',
    labelWhenAbsent: 'Gorgonzola',
  },
  {
    slug: 'grana',
    extraPrice: 1.5,
    sortOrder: 60,
    groupId: 'formaggi',
    labelWhenAbsent: 'Grana',
  },
  {
    slug: 'scamorza-affumicata',
    extraPrice: 2.2,
    sortOrder: 70,
    groupId: 'formaggi',
    labelWhenAbsent: 'Scamorza affumicata',
  },
  {
    slug: 'philadelphia',
    extraPrice: 2.2,
    sortOrder: 80,
    groupId: 'formaggi',
    labelWhenAbsent: 'Philadelphia',
  },
  {
    slug: 'nduja',
    extraPrice: 2.5,
    sortOrder: 90,
    groupId: 'salumi',
    labelWhenAbsent: "'Nduja",
  },
  {
    slug: 'salamino-piccante',
    extraPrice: 2.5,
    sortOrder: 100,
    groupId: 'salumi',
    labelWhenAbsent: 'Salamino piccante',
  },
  {
    slug: 'prosciutto',
    extraPrice: 2.2,
    sortOrder: 110,
    groupId: 'salumi',
    labelWhenAbsent: 'Prosciutto',
  },
  {
    slug: 'crudo-di-parma-dop-24-30-mesi',
    extraPrice: 3.5,
    sortOrder: 120,
    groupId: 'salumi',
    labelWhenAbsent: 'Crudo di Parma DOP',
  },
  {
    slug: 'tonno',
    extraPrice: 2.8,
    sortOrder: 130,
    groupId: 'speciali',
    labelWhenAbsent: 'Tonno',
  },
  {
    slug: 'funghi-freschi',
    extraPrice: 2,
    sortOrder: 140,
    groupId: 'verdure',
    labelWhenAbsent: 'Funghi freschi',
  },
  {
    slug: 'porcini',
    extraPrice: 2.5,
    sortOrder: 150,
    groupId: 'verdure',
    labelWhenAbsent: 'Porcini',
  },
  {
    slug: 'peperoni-grigliati',
    extraPrice: 1.8,
    sortOrder: 160,
    groupId: 'verdure',
    labelWhenAbsent: 'Peperoni grigliati',
  },
  {
    slug: 'cipolla',
    extraPrice: 1,
    sortOrder: 170,
    groupId: 'verdure',
    labelWhenAbsent: 'Cipolla',
  },
  {
    slug: 'olive-nere',
    extraPrice: 1.2,
    sortOrder: 180,
    groupId: 'verdure',
    labelWhenAbsent: 'Olive nere',
  },
  {
    slug: 'patate-cubettate-al-forno',
    extraPrice: 1.8,
    sortOrder: 190,
    groupId: 'verdure',
    labelWhenAbsent: 'Patate al forno',
  },
  {
    slug: 'basilico',
    extraPrice: 0.8,
    sortOrder: 200,
    groupId: 'verdure',
    labelWhenAbsent: 'Basilico fresco',
  },
];

const EXTRA_PROFILE_BY_SLUG = new Map(DEFAULT_EXTRA_PROFILES.map((profile) => [profile.slug, profile]));
const EXTRA_GROUP_ORDER_FALLBACK = EXTRA_GROUPS.ingredienti.order;

const EXTRA_GROUP_PATTERNS = {
  formaggi: [
    'mozzarella',
    'bufala',
    'burrata',
    'stracciatella',
    'gorgonzola',
    'grana',
    'scamorza',
    'philadelphia',
    'ricotta',
    'brie',
    'emmenthal',
    'stracchino',
    'caciocavallo',
    'pecorino',
    'monte-veronese',
  ],
  salumi: [
    'nduja',
    'salamino',
    'prosciutto',
    'crudo',
    'speck',
    'pancetta',
    'guanciale',
    'wurstel',
    'tastasal',
    'mortadella',
    'coppa',
    'soppressa',
    'lombo',
  ],
  verdure: [
    'pomodoro',
    'pomodorini',
    'funghi',
    'porcini',
    'peperoni',
    'cipolla',
    'olive',
    'patate',
    'basilico',
    'carciof',
    'radicchio',
    'zucchine',
    'melanzane',
    'rucola',
    'friarielli',
    'verdure',
    'porro',
    'prezzemolo',
    'origano',
    'aglio',
    'rosmarino',
    'capperi',
    'pepe',
    'peperoncin',
    'olio',
    'spinaci',
  ],
  speciali: [
    'tonno',
    'acciugh',
    'mare',
    'polpo',
    'cozze',
    'gamber',
    'pistacchio',
    'amarone',
    'pesto',
    'pinoli',
    'noci',
    'uovo',
    'tentacoli',
    'gelatina',
    'carbonara',
  ],
};

const CHEESE_PATTERNS = EXTRA_GROUP_PATTERNS.formaggi;
const DOUGH_PREMIUM_PATTERNS = ['integrale', 'carbone'];
const DOUBLE_DOUGH_PATTERNS = ['doppio-impasto', 'doppio impasto'];
const BURRATA_STRACCIATELLA_PATTERNS = ['burrata', 'stracciatella'];
const BUFFALO_PATTERNS = ['bufala'];
const POTATO_PATTERNS = ['patate-cubettate-al-forno', 'patatine-fritte', 'patate-fritte'];
const AFFETTATI_PATTERNS = [
  'prosciutto',
  'crudo',
  'speck',
  'mortadella',
  'pancetta',
  'guanciale',
  'coppa',
  'soppressa',
  'lombo',
  'salamino',
];
const ONE_AND_HALF_PATTERNS = ['acciugh', 'porcini', 'pesto', 'olive', 'taggiasch', 'misto-bosco', 'nduja'];

function cleanInlineText(value = '') {
  if (value === null || value === undefined) {
    return '';
  }

  return value
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
}

function normalizeText(value = '') {
  if (value === null || value === undefined) {
    return '';
  }

  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function slugify(value = '') {
  return normalizeText(value)
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeNumber(value, fallbackValue = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function matchesPattern(value, patterns = []) {
  return patterns.some((pattern) => value.includes(pattern));
}

function getExtraGroupOrder(groupId) {
  return EXTRA_GROUPS[groupId]?.order ?? EXTRA_GROUP_ORDER_FALLBACK;
}

function inferExtraGroupId(slug, name = '') {
  const normalizedValue = cleanInlineText(slug) || slugify(name);

  if (matchesPattern(normalizedValue, EXTRA_GROUP_PATTERNS.formaggi)) {
    return 'formaggi';
  }

  if (matchesPattern(normalizedValue, EXTRA_GROUP_PATTERNS.salumi)) {
    return 'salumi';
  }

  if (matchesPattern(normalizedValue, EXTRA_GROUP_PATTERNS.verdure)) {
    return 'verdure';
  }

  if (matchesPattern(normalizedValue, EXTRA_GROUP_PATTERNS.speciali)) {
    return 'speciali';
  }

  return 'ingredienti';
}

function resolveFixedExtraPrice(slug, groupId) {
  if (matchesPattern(slug, BURRATA_STRACCIATELLA_PATTERNS)) {
    return 3;
  }

  if (matchesPattern(slug, BUFFALO_PATTERNS)) {
    return 3;
  }

  if (matchesPattern(slug, AFFETTATI_PATTERNS)) {
    return 3;
  }

  if (matchesPattern(slug, POTATO_PATTERNS)) {
    return 2;
  }

  if (groupId === 'formaggi' || matchesPattern(slug, CHEESE_PATTERNS)) {
    return 2;
  }

  if (matchesPattern(slug, ONE_AND_HALF_PATTERNS)) {
    return 1.5;
  }

  return null;
}

function inferGenericExtraPrice(slug, groupId) {
  const fixedPrice = resolveFixedExtraPrice(slug, groupId);

  if (fixedPrice !== null) {
    return fixedPrice;
  }

  return 1.1;
}

function sortAllowedExtras(left, right) {
  return (
    getExtraGroupOrder(left.groupId) - getExtraGroupOrder(right.groupId) ||
    normalizeNumber(left.sortOrder) - normalizeNumber(right.sortOrder) ||
    left.name.localeCompare(right.name, 'it', { sensitivity: 'base' })
  );
}

function createSyntheticExtraId(ingredientId, slug, name) {
  const stableIngredientId = cleanInlineText(ingredientId) || slug || slugify(name);
  return `ingredient:${stableIngredientId}`;
}

export function createDefaultAllowedExtras(itemId) {
  return DEFAULT_EXTRA_PROFILES.map((profile, index) => {
    const extraId = itemId * 1000 + 500 + index + 1;

    return {
      id: extraId,
      extraIngredientId: extraId,
      ingredientId: extraId,
      name: profile.labelWhenAbsent,
      slug: profile.slug,
      description: profile.description || '',
      extraPrice: profile.extraPrice,
      sortOrder: profile.sortOrder,
    };
  });
}

export function curateAllowedExtras(defaultIngredients = [], allowedExtras = []) {
  const defaultIngredientSlugs = new Set(
    defaultIngredients
      .map((ingredient) => cleanInlineText(ingredient.slug) || slugify(ingredient.name))
      .filter(Boolean),
  );

  return allowedExtras
    .map((extra, index) => {
      const normalizedSlug = cleanInlineText(extra.slug) || slugify(extra.name);
      const profile = EXTRA_PROFILE_BY_SLUG.get(normalizedSlug);
      const group = EXTRA_GROUPS[profile?.groupId] ?? EXTRA_GROUPS.ingredienti;
      const isAlreadyOnItem = defaultIngredientSlugs.has(normalizedSlug);

      if (isAlreadyOnItem && !(profile?.allowWhenPresent ?? false)) {
        return null;
      }

      const displayName = isAlreadyOnItem
        ? cleanInlineText(profile?.labelWhenPresent || profile?.labelWhenAbsent || extra.name)
        : cleanInlineText(profile?.labelWhenAbsent || extra.name);

      return {
        ...extra,
        name: displayName,
        slug: normalizedSlug,
        description: cleanInlineText(extra.description || profile?.description || ''),
        groupId: group.id,
        groupName: group.name,
        sortOrder: normalizeNumber(profile?.sortOrder ?? extra.sortOrder, index + 1),
      };
    })
    .filter(Boolean)
    .sort(sortAllowedExtras);
}

export function buildAllowedExtrasFromIngredientCatalog(
  defaultIngredients = [],
  ingredientCatalog = [],
  explicitExtras = [],
) {
  const defaultIngredientSlugs = new Set(
    defaultIngredients
      .map((ingredient) => cleanInlineText(ingredient.slug) || slugify(ingredient.name))
      .filter(Boolean),
  );

  const explicitExtrasByIngredientId = new Map(
    explicitExtras
      .map((extra) => [cleanInlineText(extra.ingredientId), extra])
      .filter(([ingredientId]) => Boolean(ingredientId)),
  );
  const explicitExtrasBySlug = new Map(
    explicitExtras
      .map((extra) => [cleanInlineText(extra.slug) || slugify(extra.name), extra])
      .filter(([slug]) => Boolean(slug)),
  );

  return ingredientCatalog
    .map((ingredient, index) => {
      const ingredientId = cleanInlineText(ingredient.ingredientId ?? ingredient.id);
      const normalizedSlug = cleanInlineText(ingredient.slug) || slugify(ingredient.name);
      const explicitExtra = explicitExtrasByIngredientId.get(ingredientId) ?? explicitExtrasBySlug.get(normalizedSlug);
      const profile = EXTRA_PROFILE_BY_SLUG.get(normalizedSlug);
      const groupId = profile?.groupId ?? inferExtraGroupId(normalizedSlug, ingredient.name);
      const group = EXTRA_GROUPS[groupId] ?? EXTRA_GROUPS.ingredienti;
      const isAlreadyOnItem = defaultIngredientSlugs.has(normalizedSlug);
      const baseName = cleanInlineText(ingredient.name);
      const displayName = isAlreadyOnItem
        ? cleanInlineText(profile?.labelWhenPresent || `Extra ${baseName}`)
        : cleanInlineText(profile?.labelWhenAbsent || explicitExtra?.name || baseName);
      const fixedPrice = resolveFixedExtraPrice(normalizedSlug, group.id);

      return {
        id: cleanInlineText(explicitExtra?.id ?? explicitExtra?.extraIngredientId) || createSyntheticExtraId(ingredientId, normalizedSlug, baseName),
        extraIngredientId:
          cleanInlineText(explicitExtra?.extraIngredientId ?? explicitExtra?.id) ||
          createSyntheticExtraId(ingredientId, normalizedSlug, baseName),
        ingredientId,
        name: displayName,
        slug: normalizedSlug,
        allergenInfo: ingredient.allergenInfo ?? explicitExtra?.allergenInfo ?? null,
        description: cleanInlineText(explicitExtra?.description || profile?.description || ''),
        extraPrice:
          fixedPrice ??
          normalizeNumber(explicitExtra?.extraPrice ?? profile?.extraPrice, inferGenericExtraPrice(normalizedSlug, group.id)),
        groupId: group.id,
        groupName: group.name,
        sortOrder: normalizeNumber(explicitExtra?.sortOrder ?? profile?.sortOrder, getExtraGroupOrder(group.id) * 100 + index + 1),
      };
    })
    .filter((extra) => Boolean(extra.name) && Boolean(extra.ingredientId))
    .sort(sortAllowedExtras);
}

export function resolveOptionPriceDelta(optionName, priceDelta = 0, groupName = '') {
  const normalizedOption = slugify(optionName);
  const normalizedGroup = slugify(groupName);
  const isDoughOption = normalizedGroup.includes('impasto') || normalizedOption.includes('impasto');

  if (!isDoughOption) {
    return normalizeNumber(priceDelta);
  }

  if (matchesPattern(normalizedOption, DOUBLE_DOUGH_PATTERNS)) {
    return 2;
  }

  if (matchesPattern(normalizedOption, DOUGH_PREMIUM_PATTERNS)) {
    return 1.5;
  }

  return normalizeNumber(priceDelta);
}

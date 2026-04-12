const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const MENU_GROUPS = [
  {
    id: 'degustazione',
    title: 'Degustazione',
    description: 'Un percorso introduttivo pensato per menu degustazione e formule guidate.',
    ctaLabel: 'Vai alla carta',
    patterns: [/degust/i, /tasting/i],
  },
  {
    id: 'classiche',
    title: 'Classiche',
    description: 'La selezione classica del forno, con le pizze della carta tradizionale.',
    ctaLabel: 'Apri sezione',
    slugs: ['le-pizze'],
  },
  {
    id: 'bianche',
    title: 'Bianche',
    description: 'Le pizze bianche della casa, piu cremose e avvolgenti.',
    ctaLabel: 'Apri sezione',
    slugs: ['le-bianche'],
  },
  {
    id: 'speciali',
    title: 'Speciali',
    description: 'Le proposte piu identitarie e ricercate del menu pizza.',
    ctaLabel: 'Apri sezione',
    slugs: ['le-speciali'],
  },
  {
    id: 'calzoni',
    title: 'Calzoni',
    description: 'I calzoni del forno, dalla versione tradizionale alle interpretazioni piu ricche.',
    ctaLabel: 'Apri sezione',
    slugs: ['i-calzoni'],
  },
  {
    id: 'fritteria',
    title: 'Fritteria',
    description: 'I calzoni fritti gia presenti in carta, raccolti in una sezione dedicata.',
    ctaLabel: 'Apri sezione',
    slugs: ['calzoni-in-fritteria'],
  },
  {
    id: 'birre',
    title: 'Birre',
    description: 'Una selezione dedicata alle spine e alle etichette artigianali da abbinare alla tavola.',
    ctaLabel: 'Vai alla carta',
    patterns: [/birr/i, /beer/i, /lager/i, /ipa/i],
  },
  {
    id: 'vini',
    title: 'Vini',
    description: 'La carta vini con bottiglie, calici e pairing costruiti attorno alla cucina.',
    ctaLabel: 'Vai alla carta',
    patterns: [/vin/i, /wine/i, /cantina/i, /calic/i, /bottigli/i],
  },
];

const summarizeCategoryNames = (categories) => {
  if (!categories.length) {
    return 'Sezione predisposta';
  }

  const names = categories.map((category) => category.name);

  if (names.length <= 2) {
    return names.join(' • ');
  }

  return `${names.slice(0, 2).join(' • ')} • +${names.length - 2} sezioni`;
};

export const buildMenuGroups = (categories) =>
  MENU_GROUPS.map((group) => {
    const matchedCategories = categories.filter((category) => {
      const normalizedName = normalizeText(category.name);
      const normalizedSlug = normalizeText(category.slug ?? '');
      const haystack = `${normalizedName} ${normalizedSlug}`;
      const matchesDeclaredSlug = (group.slugs ?? []).some((slug) => normalizedSlug === normalizeText(slug));

      if (matchesDeclaredSlug) {
        return true;
      }

      return (group.patterns ?? []).some((pattern) => pattern.test(haystack));
    });

    return {
      ...group,
      categories: matchedCategories,
      itemCount: matchedCategories.reduce((total, category) => total + category.items.length, 0),
      categorySummary: summarizeCategoryNames(matchedCategories),
      isAvailable: matchedCategories.length > 0,
    };
  });

export const buildMenuCategoryHref = (groupId) => {
  const group = MENU_GROUPS.find((entry) => entry.id === groupId);
  const defaultGroupId = MENU_GROUPS.find((entry) => entry.slugs?.length)?.id;

  if (!group?.slugs?.length) {
    return '/menu/pizze';
  }

  if (groupId === defaultGroupId) {
    return '/menu/pizze';
  }

  return `/menu/pizze?categoria=${encodeURIComponent(groupId)}`;
};

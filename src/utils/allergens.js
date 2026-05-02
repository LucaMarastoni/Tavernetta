export const ALLERGEN_LABELS = {
  1: 'Frutta a guscio',
  2: 'Latte e derivati',
  3: 'Congelati',
  4: 'Glutine',
  5: 'Uova e derivati',
  6: 'Pesce',
  7: 'Molluschi',
  8: 'Crostacei',
};

export function formatAllergenLabel(code) {
  return ALLERGEN_LABELS[Number(code)] ?? `Allergene ${code}`;
}

export function formatAllergenList(allergens = []) {
  return allergens.map(formatAllergenLabel).join(', ');
}

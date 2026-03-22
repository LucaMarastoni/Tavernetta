import { getLocalMenuCatalog, getLocalMenuItemCustomization } from '../data/menuCatalog';

export async function fetchMenuCatalog() {
  return getLocalMenuCatalog();
}

export async function fetchMenuItemCustomization(menuItemId) {
  return getLocalMenuItemCustomization(menuItemId);
}

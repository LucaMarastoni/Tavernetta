import { apiGet } from '../lib/apiClient';

export async function fetchMenuCatalog() {
  return apiGet('/api/menu');
}

export async function fetchMenuItemCustomization(menuItemId) {
  return apiGet(`/api/menu-items/${encodeURIComponent(String(menuItemId))}/customization`);
}

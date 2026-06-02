import { apiGet } from '../lib/apiClient';
import {
  fetchMenuCatalogFromSupabase,
  fetchMenuItemCustomizationFromSupabase,
} from './menuSupabaseApi';

const isStaticExport = import.meta.env.VITE_STATIC_EXPORT === 'true';

export async function fetchMenuCatalog() {
  if (isStaticExport) {
    return fetchMenuCatalogFromSupabase();
  }

  return apiGet('/api/menu');
}

export async function fetchMenuItemCustomization(menuItemId) {
  if (isStaticExport) {
    return fetchMenuItemCustomizationFromSupabase(menuItemId);
  }

  return apiGet(`/api/menu-items/${encodeURIComponent(String(menuItemId))}/customization`);
}

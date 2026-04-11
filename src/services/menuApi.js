import { apiGet } from '../lib/apiClient';
import { getLocalMenuCatalog, getLocalMenuItemCustomization } from '../data/menuCatalog';
import {
  canUseSupabaseMenuSource,
  fetchMenuCatalogFromSupabase,
  fetchMenuItemCustomizationFromSupabase,
} from './menuSupabaseApi';

const isStaticExport = import.meta.env.VITE_STATIC_EXPORT === 'true';

export async function fetchMenuCatalog() {
  if (isStaticExport) {
    if (canUseSupabaseMenuSource()) {
      return fetchMenuCatalogFromSupabase();
    }

    return getLocalMenuCatalog();
  }

  return apiGet('/api/menu');
}

export async function fetchMenuItemCustomization(menuItemId) {
  if (isStaticExport) {
    if (canUseSupabaseMenuSource()) {
      return fetchMenuItemCustomizationFromSupabase(menuItemId);
    }

    return getLocalMenuItemCustomization(menuItemId);
  }

  return apiGet(`/api/menu-items/${encodeURIComponent(String(menuItemId))}/customization`);
}

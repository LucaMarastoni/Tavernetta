import { apiGet, apiPatch } from '../lib/apiClient';
import {
  canUseSupabaseAdminSource,
  fetchAdminOrdersFromSupabase,
  updateAdminOrderFromSupabase,
} from './adminSupabaseApi';

const isStaticExport = import.meta.env.VITE_STATIC_EXPORT === 'true';

export class AdminOrdersApiError extends Error {
  constructor(message, code = 'ADMIN_ORDERS_API_FAILED') {
    super(message);
    this.name = 'AdminOrdersApiError';
    this.code = code;
  }
}

function mapAdminOrdersError(error) {
  const code = error.code || 'ADMIN_ORDERS_API_FAILED';

  switch (code) {
    case 'SUPABASE_NOT_CONFIGURED':
      return new AdminOrdersApiError('Supabase non e configurato per l area admin statica.', code);
    case 'ADMIN_PUBLIC_POLICIES_MISSING':
      return new AdminOrdersApiError(
        'Manca la configurazione Supabase pubblica per l area admin. Esegui lo script SQL dedicato.',
        code,
      );
    case 'INVALID_ORDER_STATUS':
      return new AdminOrdersApiError('Lo stato ordine selezionato non e valido.', code);
    case 'ORDER_NOT_FOUND':
      return new AdminOrdersApiError('Ordine non trovato.', code);
    default:
      if (error.message?.includes('Failed to fetch')) {
        return new AdminOrdersApiError('Il servizio admin non e raggiungibile in questo momento.', code);
      }

      return new AdminOrdersApiError('Non siamo riusciti a leggere gli ordini ricevuti.', code);
  }
}

export function usesStaticAdminSource() {
  return isStaticExport;
}

export function canUseStaticAdminSource() {
  return isStaticExport && canUseSupabaseAdminSource();
}

export async function fetchAdminOrders() {
  try {
    if (canUseStaticAdminSource()) {
      return await fetchAdminOrdersFromSupabase();
    }

    const payload = await apiGet('/api/admin/orders');
    return Array.isArray(payload?.orders) ? payload.orders : [];
  } catch (error) {
    throw mapAdminOrdersError(error);
  }
}

export async function updateAdminOrder(orderId, status) {
  try {
    if (canUseStaticAdminSource()) {
      return await updateAdminOrderFromSupabase(orderId, status);
    }

    const payload = await apiPatch(`/api/admin/orders/${encodeURIComponent(String(orderId))}`, { status });
    return payload?.order ?? null;
  } catch (error) {
    throw mapAdminOrdersError(error);
  }
}

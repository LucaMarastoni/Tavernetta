import { apiGet } from '../lib/apiClient';
import { getBrowserSupabase, hasBrowserSupabaseConfig } from '../lib/supabaseBrowser';

export class OrderingSettingsApiError extends Error {
  constructor(message, code = 'ORDERING_SETTINGS_FAILED') {
    super(message);
    this.name = 'OrderingSettingsApiError';
    this.code = code;
  }
}

function normalizeStatus(value = {}) {
  return {
    ordersPaused: Boolean(value.ordersPaused ?? value.orders_paused),
    updatedAt: value.updatedAt ?? value.updated_at ?? null,
  };
}

function mapSettingsError(error) {
  const code = error?.code || 'ORDERING_SETTINGS_FAILED';

  if (code === 'PGRST202') {
    return new OrderingSettingsApiError(
      'La gestione vacanze non e ancora configurata su Supabase.',
      'ORDERING_SETTINGS_NOT_DEPLOYED',
    );
  }

  if (code === 'P0001' && error?.message === 'ADMIN_NOT_ALLOWED') {
    return new OrderingSettingsApiError('Il profilo non e autorizzato a modificare questa impostazione.', code);
  }

  if (error?.message?.includes('Failed to fetch')) {
    return new OrderingSettingsApiError('Supabase non e raggiungibile in questo momento.', code);
  }

  return new OrderingSettingsApiError(
    error?.message || 'Non riusciamo a leggere lo stato delle prenotazioni.',
    code,
  );
}

async function callStatusRpc() {
  const client = getBrowserSupabase();
  const { data, error } = await client.rpc('get_public_ordering_status');

  if (error) {
    throw mapSettingsError(error);
  }

  return normalizeStatus(typeof data === 'string' ? JSON.parse(data) : data);
}

export async function fetchOrderingStatus() {
  try {
    if (hasBrowserSupabaseConfig()) {
      return await callStatusRpc();
    }

    return normalizeStatus(await apiGet('/api/ordering-status'));
  } catch (error) {
    if (error instanceof OrderingSettingsApiError) {
      throw error;
    }

    throw mapSettingsError(error);
  }
}

export async function updateOrderingPaused(ordersPaused) {
  const client = getBrowserSupabase();

  if (!client) {
    throw new OrderingSettingsApiError(
      'Supabase Auth non e configurato per l area admin.',
      'SUPABASE_NOT_CONFIGURED',
    );
  }

  const { data, error } = await client.rpc('set_ordering_paused', {
    p_orders_paused: Boolean(ordersPaused),
  });

  if (error) {
    throw mapSettingsError(error);
  }

  return normalizeStatus(typeof data === 'string' ? JSON.parse(data) : data);
}

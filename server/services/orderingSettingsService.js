import { getSupabaseAdmin, hasSupabaseConfig } from '../lib/supabase.js';
import { HttpError } from '../utils/httpError.js';

const MISSING_RESOURCE_CODES = new Set(['42P01', '42703', 'PGRST204', 'PGRST205']);

function assertSupabaseConfig() {
  if (!hasSupabaseConfig()) {
    throw new HttpError(
      500,
      'SUPABASE_NOT_CONFIGURED',
      'Il servizio prenotazioni non e configurato.',
      'Configurazione server mancante.',
    );
  }
}

function isMissingResource(error) {
  return MISSING_RESOURCE_CODES.has(error?.code) || /Could not find|does not exist|schema cache/i.test(error?.message || '');
}

export async function getOrderingStatus({ allowMissing = false } = {}) {
  assertSupabaseConfig();

  const { data, error } = await getSupabaseAdmin()
    .from('restaurant_settings')
    .select('orders_paused, updated_at')
    .eq('id', true)
    .maybeSingle();

  if (error) {
    if (allowMissing && isMissingResource(error)) {
      return { ordersPaused: false, updatedAt: null };
    }

    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'Non riusciamo a leggere lo stato delle prenotazioni.',
      error.message,
    );
  }

  return {
    ordersPaused: Boolean(data?.orders_paused),
    updatedAt: data?.updated_at ?? null,
  };
}

export async function assertOrderingAvailable() {
  const status = await getOrderingStatus({ allowMissing: true });

  if (status.ordersPaused) {
    throw new HttpError(
      503,
      'ORDERING_PAUSED',
      'Siamo in vacanza: le prenotazioni sono temporaneamente sospese.',
    );
  }
}

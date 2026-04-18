import { apiPost } from '../lib/apiClient';
import { canUseSupabaseOrderSource, submitOrderToSupabase } from './orderSupabaseApi';

const isStaticExport = import.meta.env.VITE_STATIC_EXPORT === 'true';

export class OrderApiError extends Error {
  constructor(message, code = 'ORDER_SUBMIT_FAILED') {
    super(message);
    this.name = 'OrderApiError';
    this.code = code;
  }
}

function mapOrderApiError(error) {
  const code = error.code || error.message || 'ORDER_SUBMIT_FAILED';

  switch (code) {
    case 'EMPTY_CART':
      return new OrderApiError('Il carrello e vuoto. Aggiungi almeno un prodotto.', code);
    case 'INVALID_CUSTOMER_NAME':
      return new OrderApiError('Inserisci nome e cognome.', code);
    case 'INVALID_PHONE':
      return new OrderApiError('Inserisci un numero di telefono valido.', code);
    case 'INVALID_EMAIL':
      return new OrderApiError('L email non sembra valida.', code);
    case 'INVALID_ORDER_TYPE':
      return new OrderApiError('Scegli se desideri ritiro o consegna.', code);
    case 'PRIVACY_CONSENT_REQUIRED':
      return new OrderApiError('Per inviare l ordine devi accettare la privacy policy.', code);
    case 'ADDRESS_REQUIRED':
      return new OrderApiError('Per la consegna serve un indirizzo completo.', code);
    case 'PREFERRED_TIME_REQUIRED':
      return new OrderApiError('Seleziona l orario desiderato per ritiro o consegna.', code);
    case 'INVALID_PREFERRED_TIME':
      return new OrderApiError('L orario selezionato non e valido.', code);
    case 'PREFERRED_TIME_TOO_SOON':
      return new OrderApiError(
        'L orario scelto e troppo vicino. Seleziona un orario piu avanti rispetto adesso.',
        code,
      );
    case 'SUPABASE_NOT_CONFIGURED':
      return new OrderApiError('Supabase non e configurato per ricevere ordini dal sito statico.', code);
    case 'ORDER_RPC_NOT_DEPLOYED':
      return new OrderApiError(
        'La funzione ordini di Supabase non e ancora pubblicata. Esegui prima lo script SQL dedicato.',
        code,
      );
    case 'SUPABASE_ORDER_RPC_OUTDATED':
      return new OrderApiError(
        'La funzione ordini di Supabase e da aggiornare. Riesegui lo script SQL piu recente.',
        code,
      );
    case 'SUPABASE_ORDER_RPC_BLOCKED':
      return new OrderApiError(
        'Supabase sta bloccando il salvataggio dell ordine. Controlla la funzione SQL pubblica.',
        code,
      );
    case 'INVALID_OPTION_SELECTION':
    case 'INVALID_EXTRA_SELECTION':
    case 'INVALID_REMOVED_INGREDIENT':
      return new OrderApiError('Una personalizzazione non e piu valida. Aggiorna il menu e riprova.', code);
    case 'INVALID_MENU_ITEM':
    case 'MENU_ITEM_NOT_FOUND':
      return new OrderApiError('Uno o piu prodotti non sono piu disponibili.', code);
    case 'INVALID_QUANTITY':
      return new OrderApiError('Controlla le quantita presenti nel carrello.', code);
    case 'INVALID_ORDER_TOTAL':
      return new OrderApiError('Controlla il riepilogo ordine e riprova.', code);
    default:
      if (error.message?.includes('Failed to fetch')) {
        return new OrderApiError('Il servizio ordini non e raggiungibile in questo momento.', code);
      }

      return new OrderApiError('Non siamo riusciti a registrare l ordine. Riprova tra poco.', code);
  }
}

export async function submitOrder(payload) {
  if (isStaticExport) {
    if (!canUseSupabaseOrderSource()) {
      throw new OrderApiError(
        'Supabase non e configurato per ricevere ordini dal sito statico.',
        'SUPABASE_NOT_CONFIGURED',
      );
    }

    try {
      return await submitOrderToSupabase(payload);
    } catch (error) {
      throw mapOrderApiError(error);
    }
  }

  try {
    return await apiPost('/api/orders', payload);
  } catch (error) {
    throw mapOrderApiError(error);
  }
}

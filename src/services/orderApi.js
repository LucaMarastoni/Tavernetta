import { apiPost } from '../lib/apiClient';

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
    case 'INVALID_OPTION_SELECTION':
    case 'INVALID_EXTRA_SELECTION':
    case 'INVALID_REMOVED_INGREDIENT':
      return new OrderApiError('Una personalizzazione non e piu valida. Aggiorna il menu e riprova.', code);
    case 'INVALID_MENU_ITEM':
    case 'MENU_ITEM_NOT_FOUND':
      return new OrderApiError('Uno o piu prodotti non sono piu disponibili.', code);
    case 'INVALID_QUANTITY':
      return new OrderApiError('Controlla le quantita presenti nel carrello.', code);
    default:
      if (error.message?.includes('Failed to fetch')) {
        return new OrderApiError('Il servizio ordini non e raggiungibile in questo momento.', code);
      }

      return new OrderApiError('Non siamo riusciti a registrare l ordine. Riprova tra poco.', code);
  }
}

export async function submitOrder(payload) {
  if (isStaticExport) {
    throw new OrderApiError(
      'Gli ordini online non sono disponibili nella versione statica del sito. Contatta il ristorante telefonicamente per confermare la tua richiesta.',
      'STATIC_EXPORT_NO_ORDER_API',
    );
  }

  try {
    return await apiPost('/api/orders', payload);
  } catch (error) {
    throw mapOrderApiError(error);
  }
}

import { apiGet } from '../lib/apiClient';

export async function fetchPublicMenuCatalog() {
  try {
    return await apiGet('/api/menu');
  } catch (error) {
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Il server del menu non risponde. Avvia il progetto con `npm run dev` oppure `npm start`.');
    }

    throw new Error('Non riusciamo a caricare la carta in questo momento. Riprova tra poco.');
  }
}

import { useCookieContext } from '../context/CookieContext';

export function useCookieConsent() {
  return useCookieContext();
}

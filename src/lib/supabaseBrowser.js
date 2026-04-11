import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

let browserSupabaseClient = null;

export function hasBrowserSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getBrowserSupabase() {
  if (!hasBrowserSupabaseConfig()) {
    return null;
  }

  if (!browserSupabaseClient) {
    browserSupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return browserSupabaseClient;
}

export function getBrowserSupabaseStorageBucket() {
  return import.meta.env.VITE_SUPABASE_STORAGE_BUCKET?.trim() || '';
}

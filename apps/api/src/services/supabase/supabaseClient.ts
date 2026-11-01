import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../../config';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const key = config.supabaseServiceRoleKey || config.supabaseKey;
  return Boolean(config.supabaseUrl && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const key = config.supabaseServiceRoleKey || config.supabaseKey;
    supabaseInstance = createClient(config.supabaseUrl, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

/**
 * Checks connection health to Supabase by performing a lightweight query.
 */
export async function checkSupabaseHealth(): Promise<'connected' | 'disconnected' | 'not_configured'> {
  if (!isSupabaseConfigured()) {
    return 'not_configured';
  }

  try {
    const client = getSupabaseClient();
    if (!client) return 'not_configured';

    // Probe the users or research_sessions table, or Supabase root schema
    const { error } = await client.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, we still know Supabase endpoint answered
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        return 'connected';
      }
      console.warn('[Supabase Health] Ping returned error:', error.message);
      return 'disconnected';
    }

    return 'connected';
  } catch (err) {
    console.warn('[Supabase Health] Connection error:', err);
    return 'disconnected';
  }
}


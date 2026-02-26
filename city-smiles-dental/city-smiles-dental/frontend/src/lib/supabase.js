import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set — using demo mode with local state only.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    realtime: { params: { eventsPerSecond: 10 } },
  }
);

// ──────────────────────────────────────────────────────
// Generic realtime subscription helper
// Usage: subscribeToTable('patients', callback)
// ──────────────────────────────────────────────────────
export function subscribeToTable(table, callback) {
  const channel = supabase
    .channel(`realtime:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

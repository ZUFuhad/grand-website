import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Active Supabase Project: grwtylyqwxoqadwlzqkl
const defaultSupabaseUrl = 'https://grwtylyqwxoqadwlzqkl.supabase.co';
const defaultSupabasePublishableKey = 'sb_publishable_2nFoM67Qtkq6Waj8eyNalQ_tPvYvSZQ';

const supabaseUrl = localStorage.getItem('grand_supabase_url') || defaultSupabaseUrl;
const supabasePublishableKey = localStorage.getItem('grand_supabase_anon_key') || defaultSupabasePublishableKey;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

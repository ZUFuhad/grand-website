import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Active Supabase Project: grwtylyqwxoqadwlzqkl
export const DEFAULT_SUPABASE_PROJECT_ID = "grwtylyqwxoqadwlzqkl";
export const DEFAULT_SUPABASE_URL = "https://grwtylyqwxoqadwlzqkl.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_2nFoM67Qtkq6Waj8eyNalQ_tPvYvSZQ";

// Auto-heal / migrate old dead projects or corrupted localStorage
try {
  const currentSaved = localStorage.getItem("grand_supabase_url");
  if (
    !currentSaved ||
    currentSaved.includes("hqltwanywfeblxckpwgc") ||
    currentSaved.includes("dbddplawdicokffewuwz") ||
    !currentSaved.includes(".supabase.co")
  ) {
    localStorage.setItem("grand_supabase_url", DEFAULT_SUPABASE_URL);
    localStorage.setItem("grand_supabase_anon_key", DEFAULT_SUPABASE_ANON_KEY);
    localStorage.removeItem("grandProjects");
    localStorage.removeItem("grandClients");
  }
} catch (e) {
  // localStorage may be disabled in private mode
}

const supabaseUrl = localStorage.getItem("grand_supabase_url") || DEFAULT_SUPABASE_URL;
const supabasePublishableKey = localStorage.getItem("grand_supabase_anon_key") || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

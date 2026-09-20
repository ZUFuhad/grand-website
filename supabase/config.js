import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://hqltwanywfeblxckpwgc.supabase.co';
const supabasePublishableKey = 'sb_publishable_SBaXn12c7dFpe6Ofbs7W8A_BriV28uC';

// Keep the auth session separate from the large legacy localStorage CMS cache.
// sessionStorage survives refreshes in the current tab without competing for
// the localStorage quota used by imported project and client images.
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
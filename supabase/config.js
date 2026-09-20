import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://hqltwanywfeblxckpwgc.supabase.co';
const supabasePublishableKey = 'sb_publishable_SBaXn12c7dFpe6Ofbs7W8A_BriV28uC';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
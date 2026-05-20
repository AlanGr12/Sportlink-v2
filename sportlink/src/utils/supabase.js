import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://cczzvdaraenyqyujbsup.supabase.co"
;
const supabaseKey = "sb_publishable_bgIifhu-jA4l5wdIJDzT9w_k-dADfRM";

export const supabase = createClient(supabaseUrl, supabaseKey);
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { config } from '../../utils/config';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(config.supabaseUrl, config.supabasePublishableKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmqrchkzrkpxehnmayqw.supabase.co';
const supabaseAnonKey = 'sb_publishable_R2Vnz1IRMkb3DuHkQNQS8w_dl1arnYx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

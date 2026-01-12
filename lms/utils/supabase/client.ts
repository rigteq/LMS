import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lmqrchkzrkpxehnmayqw.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "sb_publishable_R2Vnz1IRMkb3DuHkQNQS8w_dl1arnYx";

export const createClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
    );

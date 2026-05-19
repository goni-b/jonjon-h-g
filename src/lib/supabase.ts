import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// When credentials are missing the app continues with mock data.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable Supabase.
export const supabase: SupabaseClient<Database> | null =
  url && key ? createClient<Database>(url, key) : null;

export const supabaseEnabled = supabase !== null;

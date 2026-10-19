import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://hiybrmedsoknemjphvvt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpeWJybWVkc29rbmVtanBodnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTc5OTIsImV4cCI6MjEwNzU5Mzk5Mn0.SWoD6ng1UEP1wKwH-gCbLYToB-Gt6nNq9xi2feMVgYw";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY ||
  "dummy-anon-key-for-build";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey ||
  "dummy-service-key-for-build";

// Client-side Supabase client (using anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Server-side Supabase client (using service role key for admin privileges)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});


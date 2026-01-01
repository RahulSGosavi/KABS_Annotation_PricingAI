import { createClient } from '@supabase/supabase-js';

// --- AWS MIGRATION CONFIGURATION ---

// 1. ENDPOINT
// This should point to your AWS EC2 Public IP or Domain.
// Example: 'http://54.123.45.67:8000' or 'https://api.yourdomain.com'
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL;

// 2. API KEY (ANON)
// This must be the 'anon' key generated from your AWS instance's JWT_SECRET.
// Do not use the SERVICE_ROLE_KEY here.
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Safety Check & Fallback
// If credentials are missing, we use a placeholder to prevent the app from crashing on load.
// Calls will simply fail or log errors instead of breaking the entire UI.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Supabase Credentials Missing! \n" +
    "Please create a .env file in the project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n" +
    "Refer to AWS_MIGRATION.md for details."
  );
}

// 3. INITIALIZE CLIENT
// We provide a fallback URL to satisfy the Supabase client constructor if env vars are missing.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_ANON_KEY || 'placeholder-key'
);

import { createClient } from '@supabase/supabase-js';

// 1. LOAD CONFIGURATION
// By default, these look for VITE_ prefixed variables in your .env file
// If those are missing, it falls back to the old cloud strings (for safety)
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jzgocimbraxghmvdqwno.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z29jaW1icmF4Z2htdmRxd25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzE1MDgsImV4cCI6MjA4MTY0NzUwOH0.tdwtf5fLG2omLFKowXP2p7C4z5zVeNR5UdDwHnmhVjE';

// 2. INITIALIZE CLIENT
// This client will now connect to whichever server is defined above (AWS EC2 Middleware or Cloud)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * AWS MIGRATION STATUS:
 * The application is configured for the AWS RDS + EC2 Architecture.
 * 
 * Instructions:
 * 1. Follow AWS_FULL_MIGRATION.md to set up RDS (Database) and EC2 (Middleware).
 * 2. Create a .env file in the root of this project.
 * 3. Add your VITE_SUPABASE_URL (EC2 IP) and VITE_SUPABASE_ANON_KEY.
 */
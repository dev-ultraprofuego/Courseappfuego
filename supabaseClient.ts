import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This will now throw an error during the build process if the environment variables 
// are not set, which is the desired behavior for a production deployment on Vercel.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
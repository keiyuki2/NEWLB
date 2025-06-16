
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

// ⬇️ Changed to use process.env for broader compatibility and to resolve TS errors without tsconfig changes.
// Vite specific `import.meta.env` was causing type errors.
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are available in process.env.
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

// Optional: add a warning if these are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    `❗ Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set up in your environment.`
  )
}

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!)

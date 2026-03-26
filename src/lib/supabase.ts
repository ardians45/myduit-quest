import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fallback values for Next.js build process when env vars are naturally missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xcvbnmasdfghjklqwertyuiop.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdkJObWFzRGZnaGpsS3F3ZXJ0eXVJT1AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMjMwMjMyMiwiZXhwIjoyMDE3ODc4MzIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

let supabaseInstance: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    if (typeof window === 'undefined') {
       // Return a dummy object for SSR to avoid crashing
       return () => ({ data: null, error: null }); 
    }
    
    // Only initialize on the client
    if (!supabaseInstance) {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    
    const instance = supabaseInstance as any;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('supabase-auth-token')?.value ?? '';

  const headersList = await headers();
  const forwardedHeaders: Record<string, string> = {};
  headersList.forEach((value, key) => {
    forwardedHeaders[key] = value;
  });

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        ...forwardedHeaders,
        ...(authCookie && { Authorization: `Bearer ${authCookie}` }),
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return supabase;
}

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  // Hardcoded for troubleshooting
  const supabaseUrl = 'https://fhzuoucnckcdycsndtil.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoenVvdWNuY2tjZHljc25kdGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTI5NjIsImV4cCI6MjA3ODY4ODk2Mn0.6FHUQ3i5kai0TZeerdTVGrGqzbOczeOJpgr23TntonA';

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
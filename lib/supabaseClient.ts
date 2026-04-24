import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${key}=`))
          ?.split("=")[1],
        set: (key, value) => {
          document.cookie = `${key}=${value}; path=/`;
        },
        remove: (key) => {
          document.cookie = `${key}=; Max-Age=0; path=/`;
        },
      },
    }
  );
}
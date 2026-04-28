import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  // No code = bad link
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", req.url)
    );
  }

  const redirectTo =
    next === "reset"
      ? new URL("/reset-password", req.url)
      : new URL("/email-verified", req.url);

  // Build response first — cookies are written onto THIS response object
  const response = NextResponse.redirect(redirectTo);

  // Must use req.cookies / response.cookies pattern — NOT next/headers cookies()
  // next/headers cookies() is read-only in Route Handlers and cannot write Set-Cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("❌ Code exchange failed:", error.message);
    return NextResponse.redirect(
      new URL("/login?error=expired_link", req.url)
    );
  }

  // Session cookie is now on `response` — browser receives it on redirect
  return response;
}
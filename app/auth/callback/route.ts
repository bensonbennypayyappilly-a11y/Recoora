import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", req.url)
    );
  }

  // Determine where to redirect after exchange
  const redirectTo =
    next === "reset"
      ? new URL("/reset-password", req.url)
      : new URL("/email-verified", req.url);

  const response = NextResponse.redirect(redirectTo);

  // ✅ Cookie-aware client using NextRequest/NextResponse
  // This is the ONLY pattern that actually writes cookies in Route Handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to both the request and the response
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
    console.error("❌ Auth exchange failed:", error.message);
    return NextResponse.redirect(
      new URL("/login?error=auth", req.url)
    );
  }

  // Session cookies are now written to `response` — return it
  return response;
}
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("🔵 CALLBACK HIT");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  console.log("🔵 Code from URL:", code);

  if (!code) {
    console.log("❌ No code found → redirect login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const response = NextResponse.redirect(new URL("/reset-password", req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          console.log("🍪 Setting cookies:", cookies.length);
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("🔵 Exchange result:", {
    hasSession: !!data.session,
    userId: data.session?.user?.id,
    error: error?.message,
  });

  if (error) {
    console.log("❌ Exchange failed → redirect login");
    return NextResponse.redirect(new URL("/login?error=exchange", req.url));
  }

  console.log("✅ Session created → redirecting to reset-password");

  return response;
}
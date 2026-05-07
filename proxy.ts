import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Never intercept the auth callback — it must run unmodified
  // The Route Handler sets its own cookies on its own response object
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  

  const { data: { session } } = await supabase.auth.getSession();


  let userExists = false;

if (session) {
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.user.id)
    .single();

  userExists = !!userRow;
}

  // Protect dashboard routes
  // ❌ No session → redirect
if (!session && pathname.startsWith("/dashboard")) {
  return NextResponse.redirect(new URL("/login", req.url));
}

// ❌ Session exists BUT user deleted from DB → force logout + redirect
if (session && !userExists && pathname.startsWith("/dashboard")) {
  const redirect = NextResponse.redirect(new URL("/login", req.url));

  // clear Supabase auth cookies
  redirect.cookies.delete("sb-access-token");
  redirect.cookies.delete("sb-refresh-token");

  return redirect;
}

  // Redirect authenticated users away from login/signup
  // Redirect ONLY if valid user exists in DB
if (
  session &&
  userExists &&
  (pathname.startsWith("/login") || pathname.startsWith("/signup"))
) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/auth/:path*"],
};
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the current URL path
  const path = req.nextUrl.pathname;
  
  // Rule 1: Dashboard requires authentication
  if (path.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // Rule 2: Login/Register can only be accessed when not logged in
  if ((path === "/login" || path === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  // Rule 3: Home page can be accessed by anyone (no redirection needed)
  
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/"],
};
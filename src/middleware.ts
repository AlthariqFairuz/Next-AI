import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    
    // Debug: Log all cookies
    console.log("All cookies:", req.cookies.getAll());
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookie = req.cookies.get(name)?.value;
            console.log(`Getting cookie ${name}:`, cookie ? "exists" : "missing");
            return cookie;
          },
          set(name, value, options) {
            console.log(`Setting cookie ${name}`);
            res.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name, options) {
            console.log(`Removing cookie ${name}`);
            res.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );
    
    const sessionResult = await supabase.auth.getSession();
    console.log("Session result:", sessionResult.data.session ? "exists" : "null");
  
  // First check session to avoid unnecessary API calls
  const { data: { session } } = await supabase.auth.getSession();
  
  // Routes that require authentication
  const protectedRoutes = ["/dashboard"];
  
  // Check if the current path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );
  
  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // Redirect to dashboard if accessing auth pages with active session
  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/"],
};
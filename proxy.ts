import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ["/cart", "/checkout"];

/**
 * Routes that require admin access
 */
const ADMIN_ROUTES = ["/admin"];

/**
 * Routes that should redirect authenticated users away (e.g., login page)
 */
const AUTH_REDIRECT_ROUTES = ["/login"];

/**
 * Check if a path matches any of the route prefixes
 */
function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    // Skip middleware if env vars missing (will fail at runtime anyway)
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refresh the session on every request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if route requires authentication
  const requiresAuth =
    matchesRoutes(pathname, PROTECTED_ROUTES) ||
    matchesRoutes(pathname, ADMIN_ROUTES);

  // Check if route requires admin access
  const requiresAdmin = matchesRoutes(pathname, ADMIN_ROUTES);

  // Redirect authenticated users away from login page
  const isAuthRedirectRoute = matchesRoutes(pathname, AUTH_REDIRECT_ROUTES);
  if (isAuthRedirectRoute && user) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Redirect unauthenticated users to login
  if (requiresAuth && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access for admin routes
  if (requiresAdmin && user) {
    // Query the User table to check isadmin flag
    // Note: PostgreSQL lowercases unquoted column names
    const { data: userData, error } = await supabase
      .from("User")
      .select("isadmin")
      .eq("supabaseid", user.id)
      .single();

    if (error || !userData?.isadmin) {
      // Non-admin users redirected to home
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

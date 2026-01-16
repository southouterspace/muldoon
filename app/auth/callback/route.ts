import { createServerClient } from "@supabase/ssr";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/supabase/admin";

function redirectToError(origin: string, error: string): NextResponse {
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(error)}`
  );
}

function createSupabaseClient(
  request: NextRequest,
  response: NextResponse,
  url: string,
  anonKey: string
) {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return redirectToError(origin, "missing_code");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    return redirectToError(origin, "missing_config");
  }

  // Create response to set cookies on
  const response = NextResponse.redirect(`${origin}/`);
  const supabase = createSupabaseClient(
    request,
    response,
    supabaseUrl,
    supabaseAnonKey
  );

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return redirectToError(origin, error?.message || "authentication_failed");
  }

  const supabaseId = data.user.id;
  const email = data.user.email;

  if (!email) {
    return redirectToError(origin, "missing_email");
  }

  const isAdmin = isAdminEmail(email);

  // Single RPC call handles user upsert and linked players check
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "handle_auth_callback",
    {
      p_supabase_id: supabaseId,
      p_email: email,
      p_is_admin: isAdmin,
    }
  );

  if (rpcError || !rpcResult || rpcResult.length === 0) {
    return redirectToError(origin, rpcError?.message || "user_creation_failed");
  }

  const { has_linked_players } = rpcResult[0];

  // Redirect to onboarding if no linked players
  if (!has_linked_players) {
    return NextResponse.redirect(`${origin}/onboarding/player`, {
      headers: response.headers,
    });
  }

  // Success - return response with cookies set (redirects to /)
  return response;
}

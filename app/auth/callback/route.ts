import { createServerClient } from "@supabase/ssr";

type SupabaseClientType = ReturnType<typeof createServerClient>;

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

async function getOrCreateUser(
  supabase: SupabaseClientType,
  supabaseId: string,
  email: string,
  isAdmin: boolean,
  origin: string
): Promise<{ userId: number } | { error: NextResponse }> {
  const { data: existingUser, error: selectError } = await supabase
    .from("User")
    .select("id, isadmin")
    .eq("supabaseid", supabaseId)
    .single();

  // PGRST116 = "No rows found" which is expected for new users
  if (selectError && selectError.code !== "PGRST116") {
    return { error: redirectToError(origin, selectError.message) };
  }

  if (existingUser) {
    // User exists - update isadmin if it changed
    if (existingUser.isadmin !== isAdmin) {
      const { error: updateError } = await supabase
        .from("User")
        .update({ isadmin: isAdmin, updatedAt: new Date().toISOString() })
        .eq("supabaseid", supabaseId);

      if (updateError) {
        return { error: redirectToError(origin, updateError.message) };
      }
    }
    return { userId: existingUser.id };
  }

  // New user - create record and get the ID
  const { data: newUser, error: insertError } = await supabase
    .from("User")
    .insert({ supabaseid: supabaseId, email, isadmin: isAdmin })
    .select("id")
    .single();

  if (insertError || !newUser) {
    return {
      error: redirectToError(
        origin,
        insertError?.message || "user_creation_failed"
      ),
    };
  }

  return { userId: newUser.id };
}

async function hasLinkedPlayers(
  supabase: SupabaseClientType,
  userId: number
): Promise<boolean> {
  const { data: linkedPlayers, error: playersError } = await supabase
    .from("UserPlayer")
    .select("playerId")
    .eq("userId", userId)
    .limit(1);

  if (playersError) {
    console.error("Error checking linked players:", playersError.message);
    return true; // Assume they have players on error to avoid blocking
  }

  return linkedPlayers !== null && linkedPlayers.length > 0;
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
  const userResult = await getOrCreateUser(
    supabase,
    supabaseId,
    email,
    isAdmin,
    origin
  );

  if ("error" in userResult) {
    return userResult.error;
  }

  // Check if user has linked players - redirect to onboarding if not
  const hasPlayers = await hasLinkedPlayers(supabase, userResult.userId);
  if (!hasPlayers) {
    return NextResponse.redirect(`${origin}/onboarding/player`, {
      headers: response.headers,
    });
  }

  // Success - return response with cookies set (redirects to /)
  return response;
}

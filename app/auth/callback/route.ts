import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/supabase/admin";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    return NextResponse.redirect(`${origin}/login?error=missing_config`);
  }

  // Create response to set cookies on
  const response = NextResponse.redirect(`${origin}/`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const errorMessage = error?.message || "authentication_failed";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  const supabaseId = data.user.id;
  const email = data.user.email;

  if (!email) {
    return NextResponse.redirect(`${origin}/login?error=missing_email`);
  }

  const isAdmin = isAdminEmail(email);

  // Check if user exists in User table
  const { data: existingUser, error: selectError } = await supabase
    .from("User")
    .select("id, isAdmin")
    .eq("supabaseId", supabaseId)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116 = "No rows found" which is expected for new users
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(selectError.message)}`
    );
  }

  if (existingUser) {
    // User exists - update isAdmin if it changed
    if (existingUser.isAdmin !== isAdmin) {
      const { error: updateError } = await supabase
        .from("User")
        .update({ isAdmin, updatedAt: new Date().toISOString() })
        .eq("supabaseId", supabaseId);

      if (updateError) {
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(updateError.message)}`
        );
      }
    }
  } else {
    // New user - create record
    const { error: insertError } = await supabase.from("User").insert({
      supabaseId,
      email,
      isAdmin,
    });

    if (insertError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(insertError.message)}`
      );
    }
  }

  // Success - return response with cookies set
  return response;
}

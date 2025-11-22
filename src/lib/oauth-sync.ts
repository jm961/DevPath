import { getSupabase } from "./supabase";
import Cookies from "js-cookie";
import { TOKEN_COOKIE_NAME } from "./jwt";

/**
 * Sync Supabase OAuth user with backend and get JWT token
 * This should be called after Supabase OAuth succeeds
 */
export async function syncOAuthUserWithBackend(
  provider: "google" | "github"
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase is not configured",
    };
  }

  try {
    // Get the current Supabase session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return {
        success: false,
        error: "No active session found",
      };
    }

    const session = sessionData.session;
    const user = session.user;

    // Get user metadata (name, email, etc.)
    const email = user.email;
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.display_name ||
      email?.split("@")[0] ||
      "User";

    // Call backend to sync user and get JWT token
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/v1-oauth-callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          name,
          provider,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.token) {
      return {
        success: false,
        error: data.message || "Failed to sync user with backend",
      };
    }

    // Set JWT token cookie
    Cookies.set(TOKEN_COOKIE_NAME, data.token, {
      expires: 7, // 7 days
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("OAuth sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

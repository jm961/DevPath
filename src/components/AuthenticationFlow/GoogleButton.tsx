import { useEffect, useState } from "preact/hooks";
import GoogleIcon from "../../icons/google.svg";
import SpinnerIcon from "../../icons/spinner.svg";
import { getSupabase } from "../../lib/supabase";
import { syncOAuthUserWithBackend } from "../../lib/oauth-sync";

type GoogleButtonProps = {};

const GOOGLE_REDIRECT_AT = "googleRedirectAt";
const GOOGLE_LAST_PAGE = "googleLastPage";

export function GoogleButton(props: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const icon = isLoading ? SpinnerIcon : GoogleIcon;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      console.error("Supabase not configured");
      return;
    }

    // Check if we're returning from OAuth callback
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (accessToken) {
      setIsLoading(true);

      // Supabase automatically sets the session
      supabase.auth.getSession().then(async ({ data, error }) => {
        if (error || !data.session) {
          setError("Something went wrong. Please try again later.");
          setIsLoading(false);
          return;
        }

        // Sync with backend and get JWT token
        const syncResult = await syncOAuthUserWithBackend("google");

        if (!syncResult.success) {
          setError(syncResult.error || "Failed to sync with backend");
          setIsLoading(false);
          return;
        }

        // Success! Session is set in Supabase and synced with backend
        let redirectUrl = "/";
        const googleRedirectAt = localStorage.getItem(GOOGLE_REDIRECT_AT);
        const lastPageBeforeGoogle = localStorage.getItem(GOOGLE_LAST_PAGE);

        if (googleRedirectAt && lastPageBeforeGoogle) {
          const socialRedirectAtTime = parseInt(googleRedirectAt, 10);
          const now = Date.now();
          const timeSinceRedirect = now - socialRedirectAtTime;

          if (timeSinceRedirect < 30 * 1000) {
            redirectUrl = lastPageBeforeGoogle;
          }
        }

        localStorage.removeItem(GOOGLE_REDIRECT_AT);
        localStorage.removeItem(GOOGLE_LAST_PAGE);

        // Clean up URL and redirect
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        window.location.href = redirectUrl;
      });
    }
  }, []);

  const handleClick = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Store current page for redirect after login
      if (!["/login", "/signup"].includes(window.location.pathname)) {
        localStorage.setItem(GOOGLE_REDIRECT_AT, Date.now().toString());
        localStorage.setItem(GOOGLE_LAST_PAGE, window.location.pathname);
      }

      // Use Supabase OAuth
      const supabase = getSupabase();
      if (!supabase) {
        setError(
          "Authentication is not configured. Please contact the site owner."
        );
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      });

      if (error) {
        console.error("Supabase OAuth error:", error);
        setError("Something went wrong. Please try again later.");
        setIsLoading(false);
      }
      // Supabase will redirect to Google, so we don't need to do anything else
    } catch (err) {
      console.error("OAuth error:", err);
      setError("Something went wrong. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        class="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-slate-300 bg-white p-2 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
        onClick={handleClick}
      >
        <img
          src={icon}
          alt="Google"
          class={`h-[18px] w-[18px] ${isLoading ? "animate-spin" : ""}`}
        />
        Continue with Google
      </button>
      {error && (
        <p className="mb-2 mt-1 text-sm font-medium text-red-600">{error}</p>
      )}
    </>
  );
}

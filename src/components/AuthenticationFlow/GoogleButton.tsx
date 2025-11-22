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

    // Check if we're returning from OAuth callback - check both hash and query params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken =
      hashParams.get("access_token") || queryParams.get("access_token");

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
        // Clean up localStorage
        localStorage.removeItem(GOOGLE_REDIRECT_AT);
        localStorage.removeItem(GOOGLE_LAST_PAGE);

        // Clean up URL and redirect to home (Always force production)
        const homeUrl = "https://devpath.sh/";

        window.history.replaceState({}, document.title, homeUrl);
        window.location.href = homeUrl;
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

      // STRICT FORCE: Always redirect to production URL
      // This ensures we never hit localhost:3000 even if running locally

      // Ensure we don't double-slash (devpath.sh/ + /pathname)
      const pathname = window.location.pathname.startsWith("/")
        ? window.location.pathname
        : `/${window.location.pathname}`;

      const redirectUrl = `https://devpath.sh${pathname}`;

      console.log("🔐 Initiating Google OAuth to:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
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

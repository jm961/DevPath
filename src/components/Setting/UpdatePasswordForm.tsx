import { useEffect, useState } from "preact/hooks";
import Cookies from "js-cookie";
import Spinner from "../Spinner";
import { TOKEN_COOKIE_NAME } from "../../lib/jwt";
import { httpGet, httpPatch } from "../../lib/http";

export default function UpdatePasswordForm() {
  const [authProvider, setAuthProvider] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    if (newPassword !== newPasswordConfirmation) {
      setError("Passwords do not match");
      setIsSaving(false);

      return;
    }

    const { response, error } = await httpPatch(
      `${import.meta.env.PUBLIC_API_URL}/v1-update-password`,
      {
        oldPassword: currentPassword,
        newPassword: newPassword,
      }
    );

    if (error) {
      setError(error.message || "Something went wrong. Please try again.");
      setIsSaving(false);

      return;
    }

    setError("");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirmation("");
    setSuccess("Password updated successfully!");
    setIsSaving(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");

    const { error, response } = await httpGet(
      `${import.meta.env.PUBLIC_API_URL}/v1-me`
    );

    if (error || !response) {
      if (error?.status === 401) {
        Cookies.remove(TOKEN_COOKIE_NAME);
        window.location.reload();

        return;
      }

      setIsLoading(false);
      setError(error?.message || "Failed to load profile data");

      return;
    }

    const { authProvider } = response;
    setAuthProvider(authProvider || "");

    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile().finally(() => {
      // Profile loaded
    });
  }, []);

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <h2 className="text-3xl font-black text-white sm:text-4xl">
        Security Settings
      </h2>
      <p className="mt-2 text-[#8b949e]">
        Update your password to keep your account secure
      </p>

      <div className="mt-8 space-y-6">
        <div className="flex w-full flex-col">
          <label
            htmlFor="current-password"
            className='mb-2 text-sm font-medium text-[#f0f6fc] after:ml-1 after:text-[#ef4444] after:content-["*"]'
          >
            Current Password
          </label>
          <input
            type="password"
            name="current-password"
            id="current-password"
            autoComplete="current-password"
            className="input block w-full rounded-2xl border-[1.5px] border-white/10 bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:border-[#3b82f6] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            required
            minLength={8}
            placeholder="Enter your current password"
            value={currentPassword}
            disabled={isLoading}
            onInput={(e) =>
              setCurrentPassword((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div className="flex w-full flex-col">
          <label
            htmlFor="new-password"
            className='mb-2 text-sm font-medium text-[#f0f6fc] after:ml-1 after:text-[#ef4444] after:content-["*"]'
          >
            New Password
          </label>
          <input
            type="password"
            name="new-password"
            id="new-password"
            autoComplete="new-password"
            className="input block w-full rounded-2xl border-[1.5px] border-white/10 bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:border-[#3b82f6] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            required
            minLength={8}
            placeholder="Enter your new password"
            value={newPassword}
            disabled={isLoading}
            onInput={(e) =>
              setNewPassword((e.target as HTMLInputElement).value)
            }
          />
          <span className="mt-1.5 text-xs text-[#6e7681]">
            Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number
          </span>
        </div>

        <div className="flex w-full flex-col">
          <label
            htmlFor="new-password-confirmation"
            className='mb-2 text-sm font-medium text-[#f0f6fc] after:ml-1 after:text-[#ef4444] after:content-["*"]'
          >
            Confirm New Password
          </label>
          <input
            type="password"
            name="new-password-confirmation"
            id="new-password-confirmation"
            autoComplete="new-password"
            className="input block w-full rounded-2xl border-[1.5px] border-white/10 bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:border-[#3b82f6] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            required
            minLength={6}
            placeholder="Re-enter your new password"
            value={newPasswordConfirmation}
            disabled={isLoading}
            onInput={(e) =>
              setNewPasswordConfirmation((e.target as HTMLInputElement).value)
            }
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 backdrop-blur-xl">
            <svg
              className="h-5 w-5 shrink-0 text-[#ef4444]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-[#f0f6fc]">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-2xl border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 backdrop-blur-xl">
            <svg
              className="h-5 w-5 shrink-0 text-[#10b981]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-[#f0f6fc]">
              {success}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isSaving}
          className="btn-primary relative mt-8 inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] px-8 py-4 text-sm font-bold text-white shadow-[0_2px_8px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSaving ? (
            <>
              <Spinner className="mr-2 h-4 w-4 text-white" />
              Updating Password...
            </>
          ) : isLoading ? (
            "Loading..."
          ) : (
            "Update Password"
          )}
        </button>
      </div>
    </form>
  );
}

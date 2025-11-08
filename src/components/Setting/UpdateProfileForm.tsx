import { useEffect, useState } from "preact/hooks";
import { httpGet, httpPatch } from "../../lib/http";
import Cookies from "js-cookie";
import { TOKEN_COOKIE_NAME } from "../../lib/jwt";
import Spinner from "../Spinner";

export function UpdateProfileForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateUrl = (url: string, fieldName: string): boolean => {
    if (!url) return true; // Empty is valid
    try {
      new URL(url);
      return true;
    } catch {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: "Please enter a valid URL",
      }));
      return false;
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    // Validate URLs
    const isGithubValid = validateUrl(github, "github");
    const isTwitterValid = validateUrl(twitter, "twitter");
    const isLinkedinValid = validateUrl(linkedin, "linkedin");
    const isWebsiteValid = validateUrl(website, "website");

    if (
      !isGithubValid ||
      !isTwitterValid ||
      !isLinkedinValid ||
      !isWebsiteValid
    ) {
      setIsSaving(false);
      setError("Please fix the validation errors below");
      return;
    }

    const { response, error } = await httpPatch(
      `${import.meta.env.PUBLIC_API_URL}/v1-update-profile`,
      {
        name: `${firstName} ${lastName}`.trim(),
        github: github || undefined,
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
        website: website || undefined,
      }
    );

    if (error || !response) {
      setIsSaving(false);
      setError(error?.message || "Something went wrong. Please try again.");

      return;
    }

    await loadProfile();
    setSuccess("Profile updated successfully!");
    setIsSaving(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");

    console.log(
      "🔍 Fetching profile from:",
      `${import.meta.env.PUBLIC_API_URL}/v1-me`
    );

    const { error, response } = await httpGet(
      `${import.meta.env.PUBLIC_API_URL}/v1-me`
    );

    console.log("📦 Profile response:", { error, response });

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

    console.log("✅ Setting profile data:", {
      name: response.name,
      email: response.email,
      links: response.links,
    });

    const { name, email, links } = response;

    // Split name into first and last name
    const nameParts = (name || "").trim().split(" ");
    const first = nameParts[0] || "";
    const last = nameParts.slice(1).join(" ") || "";

    setFirstName(first);
    setLastName(last);
    setEmail(email);
    setGithub(links?.github || "");
    setLinkedin(links?.linkedin || "");
    setTwitter(links?.twitter || "");
    setWebsite(links?.website || "");

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
        Profile Settings
      </h2>
      <p className="mt-2 text-[#8b949e]">
        Manage your personal information and social links
      </p>

      <div className="mt-8 space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex w-full flex-col">
            <label
              htmlFor="firstName"
              className='mb-2 text-sm font-medium text-[#f0f6fc] after:ml-1 after:text-[#ef4444] after:content-["*"]'
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              autoComplete="given-name"
              className="input block w-full rounded-2xl border-[1.5px] border-white/10 bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:border-[#3b82f6] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              required
              placeholder="John"
              value={firstName}
              disabled={isLoading}
              onInput={(e) =>
                setFirstName((e.target as HTMLInputElement).value)
              }
            />
          </div>

          <div className="flex w-full flex-col">
            <label
              htmlFor="lastName"
              className='mb-2 text-sm font-medium text-[#f0f6fc] after:ml-1 after:text-[#ef4444] after:content-["*"]'
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              autoComplete="family-name"
              className="input block w-full rounded-2xl border-[1.5px] border-white/10 bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:border-[#3b82f6] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              required
              placeholder="Doe"
              value={lastName}
              disabled={isLoading}
              onInput={(e) => setLastName((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        <div className="flex w-full flex-col">
          <label
            htmlFor="email"
            className='mb-2 text-sm font-medium text-[#f0f6fc] after:ml-1 after:text-[#ef4444] after:content-["*"]'
          >
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            className="block w-full rounded-2xl border-[1.5px] border-white/10 bg-white/5 px-5 py-3.5 text-[#8b949e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none placeholder:text-[#6e7681] cursor-not-allowed opacity-60"
            required
            disabled
            placeholder="john@example.com"
            value={email}
          />
          <span className="mt-1.5 text-xs text-[#6e7681]">
            Email cannot be changed
          </span>
        </div>

        <div className="flex w-full flex-col">
          <label
            htmlFor="github"
            className="mb-2 text-sm font-medium text-[#f0f6fc]"
          >
            GitHub Profile
          </label>
          <input
            type="url"
            name="github"
            id="github"
            className={`input block w-full rounded-2xl border-[1.5px] ${
              fieldErrors.github
                ? "border-[#ef4444]/50 focus:border-[#ef4444]"
                : "border-white/10 focus:border-[#3b82f6]"
            } bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="https://github.com/username"
            value={github}
            disabled={isLoading}
            onInput={(e) => {
              setGithub((e.target as HTMLInputElement).value);
              setFieldErrors((prev) => ({ ...prev, github: "" }));
            }}
          />
          {fieldErrors.github && (
            <span className="mt-1.5 text-xs text-[#ef4444]">
              {fieldErrors.github}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col">
          <label
            htmlFor="twitter"
            className="mb-2 text-sm font-medium text-[#f0f6fc]"
          >
            Twitter Profile
          </label>
          <input
            type="url"
            name="twitter"
            id="twitter"
            className={`input block w-full rounded-2xl border-[1.5px] ${
              fieldErrors.twitter
                ? "border-[#ef4444]/50 focus:border-[#ef4444]"
                : "border-white/10 focus:border-[#3b82f6]"
            } bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="https://twitter.com/username"
            value={twitter}
            disabled={isLoading}
            onInput={(e) => {
              setTwitter((e.target as HTMLInputElement).value);
              setFieldErrors((prev) => ({ ...prev, twitter: "" }));
            }}
          />
          {fieldErrors.twitter && (
            <span className="mt-1.5 text-xs text-[#ef4444]">
              {fieldErrors.twitter}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col">
          <label
            htmlFor="linkedin"
            className="mb-2 text-sm font-medium text-[#f0f6fc]"
          >
            LinkedIn Profile
          </label>
          <input
            type="url"
            name="linkedin"
            id="linkedin"
            className={`input block w-full rounded-2xl border-[1.5px] ${
              fieldErrors.linkedin
                ? "border-[#ef4444]/50 focus:border-[#ef4444]"
                : "border-white/10 focus:border-[#3b82f6]"
            } bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="https://www.linkedin.com/in/username"
            value={linkedin}
            disabled={isLoading}
            onInput={(e) => {
              setLinkedin((e.target as HTMLInputElement).value);
              setFieldErrors((prev) => ({ ...prev, linkedin: "" }));
            }}
          />
          {fieldErrors.linkedin && (
            <span className="mt-1.5 text-xs text-[#ef4444]">
              {fieldErrors.linkedin}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col">
          <label
            htmlFor="website"
            className="mb-2 text-sm font-medium text-[#f0f6fc]"
          >
            Personal Website
          </label>
          <input
            type="url"
            name="website"
            id="website"
            className={`input block w-full rounded-2xl border-[1.5px] ${
              fieldErrors.website
                ? "border-[#ef4444]/50 focus:border-[#ef4444]"
                : "border-white/10 focus:border-[#3b82f6]"
            } bg-white/5 px-5 py-3.5 text-[#f0f6fc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none transition-all duration-300 placeholder:text-[#6e7681] focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_24px_rgba(59,130,246,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)] focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="https://example.com"
            value={website}
            disabled={isLoading}
            onInput={(e) => {
              setWebsite((e.target as HTMLInputElement).value);
              setFieldErrors((prev) => ({ ...prev, website: "" }));
            }}
          />
          {fieldErrors.website && (
            <span className="mt-1.5 text-xs text-[#ef4444]">
              {fieldErrors.website}
            </span>
          )}
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
              Saving Changes...
            </>
          ) : isLoading ? (
            "Loading..."
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}

import Cookies from "js-cookie";
import type { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { TOKEN_COOKIE_NAME } from "../../lib/jwt";

const EmailSignupForm: FunctionComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (e: Event) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    fetch(`${import.meta.env.PUBLIC_API_URL}/v1-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
      }),
    })
      .then((res) => {
        console.log("Signup response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Signup response data:", data);

        if (!data.token) {
          setIsLoading(false);

          // Show validation errors if available
          if (data.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors
              .map((err: any) => err.message)
              .join(". ");
            setError(errorMessages);
          } else {
            setError(
              data.message || "Something went wrong. Please try again later."
            );
          }
          return;
        }

        // Set the token in a cookie and reload
        Cookies.set(TOKEN_COOKIE_NAME, data.token);
        window.location.href = "/";
      })
      .catch((err) => {
        console.error("Signup error:", err);
        setIsLoading(false);
        setError("Something went wrong. Please try again later.");
      });
  };

  return (
    <form className="flex w-full flex-col gap-2" onSubmit={onSubmit}>
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="firstName" className="sr-only">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
            placeholder="First Name"
            value={firstName}
            onInput={(e) => setFirstName(String((e.target as any).value))}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="lastName" className="sr-only">
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
            placeholder="Last Name"
            value={lastName}
            onInput={(e) => setLastName(String((e.target as any).value))}
          />
        </div>
      </div>
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        name="email"
        type="email"
        autoComplete="email"
        required
        className="block w-full rounded-lg border border-gray-300 px-3 py-2  outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
        placeholder="Email Address"
        value={email}
        onInput={(e) => setEmail(String((e.target as any).value))}
      />
      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
        placeholder="Password"
        value={password}
        onInput={(e) => setPassword(String((e.target as any).value))}
      />
      <p className="text-xs text-gray-500 -mt-1">
        Password must contain at least 8 characters, one uppercase, one
        lowercase, and one number
      </p>

      {error && (
        <p className="rounded-lg bg-red-100 p-2 text-red-700">{error}.</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-black p-2 py-3 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:bg-gray-400"
      >
        {isLoading ? "Please wait..." : "Create Account"}
      </button>
    </form>
  );
};

export default EmailSignupForm;

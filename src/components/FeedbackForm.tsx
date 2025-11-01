import { useState, useEffect } from "preact/hooks";
import type { JSX } from "preact";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    type: "suggestion",
    title: "",
    description: "",
    email: "",
    url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Pre-fill from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get("url");
      const typeParam = params.get("type");

      if (urlParam || typeParam) {
        setFormData((prev) => ({
          ...prev,
          url: urlParam ? `${window.location.origin}${urlParam}` : prev.url,
          type: typeParam || prev.type,
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      console.log("Submitting feedback:", formData);

      // You can integrate with your backend API or a service like Formspree, EmailJS, etc.
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          type: "suggestion",
          title: "",
          description: "",
          email: "",
          url: "",
        });
      } else {
        console.error("Submission failed:", result);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Type */}
        <div>
          <label
            htmlFor="type"
            className="mb-2 block text-sm font-semibold text-gray-300"
          >
            What would you like to share?
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: (e.target as HTMLSelectElement).value,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          >
            <option value="suggestion">Suggestion</option>
            <option value="correction">Correction</option>
            <option value="question">Question</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Current URL */}
        <div>
          <label
            htmlFor="url"
            className="mb-2 block text-sm font-semibold text-gray-300"
          >
            Page URL (optional)
          </label>
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={(e) =>
              setFormData({
                ...formData,
                url: (e.target as HTMLInputElement).value,
              })
            }
            placeholder="https://devpath.sh/..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-semibold text-gray-300"
          >
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: (e.target as HTMLInputElement).value,
              })
            }
            placeholder="Brief summary of your feedback"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-gray-300"
          >
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: (e.target as HTMLTextAreaElement).value,
              })
            }
            placeholder="Please provide details about your feedback..."
            rows={6}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-300"
          >
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: (e.target as HTMLInputElement).value,
              })
            }
            placeholder="your.email@example.com"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave your email if you'd like us to follow up with you
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full px-8 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
            <p className="font-semibold text-green-400">
              ✓ Thank you for your feedback!
            </p>
            <p className="mt-1 text-sm text-gray-400">
              We appreciate you taking the time to help us improve.
            </p>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
            <p className="font-semibold text-red-400">✗ Something went wrong</p>
            <p className="mt-1 text-sm text-gray-400">
              Please try again or contact us directly at feedback@devpath.sh
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

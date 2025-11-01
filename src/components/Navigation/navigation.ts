import Cookies from "js-cookie";
import { handleAuthRequired } from "../Authenticator/authenticator";
import { TOKEN_COOKIE_NAME } from "../../lib/jwt";

export function logout() {
  Cookies.remove(TOKEN_COOKIE_NAME);
  window.location.reload();
}

// Prevent multiple initializations
let initialized = false;

function bindEvents() {
  if (initialized) {
    return;
  }

  initialized = true;

  const dropdown = document.querySelector(
    "[data-account-dropdown]"
  ) as HTMLElement;
  const accountButton = document.querySelector(
    "[data-account-button]"
  ) as HTMLElement;

  if (!dropdown || !accountButton) {
    console.error("[Navigation] Dropdown or button not found");
    return;
  }

  // Move dropdown to body to escape all stacking contexts
  document.body.appendChild(dropdown);

  // Account button click
  accountButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isHidden =
      dropdown.style.display === "none" || dropdown.style.display === "";

    if (isHidden) {
      // Show and position
      const rect = accountButton.getBoundingClientRect();
      dropdown.style.display = "block";
      dropdown.style.position = "fixed";
      dropdown.style.top = `${rect.bottom + 8}px`;
      dropdown.style.right = `${window.innerWidth - rect.right}px`;
      dropdown.style.zIndex = "99999";
    } else {
      // Hide
      dropdown.style.display = "none";
    }
  });

  // Logout button click
  dropdown.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest("button");
    const link = target.closest("a");

    if (button?.hasAttribute("data-logout-button")) {
      e.preventDefault();
      e.stopPropagation();
      dropdown.style.display = "none";
      logout();
      return;
    }

    if (link?.getAttribute("href")?.includes("/settings")) {
      dropdown.style.display = "none";
      // Let navigation happen
      return;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!dropdown.contains(target) && !accountButton.contains(target)) {
      dropdown.style.display = "none";
    }
  });

  // Mobile nav toggle
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest("button");

    if (button?.hasAttribute("data-show-mobile-nav")) {
      document.querySelector("[data-mobile-nav]")?.classList.remove("hidden");
      return;
    }

    if (button?.hasAttribute("data-close-mobile-nav")) {
      document.querySelector("[data-mobile-nav]")?.classList.add("hidden");
      return;
    }
  });
}

// Initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindEvents);
} else {
  bindEvents();
}

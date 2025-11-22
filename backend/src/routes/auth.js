const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const googleAuthController = require("../controllers/googleAuthController");
const authMiddleware = require("../middleware/auth");
const {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  updatePasswordValidation,
} = require("../middleware/validators");

// Public routes
router.post("/v1-signup", signupValidation, authController.signup);
router.post("/v1-login", loginValidation, authController.login);

// OAuth callback from Supabase (Google, GitHub, etc.)
router.post("/v1-oauth-callback", googleAuthController.oauthCallback);
// Keep backward compatibility
router.post("/v1-google-callback", googleAuthController.googleCallback);

// Protected routes
router.get("/v1-me", authMiddleware, authController.me);
router.patch(
  "/v1-update-profile",
  authMiddleware,
  updateProfileValidation,
  authController.updateProfile
);
router.patch(
  "/v1-update-password",
  authMiddleware,
  updatePasswordValidation,
  authController.updatePassword
);

module.exports = router;

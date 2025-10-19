const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Public routes
router.post("/v1-signup", authController.signup);
router.post("/v1-login", authController.login);

// Protected routes
router.get("/v1-me", authMiddleware, authController.me);
router.patch(
  "/v1-update-profile",
  authMiddleware,
  authController.updateProfile
);
router.patch(
  "/v1-update-password",
  authMiddleware,
  authController.updatePassword
);

module.exports = router;

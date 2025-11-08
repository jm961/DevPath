const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/auth");
const { progressValidation } = require("../middleware/validators");

// All progress routes require authentication
// Existing route names
router.patch(
  "/v1-toggle-mark-resource-done",
  authMiddleware,
  progressValidation,
  progressController.toggleMarkResourceDone
);
router.get(
  "/v1-get-user-resource-progress",
  authMiddleware,
  progressController.getUserResourceProgress
);

// Compatibility routes expected by the frontend
// POST used by frontend for toggling topic progress
router.post(
  "/v1-toggle-topic",
  authMiddleware,
  progressValidation,
  progressController.toggleMarkResourceDone
);

// GET used by frontend to fetch progress for a given resource
router.get(
  "/v1-progress",
  authMiddleware,
  progressController.getUserResourceProgress
);

module.exports = router;

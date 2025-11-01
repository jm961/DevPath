const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/auth");
const { progressValidation } = require("../middleware/validators");

// All progress routes require authentication
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

module.exports = router;

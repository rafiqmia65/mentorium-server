const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");
const verifyStudent = require("../middlewares/verifyStudent");
const {
  submitEvaluation,
  getAllFeedbacks,
  getFeedbacksByClass,
} = require("../controllers/feedbackController");

// Submit evaluation
router.post(
  "/evaluations",
  verifyFirebaseToken,
  verifyStudent,
  submitEvaluation
);

// Get all feedbacks
router.get("/feedbacks", getAllFeedbacks);

// GET feedbacks for a specific class
router.get("/feedbacks/class/:classId", getFeedbacksByClass);

module.exports = router;

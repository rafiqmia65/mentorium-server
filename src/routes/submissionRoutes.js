const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");
const verifyStudent = require("../middlewares/verifyStudent");

const {
  submitAssignment,
  getSubmissionCountByClass,
} = require("../controllers/submissionController");

// Assignment submission
router.post(
  "/submissions",
  verifyFirebaseToken,
  verifyStudent,
  submitAssignment
);

// Total assignment Submission Counts
router.get("/submissions/count/:classId", getSubmissionCountByClass);

module.exports = router;

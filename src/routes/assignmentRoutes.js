const express = require("express");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");
const verifyTeacher = require("../middlewares/verifyTeacher");
const {
  addAssignment,
  getAssignmentsByClass,
  getAssignmentCountByClass,
} = require("../controllers/assignmentController");

const router = express.Router();

// Add Assignment
router.post("/assignments", verifyFirebaseToken, verifyTeacher, addAssignment);

// Get total assignment count for a class
router.get("/assignments/count/:classId", getAssignmentCountByClass);

// Route for getting assignments by class ID
router.get("/assignments/:classId", getAssignmentsByClass);

module.exports = router;

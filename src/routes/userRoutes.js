// userRoutes.js
const express = require("express");
const router = express.Router();
// Middleware import
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

// controllers import
const {
  addUser,
  getAllUsers,
  fetchUserByEmail,
  applyForTeacher,
  fetchUserRole,
  fetchPendingTeacherRequests,
  approveTeacherRequestController,
  rejectTeacherRequestController,
  searchUsersController,
  makeAdminController,
} = require("../controllers/userController");

// Add user
router.post("/users", addUser);

// Get All users
router.get("/mentorium/allUsers", getAllUsers);

// Get Single user by email
router.get("/users/:email", fetchUserByEmail);

// Apply for teacher
router.patch("/users/:email", applyForTeacher);

// Get user role by email
router.get("/users/:email/role", fetchUserRole);

// GET all pending teacher requests
router.get(
  "/teacher-requests/pending",
  verifyFirebaseToken,
  verifyAdmin,
  fetchPendingTeacherRequests
);

// PATCH approve teacher request
router.patch(
  "/teacher-requests/:email/approve",
  verifyFirebaseToken,
  verifyAdmin,
  approveTeacherRequestController
);

// PATCH reject teacher request
router.patch(
  "/teacher-requests/:email/reject",
  verifyFirebaseToken,
  verifyAdmin,
  rejectTeacherRequestController
);

// Search users
router.get("/allUsers", searchUsersController);

// Make admin
router.patch(
  "/users/make-admin/:email",
  verifyFirebaseToken,
  verifyAdmin,
  makeAdminController
);

module.exports = router;

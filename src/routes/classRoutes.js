const express = require("express");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");
const verifyTeacher = require("../middlewares/verifyTeacher");
const verifyAdmin = require("../middlewares/verifyAdmin");
const router = express.Router();
const {
  addClassController,
  getMyClasses,
  updateClass,
  deleteClass,
  getAllApprovedClasses,
  getPopularClasses,
  getAllClassesAdmin,
  updateClassStatus,
  getClassById,
} = require("../controllers/classController");

// Add Class
router.post(
  "/addClass",
  verifyFirebaseToken,
  verifyTeacher,
  addClassController
);

// My Classes
router.get("/my-classes", verifyFirebaseToken, verifyTeacher, getMyClasses);

// Update Class
router.patch(
  "/my-classes/:id",
  verifyFirebaseToken,
  verifyTeacher,
  updateClass
);

// GET all approved classes
router.get("/allClasses", getAllApprovedClasses);

// Popular Classes Route
router.get("/popular-classes", getPopularClasses);

// Admin Route - Get All Classes
router.get(
  "/admin/all-classes",
  verifyFirebaseToken,
  verifyAdmin,
  getAllClassesAdmin
);

// Admin PATCH to update class status
router.patch(
  "/admin/class-status/:id",
  verifyFirebaseToken,
  verifyAdmin,
  updateClassStatus
);

router.get("/class/:id", getClassById);

// Delete Class
router.delete(
  "/my-classes/:id",
  verifyFirebaseToken,
  verifyTeacher,
  deleteClass
);

module.exports = router;

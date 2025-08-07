const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");
const verifyStudent = require("../middlewares/verifyStudent");
const {
  createPaymentIntent,
  enrollInClass,
  verifyPayment,
  getEnrolledClassesByUser,
} = require("../controllers/enrollmentController");

router.post("/create-payment-intent", createPaymentIntent);

router.post("/enrollments", verifyFirebaseToken, verifyStudent, enrollInClass);

router.post("/verify-payment", verifyPayment);

router.get(
  "/users/:email/enrolled-classes",
  verifyFirebaseToken,
  verifyStudent,
  getEnrolledClassesByUser
);

module.exports = router;

const mongoose = require("mongoose");
const stripe = require("../config/stripeConfig"); // Stripe instance import
const Enrollment = require("../models/enrollmentsModel");
const { Class } = require("../models/classModel");
const { User } = require("../models/userModel");

//  Create Payment Intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validation
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Enroll in Class
const enrollInClass = async (req, res) => {
  try {
    const { classId, studentEmail, transactionId, amount } = req.body;

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid classId" });
    }

    // Find class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      classId,
      studentEmail,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this class" });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      classId: String(classData._id),
      studentEmail,
      teacherEmail: classData.email,
      transactionId,
      amount: String(amount),
      enrolledAt: new Date(),
      status: "active",
      className: classData.title,
      classImage: classData.image,
      instructorName: classData.name,
    });

    await enrollment.save();

    // Increment totalEnrolled in class
    classData.totalEnrolled += 1;
    await classData.save();

    // Add to user's enrolledClasses
    await User.updateOne(
      { email: studentEmail },
      { $addToSet: { enrolledClasses: classId } }
    );

    return res.status(200).json({
      success: true,
      message: "Enrollment successful",
      data: {
        enrollmentId: enrollment._id,
        classId,
        className: classData.title,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to enroll",
      error: err.message,
    });
  }
};

//  Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "PaymentIntent ID is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: paymentIntent.status,
        amountPaid: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        createdAt: new Date(paymentIntent.created * 1000),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getEnrolledClassesByUser = async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const enrollments = await Enrollment.find({ studentEmail: email }).populate(
      "classId"
    );

    // Skip enrollments with missing class data
    const result = enrollments
      .filter((enrollment) => enrollment.classId)
      .map((enrollment) => {
        const classData = enrollment.classId.toObject();
        return {
          ...classData,
          enrollmentDate: enrollment.enrolledAt,
          transactionId: enrollment.transactionId,
          amountPaid: enrollment.amount,
        };
      });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  enrollInClass,
  verifyPayment,
  getEnrolledClassesByUser,
};

const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    teacherEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    enrolledAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
    className: {
      type: String,
      required: true,
    },
    classImage: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "enrollments" }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;

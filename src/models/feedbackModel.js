const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Related Class Model
      required: true,
    },
    className: { type: String, required: true, trim: true },
    instructorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    description: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { collection: "evaluations" }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;

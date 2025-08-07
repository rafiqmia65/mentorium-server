const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true },
    classId: { type: String, required: true },
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    submissionLink: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "submissions" }
);

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;

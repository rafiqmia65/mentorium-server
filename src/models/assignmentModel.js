const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Class",
    },
    teacherEmail: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    submissionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "assignments",
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;

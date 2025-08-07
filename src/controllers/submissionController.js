const Submission = require("../models/submissionModel");
const Assignment = require("../models/assignmentModel");
const mongoose = require("mongoose");

const submitAssignment = async (req, res) => {
  try {
    const submissionData = req.body;
    submissionData.submittedAt = new Date();

    // Save submission document
    const submission = new Submission(submissionData);
    const result = await submission.save();

    // Increment submissionCount in assignments collection
    await Assignment.findByIdAndUpdate(submissionData.assignmentId, {
      $inc: { submissionCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully!",
      insertedId: result._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit assignment.",
      error: error.message,
    });
  }
};

const getSubmissionCountByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const count = await Submission.countDocuments({ classId });

    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission count.",
      error: error.message,
    });
  }
};

module.exports = { submitAssignment, getSubmissionCountByClass };

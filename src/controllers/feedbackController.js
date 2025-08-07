const mongoose = require("mongoose");
const Feedback = require("../models/feedbackModel");
const { User } = require("../models/userModel");

// --- Submit Evaluation ---
const submitEvaluation = async (req, res) => {
  try {
    let {
      classId,
      className,
      instructorEmail,
      studentEmail,
      rating,
      description,
    } = req.body;

    // Ensure classId is ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid classId" });
    }

    const evaluation = new Feedback({
      classId: new mongoose.Types.ObjectId(classId),
      className,
      instructorEmail,
      studentEmail,
      rating,
      description,
      submittedAt: new Date(),
    });

    const savedEvaluation = await evaluation.save();

    res.status(201).json({
      success: true,
      message: "Evaluation submitted successfully!",
      insertedId: savedEvaluation._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit evaluation.",
      error: error.message,
    });
  }
};

// --- Get All Feedbacks ---
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ rating: { $ne: null } }).lean();

    const feedbacksWithUserDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        const student = await User.findOne(
          { email: feedback.studentEmail },
          { name: 1, photo: 1 }
        ).lean();
        return {
          ...feedback,
          studentName: student?.name || "Anonymous",
          studentPhoto:
            student?.photo ||
            "https://img.icons8.com/?size=100&id=124204&format=png&color=000000",
        };
      })
    );

    res.status(200).json({ success: true, data: feedbacksWithUserDetails });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedbacks.",
      error: error.message,
    });
  }
};

// --- Get Feedbacks for a Specific Class ---
const getFeedbacksByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid classId" });
    }

    const feedbacks = await Feedback.find({
      classId: new mongoose.Types.ObjectId(classId),
      rating: { $ne: null },
    }).lean();

    const feedbacksWithUserDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        const student = await User.findOne(
          { email: feedback.studentEmail },
          { name: 1, photo: 1 }
        ).lean();
        return {
          ...feedback,
          studentName: student?.name || "Anonymous",
          studentPhoto:
            student?.photo ||
            "https://img.icons8.com/?size=100&id=124204&format=png&color=000000",
        };
      })
    );

    res.status(200).json({ success: true, data: feedbacksWithUserDetails });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch class feedbacks.",
      error: error.message,
    });
  }
};

module.exports = { submitEvaluation, getAllFeedbacks, getFeedbacksByClass };

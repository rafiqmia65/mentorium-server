const Assignment = require("../models/assignmentModel");
const mongoose = require("mongoose");

// Add new assignment
const addAssignment = async (req, res) => {
  try {
    const { classId, teacherEmail, title, description, deadline } = req.body;

    // Validate required fields
    if (!classId || !teacherEmail || !title || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Missing required assignment fields.",
      });
    }

    const assignment = new Assignment({
      classId,
      teacherEmail,
      title,
      description,
      deadline,
    });

    const savedAssignment = await assignment.save();

    res.status(201).json({
      success: true,
      message: "Assignment added successfully!",
      data: savedAssignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add assignment.",
      error: error.message,
    });
  }
};

// Get all assignments for a specific class
const getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Class ID" });
    }

    const assignments = await Assignment.find({
      classId: new mongoose.Types.ObjectId(classId),
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get total assignment count for a class
const getAssignmentCountByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const count = await Assignment.countDocuments({ classId });

    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment count.",
      error: error.message,
    });
  }
};

// --- Get Assignment by ID ---
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    // Find assignment
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  addAssignment,
  getAssignmentsByClass,
  getAssignmentCountByClass,
  getAssignmentById,
};

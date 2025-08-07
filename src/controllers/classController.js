const { addNewClass, Class } = require("../models/classModel");
const mongoose = require("mongoose");

// Add Class Controller
const addClassController = async (req, res) => {
  try {
    // Force email from token
    req.body.email = req.decoded?.email;

    // Save to DB
    const savedClass = await addNewClass(req.body);

    res.status(201).json({
      success: true,
      message: "Class submitted for approval",
      data: savedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add class",
    });
  }
};

// My Classes Controller
const getMyClasses = async (req, res) => {
  const email = req.query.email;

  try {
    const classes = await Class.find({ email: email }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: classes });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch classes." });
  }
};

// Update class by ID
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const result = await Class.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Class not found or update failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class updated successfully.",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update class.",
    });
  }
};

// Get all approved classes
const getAllApprovedClasses = async (req, res) => {
  try {
    const classes = await Class.find({ status: "approved" }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved classes.",
    });
  }
};

// Get popular classes (top 6 by totalEnrolled)
const getPopularClasses = async (req, res) => {
  try {
    const popularClasses = await Class.find({
      status: { $regex: /^approved$/i },
    })
      .sort({ totalEnrolled: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: popularClasses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular classes.",
      error: error.message,
    });
  }
};

// Admin: Get All Classes
const getAllClassesAdmin = async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes.",
    });
  }
};

// Admin PATCH to Approve/Reject Class
const updateClassStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value. Allowed: pending, approved, rejected.",
    });
  }

  try {
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class status updated successfully.",
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status.",
    });
  }
};

// Get class by Id
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid class ID" });
    }

    const classDoc = await Class.findById(id);

    if (!classDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        ...classDoc.toObject(),
        instructor: {
          name: classDoc.name,
          email: classDoc.email,
          photo: classDoc.photo || "",
          teacherApplication: { experience: "N/A" },
        },
        category: classDoc.category || "General",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Class Controller
const deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Class.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Class not found or already deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete class.",
    });
  }
};

module.exports = {
  addClassController,
  getMyClasses,
  updateClass,
  deleteClass,
  getAllApprovedClasses,
  getPopularClasses,
  getAllClassesAdmin,
  updateClassStatus,
  getClassById,
};

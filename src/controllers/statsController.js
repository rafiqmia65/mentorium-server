const { User } = require("../models/userModel");
const { Class } = require("../models/classModel");
const Enrollment = require("../models/enrollmentsModel");

// Get Website Stats
const getWebsiteStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalClasses = await Class.countDocuments({ status: "approved" });

    const totalEnrollments = await Enrollment.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalClasses,
        totalEnrollments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch website statistics.",
      error: error.message,
    });
  }
};

module.exports = { getWebsiteStats };

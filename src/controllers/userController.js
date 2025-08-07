const {
  User,
  getAllUsersPaginated,
  getUserByEmail,
  getPendingTeacherRequests,
  getUserRoleByEmail,
  approveTeacherRequest,
  searchUsers,
  rejectTeacherRequest,
  makeAdminByEmail,
} = require("../models/userModel");

// Add User (POST /users)
const addUser = async (req, res) => {
  try {
    const userData = req.body;

    //  user create
    const newUser = new User(userData);
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: savedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all Users (GET /users?page=&limit=)
const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { users, totalUsers } = await getAllUsersPaginated(page, limit);

    res.json({
      success: true,
      data: users,
      totalCount: totalUsers,
      currentPage: page,
      itemsPerPage: limit,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// GET user by email (GET /users/:email)
const fetchUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await getUserByEmail(email);

    if (user) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Apply for teacher
const applyForTeacher = async (req, res) => {
  try {
    const { email } = req.params;
    const { role, name, experience, title, category } = req.body;

    // Validation
    if (!experience || !title || !category) {
      return res.status(400).json({
        success: false,
        message: "Experience, title, and category are required",
      });
    }

    const updateDoc = {
      role: role || "pending",
      teacherApplication: {
        name,
        email,
        experience,
        title,
        category,
        status: "pending",
        appliedAt: new Date(),
      },
    };

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateDoc },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher application submitted successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit teacher application",
      error: error.message,
    });
  }
};

// Get user role by email
const fetchUserRole = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserRoleByEmail(email);

    if (user) {
      res.status(200).json({ role: user.role || "user" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user role" });
  }
};

// GET all pending teacher requests
const fetchPendingTeacherRequests = async (req, res) => {
  try {
    const pendingRequests = await getPendingTeacherRequests();
    res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Approve teacher request
const approveTeacherRequestController = async (req, res) => {
  try {
    const { email } = req.params;

    const result = await approveTeacherRequest(email);

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Application not pending or already approved/rejected.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher request approved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve teacher request.",
      error: error.message,
    });
  }
};

// Reject teacher request
const rejectTeacherRequestController = async (req, res) => {
  try {
    const { email } = req.params;

    const result = await rejectTeacherRequest(email);

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Application not pending or already approved/rejected.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher request rejected successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject teacher request.",
      error: error.message,
    });
  }
};

// Search Users
const searchUsersController = async (req, res) => {
  try {
    const search = req.query.search || "";
    const users = await searchUsers(search);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Make Admin Controller
const makeAdminController = async (req, res) => {
  try {
    const email = req.params.email;
    const result = await makeAdminByEmail(email);

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or already admin" });
    }

    res
      .status(200)
      .json({ success: true, message: "User promoted to admin successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  addUser,
  getAllUsers,
  fetchUserByEmail,
  applyForTeacher,
  fetchUserRole,
  fetchPendingTeacherRequests,
  approveTeacherRequestController,
  rejectTeacherRequestController,
  searchUsersController,
  makeAdminController,
};

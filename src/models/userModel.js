const mongoose = require("mongoose");

// Sub-schema for teacher application details
const teacherApplicationSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  experience: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  appliedAt: { type: Date, default: Date.now },
});

// Main User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "pending"],
      default: "student",
    },
    teacherApplication: { type: teacherApplicationSchema, default: null },
  },
  { timestamps: true, collection: "users" }
);

const User = mongoose.model("User", userSchema);

const getAllUsersPaginated = async (page, limit) => {
  const skip = (page - 1) * limit;
  const totalUsers = await User.countDocuments();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return { users, totalUsers };
};

const getUserByEmail = async (email) => {
  return await User.findOne({ email: email.toLowerCase() });
};

const getUserRoleByEmail = async (email) => {
  return await User.findOne(
    { email: email.toLowerCase() },
    { role: 1, _id: 0 }
  );
};

// Get all pending teacher requests
const getPendingTeacherRequests = async () => {
  return await User.find({ "teacherApplication.status": "pending" });
};

// Approve teacher request by email
const approveTeacherRequest = async (email) => {
  return await User.updateOne(
    { email: email.toLowerCase(), "teacherApplication.status": "pending" },
    {
      $set: {
        role: "teacher",
        "teacherApplication.status": "approved",
      },
    }
  );
};

// Reject teacher request by email
const rejectTeacherRequest = async (email) => {
  return await User.updateOne(
    { email: email.toLowerCase(), "teacherApplication.status": "pending" },
    {
      $set: {
        role: "student",
        "teacherApplication.status": "rejected",
      },
    }
  );
};

// Search users by name or email
const searchUsers = async (search) => {
  const query = {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  };
  return await User.find(query).sort({ createdAt: -1 });
};

// Promote user to admin by email
const makeAdminByEmail = async (email) => {
  return await User.updateOne(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } }
  );
};

module.exports = {
  User,
  getAllUsersPaginated,
  getUserByEmail,
  getUserRoleByEmail,
  getPendingTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
  searchUsers,
  makeAdminByEmail,
};

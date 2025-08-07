const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, default: 999999, min: 0 },
    totalEnrolled: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true, collection: "allClasses" }
);

// Prevent OverwriteModelError
const Class = mongoose.models.Class || mongoose.model("Class", classSchema);

const addNewClass = async (classData) => {
  const newClass = new Class(classData);
  return await newClass.save();
};

module.exports = { Class, addNewClass };

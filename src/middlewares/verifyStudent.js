const { User } = require("../models/userModel");

const verifyStudent = async (req, res, next) => {
  try {
    const email = req.decoded?.email;

    if (!email) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No email provided" });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Forbidden - Students only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = verifyStudent;

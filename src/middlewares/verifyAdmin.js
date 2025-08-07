// verifyAdmin.js
const { User } = require("../models/userModel");

const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.decoded?.email;
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden - Admin only" });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = verifyAdmin;

// middlewares/verifyTeacher.js
const { User } = require("../models/userModel");

const verifyTeacher = async (req, res, next) => {
  try {
    const email = req.decoded?.email;
    if (!email) {
      return res
        .status(401)
        .send({ message: "Unauthorized - No email in token" });
    }

    const user = await User.findOne({ email });

    if (!user || user.role !== "teacher") {
      return res.status(403).send({ message: "Forbidden - Teacher only" });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = verifyTeacher;

const admin = require("../config/firebaseConfig");

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    const token = authorization.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded;

    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized" });
  }
};

module.exports = verifyFirebaseToken;

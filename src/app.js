const express = require("express");
const cors = require("cors");
const app = express();
// All Routes
const userRoutes = require("./routes/userRoutes");
const classRoutes = require("./routes/classRoutes");
const enrollmentsRoutes = require("./routes/enrollmentsRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const statsRoutes = require("./routes/statsRoutes");

// Middleware
app.use(cors());
app.use(express.json());

app.use("/", userRoutes);
app.use("/", classRoutes);
app.use("/", statsRoutes);
app.use("/", enrollmentsRoutes);
app.use("/", feedbackRoutes);
app.use("/", assignmentRoutes);
app.use("/", submissionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Mentorium Server is Cooking!" });
});

module.exports = app;

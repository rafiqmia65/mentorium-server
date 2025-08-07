const express = require("express");
const { getWebsiteStats } = require("../controllers/statsController");

const router = express.Router();

// GET /stats
router.get("/stats", getWebsiteStats);

module.exports = router;

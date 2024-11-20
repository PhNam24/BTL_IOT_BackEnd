const express = require("express");

const { getCurrentData } = require("../controller/HistoryController");

const router = express.Router();
router.get("/history", getCurrentData);

module.exports = router;

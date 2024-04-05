const express = require("express");
const router = express.Router();
const Dashboard = require("../app/controllers/DashboardController")

router.get("/getQuestionPlayed", Dashboard.questionPlayedMost);
router.get("/getCardPlayed", Dashboard.CardPlayedMost);

module.exports = router;
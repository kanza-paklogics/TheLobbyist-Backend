const express = require("express");
const router = express.Router();
const QuestionAnalyticsController = require("../app/controllers/QuestionAnalyticsController");

router.post("/add_record", QuestionAnalyticsController.add_record);
router.get("/get_record/:anaId", QuestionAnalyticsController.get_record);

module.exports = router;

const express = require("express");
const router = express.Router();
const PackAnalyticsController = require("../app/controllers/PackAnalyticsController");

router.post("/add_record", PackAnalyticsController.add_record);
router.get("/get_record/:pack_id", PackAnalyticsController.get_record);
router.get("/get_records", PackAnalyticsController.get_records);


module.exports = router;

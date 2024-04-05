const express = require("express");
const router = express.Router();
const VotesController = require("../app/controllers/VotesController");

router.get("/getWinningCriteria", VotesController.getWinningCriteria);
router.put("/changeWinningCriteria/:wid", VotesController.changeWinningCriteria);
module.exports = router;

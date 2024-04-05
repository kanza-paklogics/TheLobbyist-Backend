const express = require("express");
const router = express.Router();
const GamesController = require("../app/controllers/GamesController")

router.get("/get_totalGames", GamesController.totalGames);
router.get("/get_totalGames/:interval" ,GamesController.getGamesByTimeInterval)
router.get("/get_YearlyGames" ,GamesController.getYearlyGameData)


module.exports = router; 
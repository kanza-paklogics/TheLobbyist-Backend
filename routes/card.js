const express = require("express");
const router = express.Router();
const CardController = require("../app/controllers/CardController")
// router.get('/login', AuthController.loginPage);
router.post("/add_card", CardController.addNewCard);


module.exports = router;

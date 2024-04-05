const express = require("express");
const router = express.Router();
const AdminController = require("../app/controllers/AdminController");
const VotesController = require("../app/controllers/VotesController");

router.post("/createuser", AdminController.createUser);
router.delete("/deleteuser/:uid", AdminController.deleteUser)
router.post("/sendinvite", AdminController.sendInvite);

router.post("/updatewinningcriteria", VotesController.changeWinningCriteria);
router.post("/usersignup", AdminController.UserSignUp);

module.exports = router;

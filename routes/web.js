const express = require("express");
const router = express.Router();
const AuthController = require("../app/controllers/AuthController.js");

router.get("/ping", (req, res) => {
  res.status(200).send("Server is accessable !!");
});

router.get("/user", AuthController.getUser);

module.exports = router;

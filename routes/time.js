const express = require("express");
const router = express.Router();
const RoundTimeController = require("../app/controllers/RoundTimeController");

router.get("/getroundtime", RoundTimeController.getRoundTime);
router.put("/delete_RoundTime/:rid", RoundTimeController.delete_RoundTime);
router.put("/edit_roundtime/:rid", RoundTimeController.editRoundTime);
module.exports = router;

const express = require("express");
const router = express.Router();
const PackController = require("../app/controllers/PackController")


router.post("/add_pack", PackController.addNewPack);
router.get("/get_packs", PackController.getPacks);
// router.put("/edit_pack/:packId", PackController.editPack);
router.put("/edit_packs/:packId", PackController.editSpecificPack);
router.put("/update_mode/:packId",PackController.updatemode);
router.delete("/delete_pack/:packId", PackController.deletePack);
router.post("/publish", PackController.publishPack);
router.post("/create_pack", PackController.createPack);
router.get("/get_pack/:id", PackController.getPack);
router.get("/get_packsmode/:mode", PackController.getPacksMode);
router.get("/get_packsquestion/:packId", PackController.getPackQuestion);
router.patch("/archive_Pack/:packId", PackController.archivePack);
router.patch("/unArchivePack/:packId", PackController.unarchivePack);


module.exports = router;

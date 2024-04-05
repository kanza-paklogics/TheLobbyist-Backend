const express = require("express");
const router = express.Router();
const QuestionController = require("../app/controllers/QuestionController");

const cardImageUploader = require("./uploadImages/imageUpload").cardImageUploader;
// const uploadCardImg = require("./uploadImages/multerUploader");
// router.get('/login', AuthController.loginPage);


router.get("/get_questions", QuestionController.getAllQuestions);

router.post(
  "/add_question",
   //cardImageUploader,
  QuestionController.addNewQuestion
);
router.post('/upload_card_images', cardImageUploader);
router.delete("/delete_question/:qid", QuestionController.deleteQuestion);
router.put("/edit_question/:qid", QuestionController.editQuestion);
router.get("/get_question_logs/:qid",QuestionController.questionLogs);
router .delete("/image_delete/:imageId/:qid",QuestionController.deleteImage);
router.delete("/s3ImageDelete/",QuestionController.s3ImageDelete);
module.exports = router;

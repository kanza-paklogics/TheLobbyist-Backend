const questionValidation = require("../validations/questions");
const s3Delete = require("../../helpers/s3Delete");

/**
 *
 *
 * METHOD: GET
 * ROUTE: 'api/question//get_questions'
 * FETCH ALL THE QUEESTIONS
 *
 *
 */

exports.getAllQuestions = async (req, res, next) => {
  const { questions, cardsimages } = req.db.models;

  try {
    const allQuestions = await questions.findAll({
      include: [
        {
          model: cardsimages,
        },
      ],
    });
    if (allQuestions) {
      return res.send({ status: true, questions: allQuestions });
    }
    res.send({ status: false, message: "something is wrong" });
  } catch (err) {
    return res.send({ status: false });
  }
};

/**
 *
 *
 * METHOD:       POST
 * ROUTE:       '/api/question/add_question'
 * DESCRIPTION:  ADD NEW QUESTION
 *
 *
 */
exports.addNewQuestion = async (req, res, next) => {
  const { questions, Role, User, cardsimages, QuestionLogs } = req.db.models;
  // console.log(req?.file);
  const { email, userId, role_id } = req?.auth?.data;
  const { images, statements, options, fun_fact, answers, code } = req?.body;
  /**
   *  GET THE NAME OF USER WHO CREATEING THE QUESTION.
   */
  const questionCreator = await User.findOne({
    where: {
      email: email,
    },
    attributes: ["fullName"],
  });

  /**
   * CHECK ROLE OF USER
   */
  const roleAssigned = await Role.findOne({
    where: {
      id: role_id,
    },
    attributes: ["name"],
  });
  console.log(roleAssigned?.dataValues?.name);
  /**** END ****/
  try {
    /**
     *  CHECK VALIDATION
     */

    const { error, value } = await questionValidation(req.body);

    if (error?.details?.length > 0) {
      console.log("err", error.details);
      return res
        .status(500)
        .send({ status: false, message: error?.details[0]?.message });
    }
    console.log(value);

    /**
     *  CREATE THE LOG OF THIS QUESTION
     */

    /**
     *  CREATE NEW QUESTION
     */
    const newQuestion = await questions.create({
      statements,
      options,
      answers,
      code,
      fun_fact,
      createdBy: questionCreator.fullName,
    });

    if (newQuestion?.dataValues) {
      // card_image: req?.name
      // const insertImage = await cardsimages.create({
      //   question_id: newQuestion.id,
      //   card_image: req.name,
      // });

      /**
       *   Add Images to cardsimages Table in DB
       *
       */
      console.log("create data", newQuestion?.dataValues);
      await QuestionLogs.create({
        question_id: newQuestion?.dataValues.id,
        ...req.body,
        createdBy: questionCreator?.fullName,
      });

      const cardImagesData = images?.map((imgData) => {
        return {
          ...imgData,
          question_id: newQuestion.id,
        };
      });

      await cardsimages.bulkCreate(cardImagesData);
      return res.send({ status: true, question: newQuestion });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

/**
 *
 *
 * METHOD:      POST
 * ROUTE:      '/edit_question/:qid'
 * DESCRIPTION: EDIT QUESTION
 *
 *
 */
exports.editQuestion = async (req, res, next) => {
  const { questions, User, QuestionLogs, cardsimages,packquestions,packs } = req.db.models;
  const { statements, options, fun_fact, answers, code, images } = req?.body;
  const { qid } = req.params;
  const auth = req?.auth?.data;
  console.log("auth ", auth);
 

  const questionEditor = await User.findOne({
    where: {
      email: auth?.email,
    },
    attributes: ["fullName", "role_id"],
  });

  try {
    /** CHECK IF DATA PROVIDED IS VALID OR NOT */
    const { error, value } = await questionValidation(req.body);

    if (error?.details?.length > 0) {
      console.log("err", error.details);
      return res
        .status(500)
        .send({ status: false, message: error?.details[0]?.message });
    }
    console.log(value);

    /**
     * GET THE QUESTION WITH ID
     * WHICH SHOULD NEED TO BE UPDATED
     */
    const updatedQuestion = await questions.findOne({
      where: { id: qid },
    });

    console.log(updatedQuestion?.dataValues);

    /**
     *  CREATE THE LOG OF THIS QUESTION
     */

    await QuestionLogs.create({
      question_id: updatedQuestion.id,
      ...req.body,
      createdBy: updatedQuestion?.createdBy,
      editedBy: questionEditor?.fullName,
    });

    /**
     * IF QUESTION WITH
     * SPECIFI ID FOUND
     * THEN TAKE THIS ACTION BELOW
     */

    if (updatedQuestion?.dataValues) {
      // Check if any pack containing the question is in live mode
      const packing = await packquestions.findAll({
        where: { question_id: qid },
        include: [{ model: packs, where: { mode: 'LIVE'} }],
      });
      const isAdmin = questionEditor.role_id === 1;
      if (packing?.length > 0 && !isAdmin) {
        return res.send({
          status: false,
          message: "Cannot edit Question in live Pack",
        });
      }

      updatedQuestion.statements = statements;
      updatedQuestion.options = options;
      updatedQuestion.fun_fact = fun_fact;
      updatedQuestion.answers = answers;
      updatedQuestion.code = code;
      updatedQuestion.editedBy = questionEditor?.fullName;

      await questions.update(
        { ...req.body },
        {
          where: {
            id: updatedQuestion.id,
          },
        }
      );

      await updatedQuestion.save();

      /**
       * Update the card images
       */
      const cardImagesData = images?.map((imgData) => {
        return {
          ...imgData,
          question_id: updatedQuestion.id,
        };
      });

      await cardsimages.destroy({
        where: { question_id: updatedQuestion.id },
      });

      await cardsimages.bulkCreate(cardImagesData);

      /**
       *  SUCCESS MESSAGE
       * IF QUESTION UPDATED SUCCESSFULLY
       */
      return res.send({
        status: true,
        message: "question updated successfully.",
      });
    }

    return res.send({ status: false, message: "No Question Found" });
  } catch (err) {
    console.log("err", err);
    return res.send({ status: false, message: err["errors"][0]?.message });
  }
};

/**
 *
 *
 * METHOD:      DELETE
 * ROUTE:      '/delete_question/:qid'
 * DESCRIPTION: DELETE QUESTION
 *
 *
 */

exports.deleteQuestion = async (req, res, next) => {
  const { questions, Role, User, QuestionLogs, packquestions,cardsimages } = req.db.models;
  const { qid } = req.params;
  const { email, userId, role_id } = req?.auth?.data;
  // console.log("auth email ", email);
  console.log("qid ", qid);

  try {
    const roleAssigned = await Role.findOne({
      where: {
        id: role_id,
      },
      attributes: ["name"],
    });

    /**
     *  CHECK IF LOGEDIN USER IS ADMIN OR USER
     *  IF LOGEDIN USER IS NOT ADMIN  THEN HE CAN NOT DELETE QUESTION
     */
    if (roleAssigned?.name === "User") {
      return res.send({
        status: false,
        message: "Only Admin can Delete the question.",
      });
    }

    /**
     *  IF LOGEDIN USER IS ADMIN THEN CHECK IF
     *  QUESTION WITH THE GIVEN ID EXISTS
     */
    console.log("qid ", qid);
    let del_log_question = await QuestionLogs.destroy({
      where: {
        question_id: qid,
      },
    });

    console.log("Log questions ", del_log_question);

    let del_pack_questions = await packquestions.destroy({
      where: {
        question_id: qid,
      },
    });
    let del_card = await cardsimages.findAll({
      where: {
        question_id: qid,
      },
    });
    console.log("del_card",del_card);
    // const s3DeleteFile = await s3Delete(del_card?.card_image);
    const cardNames = del_card.map(card => card.card_name);
    console.log("cardNames",cardNames);
// Call s3DeleteFile for each card name
cardNames.forEach(async (cardName) => {
  try {
    await s3Delete(cardName);
  } catch (err) {
    // Handle any errors that occur during deletion
    console.error(`Error deleting card ${cardName}: ${err}`);
  }
});
    let del_card_images = await cardsimages.destroy({
      where: {
        question_id: qid,
      },
    });
    
    const questionToDelete = await questions.findOne({
      where: {
        id: qid,
      },
    });

    if (questionToDelete?.dataValues) {
      /**
       * IF QUESTION EXISTS THEN DELETE THIS Question FROM QUESTION TABLE
       */
      await questionToDelete.destroy();

      /**
       * UPON SUCCESS RETURN BELOW RESPONSE
       */
      return res.send({
        status: true,
        message: "Question Deleted Successfully",
      });
    }

    return res.send({ status: false, message: "No Question Found" });
  } catch (err) {
    console.log("err", err);
    return res.send({ status: false, message: err });
  }
};

/**
 *
 *
 * METHOD:      GET API
 * ROUTE:      'C/qId'
 * DESCRIPTION: GET  QUESTION LOGS with specific Id
 *
 *
 */

exports.questionLogs = async (req, res, next) => {
  const { questions, Role, User, QuestionLogs } = req.db.models;
  const { qid } = req.params;
  const { email, userId, role_id } = req?.auth?.data;
  // console.log("auth email ", email);

  try {
    // const roleAssigned = await Role.findOne({
    //   where: {
    //     id: role_id,
    //   },
    //   attributes: ["name"],
    // });

    /**
     *  CHECK IF LOGEDIN USER IS ADMIN OR USER
     *  IF LOGEDIN USER IS NOT ADMIN  THEN HE CAN NOT DELETE QUESTION
     */
    // if (roleAssigned?.name === "User") {
    //   return res.send({
    //     status: false,
    //     message: "Only Admin can Delete the question.",
    //   });
    // }

    /**
     *  IF LOGEDIN USER IS ADMIN THEN CHECK IF
     *  QUESTION WITH THE GIVEN ID EXISTS
     */
    const questionLog = await QuestionLogs.findAll({
      where: {
        question_id: qid,
      },
    });

    if (questionLog) {
      /**
       * UPON SUCCESS RETURN BELOW RESPONSE
       */
      return res.send({
        status: true,
        questions: questionLog,
      });
    }

    return res.send({ status: false, message: "No Question Found" });
  } catch (err) {
    return res.send({ status: false, message: err });
  }
};

/**
 * 
 * 
 * METHOD:      DELETE API
 * ROUTE:      '/image_delete/:imageId'
 * DESCRIPTION: DELETE IMAGE
 */
exports.deleteImage = async (req, res, next) => {
  const { cardsimages , User,packquestions,packs} = req.db.models;
  const { imageId } = req.params;
  const {qid}=req.params;
  console.log("qid ", qid);
  const auth = req?.auth?.data;
  console.log("auth email ", auth);
  
  const authenticatedUser = await User.findOne({
    where: {
      email: auth?.email,
    },
    attributes: ["fullName", "role_id"],
  });
  

  try {
    const imageToDelete = await cardsimages.findOne({
      where: {
        id: imageId,
      },
    });
console.log("imageToDelete",imageToDelete);
    if (imageToDelete?.dataValues) {
      /**
       * IF IMAGE EXISTS THEN DELETE THIS IMAGE FROM CARDSIMAGES TABLE
       */
      const packing = await packquestions.findAll({
        where: { question_id: qid },
        include: [{ model: packs, where: { mode: 'LIVE'} }],
      });
      const isAdmin = authenticatedUser.role_id === 1;
      if (packing?.length > 0 && !isAdmin) {
        return res.send({
          status: false,
          message: "Cannot delete Image in live Pack",
        });
      }
      console.log("imageToDelete.card_image",imageToDelete?.card_image);
      const s3DeleteFile = await s3Delete(imageToDelete?.card_image);
      console.log("s3DeleteFile",s3DeleteFile)
      await imageToDelete.destroy();

      /**
       * UPON SUCCESS RETURN BELOW RESPONSE
       */
      return res.send({
        status: true,
        message: "Image Deleted Successfully",
      });
    }

    return res.send({ status: false, message: "No Image Found" });
  } catch (err) {
    console.log("err", err);
    return res.send({ status: false, message: err });
  }
}

exports.s3ImageDelete = async (req, res, next) => {
  console.log("req.body", req.body);
  const { card_image } = req.body;
  console.log("cardImage", card_image);

  try {
    const s3DeleteFile = await s3Delete(card_image);
    console.log("s3DeleteFile", s3DeleteFile);

    return res.send({
      status: true,
      message: "Image Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);

    return res.send({
      status: false,
      message: "Image Deletion Failed",
    });
  }
};


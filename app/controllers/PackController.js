const packValidation = require("../validations/pack");

/**
 *  METHOD: GET
 *  ROUTE: 'api/pack/get_packs
 *  DESCRIPTION: GET PACKS LIST
 */

exports.getPacks = async (req, res, next) => {
  const { packs, questions } = req.db.models;
  try {
    const allPacks = await packs.findAll({
    
    });

    if (allPacks.length > 0) {
      console.log(allPacks.map((pack) => pack.toJSON()));
    } else {
      console.log(`No packs found`);
    }

    return res.send({ status: true, packs: allPacks });
  } catch (err) {
    console.log("ee", err);
    return res.send({
      status: false,
      message: "ops something went wrong while getting packs list",
    });
  }
};

exports.getPack = async (req, res, next) => {
  const { packs, questions } = req.db.models;
  const { id } = req.params;
  try {
    const pack = await packs.findOne({
      where: { id: id },
      include: [{ model: questions, through: { attributes: [] } }],
    });

    if (pack) {
      console.log(pack.toJSON());
    } else {
      console.log(`Pack with ID ${id} not found`);
    }

    return res.send({ status: true, packs: pack });
  } catch (err) {
    console.log("ee", err);
    return res.send({
      status: false,
      message: "ops something went wrong while getting packs list",
    });
  }
};

exports.getPacksMode = async (req, res, next) => {
  const { packs, questions } = req.db.models;
  const { mode } = req.params;
  try {
    const pack = await packs.findAll({
      where: { mode: mode },
      include: [{ model: questions, through: { attributes: [] } }],
    });

    if (pack.length > 0) {
      console.log(`${pack.length} packs found with mode ${mode}`);
    } else {
      console.log(`No packs found with mode ${mode}`);
    }

    return res.send({ status: true, packs: pack });
  } catch (err) {
    console.log("Error", err);
    return res.send({
      status: false,
      message: "Oops, something went wrong while getting packs list",
    });
  }
};

/**
 *  METHOD: POST
 *  ROUTE: 'api/pack/add_pack
 *  DESCRIPTION: Add a new pack
 */
exports.addNewPack = async (req, res, next) => {
  const { packs } = req.db.models;
  const { userId, role_id } = req?.auth?.data;

  try {
    const getPack = await packs.findOne({
      where: {
        pack_name: req?.body?.pack_name,
      },
    });

    if (getPack?.dataValues) {
      return res.send({ status: false, message: "Pack Already Exists" });
    }

    /**
     *  VALIDATION CHECK FOR NEW PACK CREATION
     */
    const { error, value } = await packValidation(req.body);

    if (error?.details?.length > 0) {
      console.log("err", error.details);
      return res
        .status(500)
        .send({ status: false, message: error?.details[0]?.message });
    }
    /**
     *  CREATING NEW NEW PACK
     */
    const newPack = await packs.create({ ...req.body });

    if (newPack?.id) {
      /**
       * RESPOND WITH DATA IF SUCCESS
       */
      return res.send({ status: true, newPack });
    }
    /**
     * RESPOND WITH ERROR IF NOT SUCCESS
     */
    return res.send({ status: false, message: "Opps Something went Wrong!" });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

exports.createPack = async (req, res, next) => {
  const { packs, packquestions, questions } = req.db.models;
  const { userId, role_id } = req?.auth?.data;

  try {
    const getPack = await packs.findOne({
      where: {
        pack_name: req?.body?.pack_name,
      },
    });

    if (getPack?.dataValues) {
      return res.send({ status: false, message: "Pack Already Exists" });
    }

    /**
     *  VALIDATION CHECK FOR NEW PACK CREATION
     */

    if (!["LIVE", "PLAYTEST"].includes(req.body.mode)) {
      return res.send({
        status: false,
        message: "Pack mode can only be LIVE or PLAYTEST",
      });
    }

    const { error, value } = await packValidation({
      pack_name: req.body.pack_name,
      pack_id: req.body.pack_id,
      no_cards: req.body.no_cards,
    });

    if (error?.details?.length > 0) {
      console.log("err", error.details);
      return res
        .status(500)
        .send({ status: false, message: error?.details[0]?.message });
    }

    /**
     *  CHECK IF QUESTION IDS EXIST
     */
    const questionIds = req.body.questionIds;
    const existingQuestionIds = await questions.findAll({
      attributes: ["id"],
      where: { id: questionIds },
    });
    const existingQuestionIdsArray = existingQuestionIds.map((q) => q.id);
    const invalidQuestionIds = questionIds.filter(
      (qid) => !existingQuestionIdsArray.includes(qid)
    );
    if (invalidQuestionIds.length > 0) {
      return res.send({
        status: false,
        message: `Question IDs ${invalidQuestionIds.join(", ")} do not exist.`,
      });
    }

    /**
     *  CREATING NEW NEW PACK
     */
    const { pack_name, no_cards, pack_id, mode } = req.body;
    // Create the pack
    const pack = await packs.create({
      pack_name,
      no_cards,
      pack_id,
      mode,
    });

    // Create the questions and associate them with the pack

    if (pack?.id) {
      for (const questionId of questionIds) {
        await packquestions.create({
          pack_id: pack.id,
          question_id: questionId,
        });
      }

      return res.status(201).json({ pack, questions: questionIds });
    }

    /**
     * RESPOND WITH ERROR IF NOT SUCCESS
     */
    return res.send({ status: false, message: "Opps Something went Wrong!" });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

exports.updatemode = async (req, res, next) => {
  const { packs } = req.db.models;
  const { packId } = req.params;
  const { mode } = req?.body;

  if (!["LIVE", "PLAYTEST"].includes(mode)) {
    return res.send({
      status: false,
      message: "Pack mode can only be LIVE or PLAYTEST",
    });
  }

  try {
    const pack = await packs.findOne({
      where: {
        id: packId,
      },
    });

    if (!pack?.dataValues) {
      return res.send({ status: false, message: "Pack Does Not Exist" });
    }

    await pack.update({ mode });

    return res.send({
      status: true,
      message: "Pack mode updated successfully",
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

/**
 *  METHOD: PUT
 *  ROUTE: 'api/pack/edit_pack/:packId'
 *  DESCRIPTION: Edit the existing  pack
 */
exports.editSpecificPack = async (req, res, next) => {
  const { packs, questions, packquestions } = req.db.models;
  const { userId, role_id } = req?.auth?.data;
  console.log("role ID", role_id,userId);
  const { packId } = req.params;
  const { pack_name, pack_id, no_cards, metadata, questionIds, mode } =
    req?.body;

  try {
    const pack = await packs.findOne({
      where: {
        id: packId,
      },
    });
    console.log("pack", pack);

    if (!pack?.dataValues) {
      return res.send({ status: false, message: "Pack Does Not Exist" });
    }

    /**
     *  VALIDATION CHECK FOR NEW PACK CREATION
     */

    if (!["LIVE", "PLAYTEST"].includes(mode)) {
      return res.send({
        status: false,
        message: "Pack mode can only be LIVE or PLAYTEST",
      });
    }

    const { error, value } = await packValidation({
      pack_name: req.body.pack_name,
      pack_id: req.body.pack_id,
      no_cards: req.body.no_cards,
    });

    if (error?.details?.length > 0) {
      console.log("err", error.details);
      return res
        .status(500)
        .send({ status: false, message: error?.details[0]?.message });
    }

    /**
     *  VALIDATING QUESTION IDS
     */
    const questionIdsExist = await questions.findAll({
      where: {
        id: questionIds,
      },
    });

    const questionIdsFound = questionIdsExist.map((q) => q.id);
    const questionIdsNotFound = questionIds.filter(
      (q) => !questionIdsFound.includes(q)
    );

    if (questionIdsNotFound.length > 0) {
      return res.status(404).send({
        status: false,
        message: `Question id(s) not found: ${questionIdsNotFound.join(", ")}`,
      });
    }

     /**
     *   CHECK IF ONLY ROLE_ID == 1 CAN EDIT PACK IN LIVE MODE
     */
  console.log("pack.mode", pack.mode);
     if (pack.mode === 'LIVE' && role_id !== '1') {
      return res.send({ status: false, message: "Only admins can edit packs in LIVE mode" });
    }


    /**
     *   UPDATING EXISTING PACK
     */
    await pack.update({
      pack_name,
      no_cards,
      pack_id,
      metadata,
      mode,
    });

    if (pack?.id) {
      // If the pack was updated successfully, add the new questions
      await pack.setQuestions([]);

      // Create new associations with questions
      for (const questionId of questionIds) {
        await packquestions.create({
          pack_id: pack.id,
          question_id: questionId,
        });
      }
      return res.send({ status: true, pack });
    }
    /**
     * RESPOND WITH ERROR IF NOT SUCCESS
     */
    return res.send({ status: false, message: "Opps Something went Wrong!" });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

/**METHOD: PUT
 *  ROUTE: 'api/pack/edit_packs/:packId'
 *  DESCRIPTION: Edit the existing  pack
 **/

// exports.editPack = async (req, res, next) => {
//   const { packs } = req.db.models;
//   const { userId, role_id } = req?.auth?.data;
//   const { packId } = req.params;
//   const { pack_name, pack_id, no_cards, metadata } = req?.body;

//   try {
//     const pack = await packs.findOne({
//       where: {
//         id: packId,
//       },
//     });

//     if (!pack?.dataValues) {
//       return res.send({ status: false, message: "Pack Does Not Exist" });
//     }

//     /**
//      *  VALIDATION CHECK FOR NEW PACK CREATION
//      */
//     const { error, value } = await packValidation(req.body);

//     if (error?.details?.length > 0) {
//       console.log("err", error.details);
//       return res
//         .status(500)
//         .send({ status: false, message: error?.details[0]?.message });
//     }
//     /**
//      *   UPDATING EXISTING PACK
//      */
//     pack.pack_name = pack_name;
//     pack.pack_id = pack_id;
//     pack.no_cards = no_cards;
//     pack.metadata = metadata;

//     await pack.save();

//     if (pack?.id) {
//       /**
//        * RESPOND WITH DATA IF SUCCESS
//        */
//       return res.send({ status: true, pack });
//     }
//     /**
//      * RESPOND WITH ERROR IF NOT SUCCESS
//      */
//     return res.send({ status: false, message: "Opps Something went Wrong!" });
//   } catch (err) {
//     console.log("err", err);
//     res.status(500).send(err);
//   }
// };

/**
 *  METHOD: DELETE
 *  ROUTE: 'api/pack/delete_pack/:packId'
 *  DESCRIPTION:  delete the pack with packId
 */
exports.deletePack = async (req, res, next) => {
  const { packs, packquestions } = req.db.models;
  const { packId } = req.params;
  console.log("pack id is ", packId);
  try {
    const packToDelete = await packs.findOne({
      where: {
        id: packId,
      },
    });
    console.log("here");
    console.log("found pack is ", packToDelete);
    if (packToDelete) {
      console.log("here1");

      let del_pack_questions = await packquestions.destroy({
        where: {
          pack_id: packId,
        },
      });

      console.log("pack questions ", del_pack_questions);

      let del_pack = await packs.destroy({
        where: {
          id: packId,
        },
      });
      console.log("deleted pack is ", del_pack);
      return res.send({ status: true, message: "pack deleted successfully" });
    }
  } catch (err) {
    console.log("here2");
    return res.send({
      status: false,
      message: "something went wrong while deleting the pack",
    });
  }
};

/**
 *
 *  PUBLISH THE PACK FROM PLAYTEST TO LIVE.
 *
 */
exports.publishPack = async (req, res, next) => {
  const { packs } = req.db.models;
  const { pack_name } = req.query;

  try {
    const getPack = await packs.findOne({
      where: {
        pack_name,
      },
    });

    if (getPack?.dataValues) {
      getPack.publish = true;
      await getPack.save();
      return res.send({
        status: true,
        message: "Your pack has been successfully published",
      });
    }
    return res.send({
      status: false,
      message:
        "Your pack has not been published Because something went wrong OR Pack with this name does not exist.",
    });
  } catch (e) {
    return res.send({
      status: false,
      message: "Your pack has not been published Because something went wrong.",
    });
  }
};

/**
 * METHOD: GET
 * ROUTE: 'api/pack/get_packQuestion/:packId'
 * DESCRIPTION: Get the pack questions with packId
 * */
exports.getPackQuestion = async (req, res, next) => {
    const { packs, packquestions,questions,cardsimages} = req.db.models;
    const { packId } = req.params;
    try {
      const packquestion = await packquestions.findAll({
        where: { pack_id: packId },
        include: [ 
          {
            model: questions,
            include: [cardsimages],
          }
        ],
       
      });
  
      if (packquestion.length > 0) {
        console.log(`${packquestion.length} Question found with Id ${packId}`);
      } else {
        console.log(`No Question found with id ${packId}`);
      }
  
      return res.send({ status: true, packquestion: packquestion });
    } catch (err) {
      console.log("Error", err);
      return res.send({
        status: false,
        message: "Oops, something went wrong while getting packs list",
      });
    }
  };


  /**
   * METHOD: Post
   * ROUTE: 'api/pack/archive_Pack/:packId'
   * DESCRIPTION: Archive the pack with packId
   * */
  exports.archivePack = async (req, res, next) => {
    const { packs } = req.db.models;
    const { packId } = req.params;
  
    try {
      const packToUpdate = await packs.findOne({
        where: {
          id: packId,
        },
      });
  
      if (packToUpdate) {
        packToUpdate.isArchived = true; // Change the value of isArchived to true
        await packToUpdate.save(); // Save the updated pack
  
        return res.send({ status: true, message: "Pack archived successfully" });
      } else {
        return res.send({ status: false, message: "Pack not found" });
      }
    } catch (err) {
      return res.send({
        status: false,
        message: "Something went wrong while archiving the pack",
      });
    }
  };
  /**
   * METHOD: Post
   * ROUTE: 'api/pack/unArchivePack/:packId'
   * DESCRIPTION: UnArchive the pack with packId
   * */

  exports.unarchivePack = async (req, res, next) => {
    const { packs } = req.db.models;
    const { packId } = req.params;
  
    try {
      const packToUpdate = await packs.findOne({
        where: {
          id: packId,
        },
      });
  
      if (packToUpdate) {
        packToUpdate.isArchived = false; // Change the value of isArchived to false
        await packToUpdate.save(); // Save the updated pack
  
        return res.send({ status: true, message: "Pack unarchived successfully" });
      } else {
        return res.send({ status: false, message: "Pack not found" });
      }
    } catch (err) {
      return res.send({
        status: false,
        message: "Something went wrong while unarchiving the pack",
      });
    }
  };
  
  
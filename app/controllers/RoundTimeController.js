exports.getRoundTime = async (req, res, next) => {
  try {
    // const userId = req?.auth?.data?.userId;
    const { RoundTime } = req.db.models;
    //const { number_players, changed_votes } = req.body;

    const roundtime = await RoundTime.findAll({});

    if (roundtime.length) {
      res.status(200).send({
        success: true,
        message: "Round Times are ",
        roundtime,
      });
    } else {
      res.status(200).send({
        success: false,
        message: "No Round Times found",
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

exports.getRoundTime = async (req, res, next) => {
  try {
    // const userId = req?.auth?.data?.userId;
    const { RoundTime } = req.db.models;
    //const { number_players, changed_votes } = req.body;

    const roundtime = await RoundTime.findAll({});

    if (roundtime.length) {
      res.status(200).send({
        success: true,
        message: "Round Times are ",
        roundtime,
      });
    } else {
      res.status(200).send({
        success: false,
        message: "No Round Times found",
      });
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
 * ROUTE:      '/editRoundTime'
 * DESCRIPTION: EDIT Round Time
 *
 *
 */
exports.editRoundTime = async (req, res, next) => {
  const { RoundTime, User } = req.db.models;
  const { round_time } = req?.body;
  const { rid } = req.params;
  const auth = req?.auth?.data;
  console.log("auth ", auth);

  const roundEditor = await User.findOne({
    where: {
      email: auth?.email,
    },
    attributes: ["fullName"],
  });

  try {
    const updatedTime = await RoundTime.findOne({
      where: { id: rid },
    });

    console.log(updatedTime?.dataValues);

    /**
     * IF Round Time WITH
     * SPECIFI ID FOUND
     * THEN TAKE THIS ACTION BELOW
     */

    if (updatedTime?.dataValues) {
      updatedTime.round_time = round_time;

      await RoundTime.update(
        { ...req.body },
        {
          where: {
            id: updatedTime.id,
          },
        }
      );

      /**
       *  SUCCESS MESSAGE
       * IF QUESTION UPDATED SUCCESSFULLY
       */
      return res.send({
        status: true,
        message: "Round Time updated successfully.",
      });
    }

    return res.send({ status: false, message: "No Round Time found" });
  } catch (err) {
    console.log("err", err);
    return res.send({ status: false, message: err["errors"][0]?.message });
  }
};

/**
 *  METHOD: DELETE
 *  ROUTE: 'api/pack/delete_pack/:packId'
 *  DESCRIPTION:  delete the pack with packId
 */
exports.delete_RoundTime = async (req, res, next) => {
  const { RoundTime } = req.db.models;
 
  const { rid } = req.params;
  const auth = req?.auth?.data;
  console.log("auth ", auth);

 

  try {
    const updatedTime = await RoundTime.findOne({
      where: { id: rid },
    });

    console.log(updatedTime?.dataValues);

    if (updatedTime?.dataValues) {
   
     let Deleted = await RoundTime.update(
        {    is_deleted : true},
        {
          where: {
            id: rid,
          },
        }
      );

      /**
       *  SUCCESS MESSAGE
       * IF QUESTION UPDATED SUCCESSFULLY
       */
      return res.send({
        status: true,
        message: "Round Time updated successfully.",
      });
    }

    return res.send({ status: false, message: "No Round Time found" });
  } catch (err) {
    console.log("err", err);
    return res.send({ status: false, });
  }
};

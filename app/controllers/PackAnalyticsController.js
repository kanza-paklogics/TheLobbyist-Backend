const { sequelize } = require("../../models");
const Sequelize = require("sequelize");
const { Op, where } = require("sequelize");
// const { Json } = require("sequelize/types/utils");

const isEqual = (a, b) => {
  return a === b;
};
/**
 *
 *
 * METHOD:       POST
 * ROUTE:       '/api/question_analytics/add_record'
 * DESCRIPTION:  ADD NEW QUESTION RECORD
 *
 *
 */
exports.add_record = async (req, res, next) => {
  const { PackAnalytics } = req.db.models;
  // console.log(req?.file);

  const { pack_id, player } = req?.body;
  // const { email, userId, role_id } = req?.auth?.data;

  // find the existing record or create a new one if not found

  try {
    /**
     * CREATE NEW RECORD IN QUESTION ANALYTICS TABLE
     */

    // const createRecord = await PackAnalytics.create({
    //   pack_id: 3,
    //   players: {
    //     "four": 1,
    //     "five": 0,
    //     "six": 1,
    //     "eight": 1
    //   }
    // });
    // return res.send({ createRecord });
    const existingRecord = await PackAnalytics.findOne({
      where: { pack_id: pack_id },
    });

    if (existingRecord) {
      let tempObj;
      if (existingRecord.players) {
        tempObj = existingRecord.players;
        tempObj[player] += 1;
        existingRecord.players = { ...tempObj };
        await PackAnalytics.update(
          { players: tempObj },
          { where: { pack_id: pack_id } }
        );
        return res.send({ existingRecord });
      }
    } else {
      const createRecord = await PackAnalytics.create({
        pack_id: pack_id,
        players: {
          four: 0,
          five: 0,
          six: 0,
          eight: 0,
        },
      });
      if (createRecord.hasOwnProperty("players")[player]) {
        let tempRecord = (createRecord.players[player] += 1);
        await PackAnalytics.update(
          { players: { ...tempRecord } },
          { where: { pack_id: pack_id } }
        );
        res.send({ createRecord });
      }

      let tempRecord = (createRecord.players[player] = 1);
      await PackAnalytics.update(
        { players: { ...tempRecord } },
        { where: { pack_id: pack_id } }
      );
      res.send({ createRecord });
      // await createRecord.save();
    }
    // if (existingRecord) {

    //   const playerKey = existingRecord.players.hasOwnProperty(player);

    //   if (playerKey) {
    //     let tempObj = existingRecord
    //     // tempObj.players.five.count += 1;
    //     // tempObj.players.five.questions += 1;

    //     console.log("question", tempObj.players.five);
    //     console.log("count", tempObj.players.five);

    //     // const updateRecord = await existingRecord.save();
    //     // console.log("updateRecord", updateRecord);
    //     return res.send({ record: tempObj });

    //   }
    //   // else {
    //   //   existingRecord.players[player]["count"] = 1;
    //   //   existingRecord.players[player]["questions"] = 1;
    //   //   const updateRecord = await existingRecord.save();
    //   //   console.log("updateRecord", updateRecord);
    //   //   return res.send(updateRecord);
    //   // }
    // }
    // else {
    //     // an existing record was found, try to find a matching key in the players object
    //     const playerKey = Object.keys(existingRecord.players).find((key) =>
    //       isEqual(existingRecord.players[key], player)
    //     );

    //     if (playerKey) {
    //       // increment the count and questions properties
    //       existingRecord.players[playerKey].count += 1;
    //       existingRecord.players[playerKey].questions += 1;

    //       // save the updated record
    //       await existingRecord.save();

    //       // access the updated record
    //       console.log(existingRecord.toJSON());
    //     return res.send({status: 'success', data: existingRecord.toJSON()})
    //     } else {
    //       // add a new key to the players object
    //       const newPlayerKey = Object.keys(players)[0]; // use the first key in the players object
    //       existingRecord.players[newPlayerKey] = players[newPlayerKey];

    //       // save the updated record
    //       await existingRecord.save();

    //       // access the updated record
    //     return res.send({status: 'success', data: existingRecord.toJSON()})

    //     }
    //   }
  } catch (err) {
    console.log("err", err);
    return res.status(500).send(err);
  }
};

exports.get_record = async (req, res, next) => {
  const { PackAnalytics } = req.db.models;
  // console.log(req?.file);

  const { pack_id } = req?.params;

  try {
    const packRecord = await PackAnalytics.findOne({where:{ pack_id: pack_id }});
    res.send({ packRecord });
  } catch (err) {
    console.log("err", err);
  }
};

exports.get_records = async (req, res, next) => {
  const { PackAnalytics } = req.db.models;
  // console.log(req?.file);


  try {
    const packRecord = await PackAnalytics.findAll({});
    res.send({ packRecord });
  } catch (err) {
    console.log("err", err);
  }
};

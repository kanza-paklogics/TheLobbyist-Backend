const cardValidation = require("../validations/cards");
const { sequelize } = require("../../models/index");




exports.addNewCard = async (req, res, next) => {
  const { packId } = req.query;
  const { cards, packs } = req.db.models;

  try {
    /**
     *  CHECK IF PACK TABLE EXISTS AND GET CARD LIMIT
     */
    const checkLimit = await packs.findOne({
      where: {
        id: packId,
      },
      attributes: ["no_cards"],
    });

    if (checkLimit?.dataValues) {
      const cardsInTable = await cards.count({
        where: {
          pack_id: packId,
        },
      });
      /**
       *  CHECK IF LIMIT IS EXCEEDING OR NOT
       */
      let flag = cardsInTable <= checkLimit?.dataValues["no_cards"];
      if (flag) {
        const { error, value } = await cardValidation(req.body);
        /**
         *  CHECK IF DATA PROVIDED IS VALID
         */
        if (error?.details?.length > 0) {
          console.log("err", error.details);
          return res
            .status(500)
            .send({ status: false, message: error?.details[0]?.message });
        }
        /**
         *  CREATE CARD IF DATA IS VALID
         */
        const newCard = await cards.create({ ...req.body, pack_id: packId });

        return res.send({ status: true, newCard });
      }
      return res.send({
        status: false,
        message: "you have exceeded the maximum limit.",
      });
    }

    return res.send({
      status: false,
      message: "No Pack Exist With this Id Please Create a Pack First.",
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};


exports.editCard = async (req, res, next) => {
  const { packId } = req.query;
  const { cards, packs } = req.db.models;

  try {
    /**
     *  CHECK IF PACK TABLE EXISTS AND GET CARD LIMIT
     */
    const checkLimit = await packs.findOne({
      where: {
        id: packId,
      },
      attributes: ["no_cards"],
    });

    if (checkLimit?.dataValues) {
      const cardsInTable = await cards.count({
        where: {
          pack_id: packId,
        },
      });
      /**
       *  CHECK IF LIMIT IS EXCEEDING OR NOT
       */
      let flag = cardsInTable <= checkLimit?.dataValues["no_cards"];
      if (flag) {
        const { error, value } = await cardValidation(req.body);
        /**
         *  CHECK IF DATA PROVIDED IS VALID
         */
        if (error?.details?.length > 0) {
          console.log("err", error.details);
          return res
            .status(500)
            .send({ status: false, message: error?.details[0]?.message });
        }
        /**
         *  CREATE CARD IF DATA IS VALID
         */
        const newCard = await cards.create({ ...req.body, pack_id: packId });

        return res.send({ status: true, newCard });
      }
      return res.send({
        status: false,
        message: "you have exceeded the maximum limit.",
      });
    }

    return res.send({
      status: false,
      message: "No Pack Exist With this Id Please Create a Pack First.",
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};

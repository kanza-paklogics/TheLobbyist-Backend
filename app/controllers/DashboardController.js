const { sequelize } = require("../../models");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");


exports.questionPlayedMost = async (req, res, next) => {
  const { Analytics, questions } = req?.db?.models;

  try {
    const results = await Analytics.findAll({
      attributes: [
        'question_id',
        [Sequelize.fn('count', Sequelize.col('question_id')), 'question_count']
      ],
      include: [
        {
          model: questions,
          attributes: ['code']
        }
      ],
      group: ['question_id'],
      order: [[Sequelize.literal('question_count'), 'DESC']],
      limit: 5,
    });

    console.log("results", results);

    const record = results.map(result => {
      return {
        question_id: result.question_id,
        question_count: result.dataValues.question_count, // Include question_count
        question_code: result.question ? result.question.code : null,
      };
    });

    if (record.length > 0) {
      return res.send({
        status: true,
        data: record,
      });
    }

    return res.send({
      status: false,
      message: "Something went wrong while retrieving the record.",
    });
  } catch (err) {
    console.log("err", err);
    return res.send(err);
  }
};



  
  

  exports.CardPlayedMost = async (req, res, next) => {
    const { scannedcards, cardsimages } = req?.db?.models;
  
    try {
      const results = await scannedcards.findAll({
        attributes: [
          'card_id',
          [Sequelize.fn('count', Sequelize.col('card_id')), 'card_count'],
        ],
        group: ['card_id'],
        order: [[Sequelize.literal('card_count'), 'DESC']],
        limit: 5,
        include: [{ model: cardsimages, attributes: ['card_name'] }],
      });
  
      const record = results.map(result => ({
        card_id: result.card_id,
        card_count: result.dataValues.card_count,
        card_name: result.cardsimage.card_name,
      }));
  
      if (record) {
        return res.send({
          status: true,
          data: record,
        });
      }
  
      return res.send({
        status: false,
        message: 'Failed to retrieve the record.',
      });
    } catch (err) {
      console.log('err', err);
      return res.send(err);
    }
  };
  
  

  
  
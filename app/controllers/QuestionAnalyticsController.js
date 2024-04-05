const { sequelize } = require("../../models");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
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
  const { Analytics,questions } = req.db.models;



  try {
    /**
     * CREATE NEW RECORD IN QUESTION ANALYTICS TABLE
     */
    /**
     * CHECK IF REQUIRED FIELDS ARE PRESENT IN BODY
     */
    const requiredFields = ["question_id", "roomId", "option", "device"];
    const missingFields = [];
    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field); 
      }
    });
    if (missingFields.length > 0) {
      return res.send({
        status: false,
        message: ` Missing Fields ${missingFields.join(", ")}`,
      });
    }

    /**
     * CHECK IF QUESTION IS PRESENT IN QUESTION TABLE
     * IF NOT PRESENT THEN RETURN ERROR
     * ELSE CREATE NEW RECORD
     *
     *
     * */

const question = await questions.findOne({
  where: {
    id: req.body.question_id,
  },
  attributes: ["id"],
});
if(!question){
  return res.send({
    status: false,
    message: "Question not found",
  });
}

    const record = await Analytics.create({
      ...req.body,
    });

    if (record) {
      return res.send({ status: true, message: "Record Added Successfully" });
    }
    return res.send({
      status: false,
      message: "something went wrong while creating record",
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};
/**
 *
 *
 * METHOD:       GET
 * ROUTE:       '/api/question_analytics/get_record'
 * DESCRIPTION:  GET QUESTION RECORD
 *
 *
 */

exports.get_record = async (req, res, next) => {
  const { Analytics  } = req?.db?.models;
  const{anaId} = req?.params;
  // console.log(req?.file);
  // const { email, userId, role_id } = req?.auth?.data;

  try {
    /**
     * GET  RECORD FROM QUESTION ANALYTICS TABLE
     */
    
   const results  =await  Analytics.findAll({
    where: {
      question_id: anaId,
    },
      attributes: ['question_id', 'option', [Sequelize.fn('count', Sequelize.col('option')), 'option_count']],
      group: ['question_id', 'option']
    })
    
      // Transform the Sequelize results into the desired format
      const record = results.reduce((acc, curr) => {
        const questionId = curr.question_id;
        const option = curr.option;
        const optionCount = curr.dataValues.option_count;
        const questionObj = acc.find(obj => obj.question_id === questionId);
        if (questionObj) {
          questionObj.options.push({ option, option_count: optionCount });
        } else {
          acc.push({ question_id: questionId, options: [{ option, option_count: optionCount }] });
        }
        return acc;
      }, []);
    
    if (record) {
   
      return res.send({
        status: true,
        data: record,
        // total: await Analytics.count(),
      });
    }
    return res.send({
      status: false,
      message: "something went wrong while creating record",
    });
  } catch (err) {
    console.log("err", err);
    return res.send(err);
  }
};

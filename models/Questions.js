"use strict";
const { Model } = require("sequelize");
const questionValidation = require("../app/validations/questions");
const Packs = require("../models/Packs");
module.exports = (sequelize, DataTypes) => {
  class Questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { cards, questions, packs } = models;
      
     // packs.hasMany(questions, { foreignKey: "pack_id" });
      //questions.belongsTo(packs, { foreignKey: "pack_id" });
      questions.belongsToMany(packs, {
        through: 'packquestions',
        foreignKey: 'question_id'
      });
    }
  }
  Questions.init(
    {
      statements: {
        type: DataTypes.STRING,
        unique: true,
      },
      answers: {
        type: DataTypes.STRING,
      },
      options: {
        type: DataTypes.JSON,
      },
      fun_fact: {
        type: DataTypes.TEXT,
      },
      code: {
        type: DataTypes.STRING,
      },
      // card_image: {
      //   type: DataTypes.ARRAY(DataTypes.STRING),
      // },
      createdBy: {
        type: DataTypes.STRING,
      },
      editedBy: {
        type: DataTypes.STRING,
      },
     
    },
    {
      sequelize,
      modelName: "questions",
    }
  );
  return Questions;
};




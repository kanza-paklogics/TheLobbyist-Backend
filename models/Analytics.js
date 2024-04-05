"use strict";
const { Model } = require("sequelize");


module.exports = (sequelize, DataTypes) => {
  class Analytics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {  questions } = models;
      questions.hasMany(Analytics, { foreignKey: "question_id" });
      Analytics.belongsTo(questions, { foreignKey: "question_id" });
      
    }
  }
  Analytics.init(
    {
      roomId:{
        type:DataTypes.STRING,
      },
      option:{
        type:DataTypes.STRING,
      },
      device:{
        type:DataTypes.STRING,
      }
      
    },
    
    {
      sequelize,
      modelName: "Analytics",
    }
  );
  return Analytics;
};

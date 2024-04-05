"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CardsImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { questions } = models;
      questions.hasMany(this, { foreignKey: "question_id"});
      // questions.hasMany(this, { foreignKey: "question_id", onDelete:'cascade'});
      this.belongsTo(questions, { foreignKey: "question_id" });
    }
  }
  CardsImages.init(
    {
      card_name: {
        type: DataTypes.STRING,
        unique: true,
      },
      card_image: {
        type: DataTypes.STRING,
        // type: DataTypes.ARRAY(DataTypes.STRING),
      },
      metadata: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "cardsimages",
    }
  );
  return CardsImages;
};

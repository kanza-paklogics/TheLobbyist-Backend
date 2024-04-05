"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { cards, packs, questions } = models;
      packs.hasMany(cards, { foreignKey: "pack_id" });
      cards.belongsTo(packs, { foreignKey: "pack_id" });
      // questions.hasMany(cards, { foreignKey: "question_id" });
      // cards.belongsTo(questions, { foreignKey: "question_id" });
    }
  }
  Cards.init(
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
      modelName: "cards",
    }
  );
  return Cards;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ScannedCards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { cardsimages, device, scannedcards } = models;
      cardsimages.hasMany(scannedcards, { foreignKey: "card_id" });
      scannedcards.belongsTo(cardsimages, { foreignKey: "card_id" });
      // device.hasMany(scannedcards, { foreignKey: "device_id" });
      // scannedcards.belongsTo(device, { foreignKey: "device_id" });
      //   packs.hasMany(cards, { foreignKey: "pack_id" });
      //   cards.belongsTo(packs, { foreignKey: "pack_id" });
      // questions.hasMany(cards, { foreignKey: "question_id" });
      // cards.belongsTo(questions, { foreignKey: "question_id" });
    }
  }
  ScannedCards.init(
    {
      device_id: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "scannedcards",
    }
  );
  return ScannedCards;
};

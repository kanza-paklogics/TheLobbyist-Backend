"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Packs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { packs,questions } = models;

      packs.belongsToMany(questions, {
        through: 'packquestions',
        foreignKey: 'pack_id',
        otherKey: 'question_id',
      });
    }
  }
  Packs.init(
    {
      pack_name: {
        type: DataTypes.STRING,
        unique: true,
      },
      pack_id: {
        type: DataTypes.STRING,
        unique: true,
      },
      no_cards: {
        type: DataTypes.INTEGER,
      },
      publish: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      mode: {
        type: DataTypes.ENUM('PLAYTEST', 'LIVE')
      },
      metadata: {
        type: DataTypes.STRING,
      },
      isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "packs",
    }
  );
  return Packs;
};

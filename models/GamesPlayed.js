"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class GamesPlayed extends Model {
    static associate(models) {
      // Define associations here
    }
  }
  GamesPlayed.init(
    {
      roomId: {
        type: DataTypes.STRING,
      },
      numberOfPlayers: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "GamesPlayed",
    }
  );
  return GamesPlayed;
};

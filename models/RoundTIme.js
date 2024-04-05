"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RoundTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoundTime.init(
    {
      round_time: {
        type: DataTypes.STRING,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
      },
      metadata: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "RoundTime",
    }
  );
  return RoundTime;
};

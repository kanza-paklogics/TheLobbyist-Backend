// module.exports = (sequelize, Sequelize) => {
//     const Votes = sequelize.define("votes", {
//       winning_criteria: {
//         type: Sequelize.INTEGER,
//       },
//       no_players: {
//         type: Sequelize.INTEGER,
//       },
//       metadata: {
//         type: Sequelize.STRING,
//       },
//     });
//     return Votes;
//   };

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Votes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Votes.init(
    {
      winning_criteria: {
        type: DataTypes.INTEGER,
      },
      no_players: {
        type: DataTypes.INTEGER,
      },
      metadata: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "votes",
    }
  );
  return Votes;
};

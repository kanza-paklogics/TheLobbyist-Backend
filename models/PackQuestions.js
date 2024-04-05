const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PackQuestions extends Model {
    static associate(models) {
      PackQuestions.belongsTo(models.packs, {
        foreignKey: "pack_id",
      });
      PackQuestions.belongsTo(models.questions, {
        foreignKey: "question_id",
      });
      // define association here
    }
  }
  PackQuestions.init(
    {
      pack_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "packs",
          key: "id",
        },
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "questions",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "packquestions",
    }
  );
  return PackQuestions;
};
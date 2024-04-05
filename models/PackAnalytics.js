"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PackAnalytics extends Model {
    static associate(models) {
      const { questions, packs } = models;
      
      packs.hasMany(PackAnalytics, { foreignKey: "pack_id" });
      PackAnalytics.belongsTo(packs, { foreignKey: "pack_id" });
    }
  }
  
  PackAnalytics.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      pack_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      players: {
        type: DataTypes.JSON,
        allowNull: false,
       
      },
    },
    {
      sequelize,
      modelName: "PackAnalytics",
      timestamps:true
     
    }
  );
  

  return PackAnalytics;
};

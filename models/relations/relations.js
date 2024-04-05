module.exports = function (sequelize, DataTypes) {
  const { User, Role, Cards, Packs, Questions } = sequelize.models;

  Role.hasMany(User, { foreignKey: "role_id" });
  User.belongsTo(Role, { foreignKey: "role_id" });

  Cards.hasMany(Questions, { foreignKey: "card_id" });
  Questions.belongsTo(Cards, { foreignKey: "card_id" });

  Packs.hasMany(Cards, { foreignKey: "pack_id" });
  Cards.belongsTo(Packs, { foreignKey: "pack_id" });
};

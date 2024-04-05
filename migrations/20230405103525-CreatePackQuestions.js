'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('packquestions', {
      pack_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "packs",
          key: "id",
        },
      },
      question_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "questions",
          key: "id",
        },
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('packquestions');

  }
};

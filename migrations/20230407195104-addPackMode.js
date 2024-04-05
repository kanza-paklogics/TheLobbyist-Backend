'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('packs', 'mode', {
      type: Sequelize.DataTypes.ENUM('PLAYTEST', 'LIVE'),
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('packs', 'mode');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Ranks', [
      {
        id:1,
        nickname: 'yuzaa',
        score: 1000,
        stage: 1,
        subcha:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id:2,
        nickname: 'mnmm',
        score: 2000,
        stage: 1,
        subcha:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id:3,
        nickname: 'ria',
        score: 3000,
        stage: 1,
        subcha:3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id:4,
        nickname: 'jaejin',
        score: 4000,
        stage: 1,
        subcha:4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ], {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Ranks', null, {});

  }
};

const { sequelize } = require("../../models");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");


exports.totalGames = async (req, res, next) => {
    const { GamesPlayed } = req?.db?.models;

    try {
      // Total games played
      const totalGames = await GamesPlayed.count();
  
      // Daily games played
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const dailyGames = await GamesPlayed.count({
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
          },
        },
      });
  
      // Weekly games played
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay(), 0, 0, 0);
      const weeklyGames = await GamesPlayed.count({
        where: {
          createdAt: {
            [Op.gte]: startOfWeek,
          },
        },
      });
  
      // Monthly games played
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
      const monthlyGames = await GamesPlayed.count({
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
          },
        },
      });
  
      return res.send({
        status: true,
        data: {
          totalGames,
          dailyGames,
          weeklyGames,
          monthlyGames,
        },
      });
    } catch (err) {
      console.log("err", err);
      return res.send(err);
    }
  };

  exports.getGamesByTimeInterval = async (req, res, next) => {
    const { GamesPlayed } = req?.db?.models;
    const { interval } = req.params;
  
    try {
      let startDate, endDate;
  
      // Calculate the start and end dates based on the selected interval
      if (interval === 'day') {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
      } else if (interval === 'week') {
        const today = new Date();
        const startOfWeek = today.getDate() - today.getDay() + 1;
        startDate = new Date(today.setDate(startOfWeek));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.setDate(startOfWeek + 6));
      } else if (interval === 'month') {
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      } else {
        return res.send({
          status: false,
          message: "Invalid interval. Please specify 'day', 'week', or 'month'.",
        });
      }
  
      // Retrieve games based on the selected interval
      const games = await GamesPlayed.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
  
      return res.send({
        status: true,
        data: games,
      });
    } catch (err) {
      console.log("err", err);
      return res.send(err);
    }
  };
  
  exports.getYearlyGameData = async (req, res, next) => {
    const { GamesPlayed } = req?.db?.models;
  
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
  
      // Define an array of month names
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
  
      // Initialize an array to store monthly game data
      const monthlyGameData = [];
  
      // Loop through each month from January to December
      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);
  
        // Retrieve games played within the current month
        const games = await GamesPlayed.findAll({
          where: {
            createdAt: {
              [Op.between]: [startDate, endDate],
            },
          },
        });
  
        // Store the game count and month name for the current month
        const monthData = {
          monthName: monthNames[month],
          gameCount: games.length,
        };
        monthlyGameData.push(monthData);
      }
  
      return res.send({
        status: true,
        data: monthlyGameData,
      });
    } catch (err) {
      console.log("err", err);
      return res.send(err);
    }
  };

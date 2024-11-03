const cron = require('node-cron');

cron.schedule('50 20 * * *', () => { // Задайте время немного позже текущего
  console.log(`Задача запустилась вовремя: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Kaliningrad' })}`);
}, {
  scheduled: true,
  timezone: "Europe/Kaliningrad" // Часовой пояс Калининграда
});

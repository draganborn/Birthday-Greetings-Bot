const { google } = require('googleapis');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Настройка Google Sheets API
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  keyFile: '/home/max/Documents/birthday_bot/for-birthday-bot-b347cad2a667.json', // Укажите путь к вашему JSON-файлу
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Настройка Telegram Bot
const token = '7906410073:AAFNmNWAW4G4Uj1QWt_uKtAIKPlnrZEJUo0'; // Замените на ваш токен
const bot = new TelegramBot(token, { polling: true });

// Функция для получения данных из Google Sheets
async function getDataFromSheet() {
  const client = await auth.getClient();
  const spreadsheetId = '1OZwZapUykBgTBt9sRgMfodzl9F1aBar-ILIwvv7GKlI'; // Замените на ID вашей таблицы
  const range = 'page1!A2:D2'; // Укажите диапазон, который хотите получить

  const response = await sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range,
  });

  return response.data.values;
}

// Функция для генерации поздравления
function generateGreeting(name, position) {
  return `Дорогой(ая) ${name}, поздравляем вас с днем рождения! Желаем вам успехов на должности ${position} и всего наилучшего!`;
}

// Функция для отправки сообщения в Telegram
async function sendMessageToTelegram(chatId, message) {
  await bot.sendMessage(chatId, message);
}

// Пример использования
getDataFromSheet()
  .then(data => {
    console.log(data);
    // Здесь вы можете добавить логику для генерации поздравлений и отправки их в Telegram

    // Пример: отправка поздравления в Telegram
    const [name, position, chatId] = data[0];
    const greeting = generateGreeting(name, position);
    sendMessageToTelegram(chatId, greeting);
  })
  .catch(error => {
    console.error('Ошибка при получении данных:', error);
  });

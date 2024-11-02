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
  const range = 'page1!A2:E101'; // Получаем данные со 2 по 101 строку

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

// Функция для отправки сообщения в Telegram с задержкой
async function sendMessageToTelegramWithDelay(chatId, message, delay) {
  return new Promise(resolve => setTimeout(resolve, delay)).then(() => bot.sendMessage(chatId, message));
}

// Функция для проверки, наступает ли день рождения через 3 дня
function isBirthdayInThreeDays(birthdayStr) {
  const today = new Date();
  const [day, month] = birthdayStr.split('.').map(Number); // Разбиваем дату на день и месяц
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day); // Создаем дату без учета года рождения

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  return (
    birthdayThisYear.getDate() === threeDaysFromNow.getDate() &&
    birthdayThisYear.getMonth() === threeDaysFromNow.getMonth()
  );
}

// Пример использования с проверкой дня рождения и задержкой отправки
getDataFromSheet()
  .then(async (data) => {
    console.log(data);

    // Проходим по каждой строке, извлекая нужные данные
    for (const row of data) {
      const [name, position, , birthdayStr, chatId] = row;

      // Проверяем, заполнены ли необходимые ячейки
      if (name && position && birthdayStr && chatId) {
        // Проверяем, наступает ли день рождения через три дня
        if (isBirthdayInThreeDays(birthdayStr)) {
          const greeting = generateGreeting(name, position);
          
          // Отправляем сообщение с задержкой 1 секунда (1000 мс)
          await sendMessageToTelegramWithDelay(chatId, greeting, 1000);
        }
      }
    }
  })
  .catch(error => {
    console.error('Ошибка при получении данных:', error);
  });

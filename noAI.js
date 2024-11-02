//process.emitWarning = () => {};

const { google } = require('googleapis');
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
  const range = 'page1!A2:E101'; // Укажите диапазон, который хотите получить

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

// Функция для проверки, наступает ли день рождения через 3 дня
function isBirthdayInThreeDays(birthday) {
  const today = new Date();
  const birthdayDate = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  return birthdayDate.getDate() === threeDaysFromNow.getDate() && birthdayDate.getMonth() === threeDaysFromNow.getMonth();
}

// Пример использования
getDataFromSheet()
  .then(data => {
    const today = new Date(); // Определяем today здесь
    data.forEach(row => {
      const [name, position, , birthdayStr, chatId] = row;

      // Проверяем, заполнены ли необходимые ячейки
      if (name && position && birthdayStr && chatId) {
        const birthdayParts = birthdayStr.split('.');
        const birthday = new Date(today.getFullYear(), birthdayParts[1] - 1, birthdayParts[0]); // Предполагаем формат ДД.ММ

        if (isBirthdayInThreeDays(birthday)) {
          const greeting = generateGreeting(name, position);
          sendMessageToTelegram(chatId, greeting);
        }
      }
    });
  })
  .catch(error => {
    console.error('Ошибка при получении данных:', error);
  });


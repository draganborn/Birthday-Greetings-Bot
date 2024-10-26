const { google } = require('googleapis');
//const axios = require('axios');
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
// Функция для генерации поздравления с использованием GigaChat
//
//
//
const https = require('https');
const axios = require('axios');

// Конфигурация для доступа
const authKey = 'NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOmNjYTIxZWM4LThkMjUtNDc3Yy04OGJmLTU5ZmRhYjEzMzg0Ng=='; // Ваш Authorization key для Basic-аутентификации (проверьте правильность)
const authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1/models';
const scope = 'GIGACHAT_API_PERS';

// Функция для получения Access token
async function getAccessToken() {
  try {
    const response = await axios.post(
      authUrl,
      new URLSearchParams({ 'scope': encodeURIComponent(scope) }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': `Basic ${authKey}`,
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Для самоподписанных сертификатов
      }
    );
    console.log('Access token response:', response.data); // Для отладки
    return response.data.access_token; // Вернется Access token
  } catch (error) {
    // Выводим больше информации об ошибке
    console.error('Ошибка при получении Access token:', error.response ? error.response.data : error.message);
    console.error('Полный ответ сервера:', error.response ? error.response : error);
    throw error;
  }
}

// Основная функция для работы с Google Sheets и отправки поздравлений
async function main() {
  try {
    const accessToken = await getAccessToken(); // Получаем Access token
    console.log('Access token получен:', accessToken);
    
    // Пример использования accessToken
    const greeting = await generateGreeting('Иван Иванов', 'Менеджер', accessToken);
    console.log(greeting);
  } catch (error) {
    console.error('Ошибка в процессе выполнения:', error);
  }
}

// Запуск
main();

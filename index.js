const { google } = require('googleapis');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const https = require('https');

// Настройка Google Sheets API
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  keyFile: '/home/max/Documents/birthday_bot/for-birthday-bot-b347cad2a667.json', // Укажите путь к вашему JSON-файлу
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Настройка Telegram Bot
const token = '7906410073:AAFNmNWAW4G4Uj1QWt_uKtAIKPlnrZEJUo0'; // Замените на ваш токен
const bot = new TelegramBot(token, { polling: true });

// Конфигурация для доступа к GigaChat
const authKey = 'Basic NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOmNjYTIxZWM4LThkMjUtNDc3Yy04OGJmLTU5ZmRhYjEzMzg0Ng=='; // Ваш Authorization key для Basic-аутентификации
const authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1/models';
const scope = 'GIGACHAT_API_PERS';

// Функция для получения Access Token от GigaChat
async function getAccessToken() {
  try {
    const response = await axios.post(
      authUrl,
      new URLSearchParams({ 'scope': encodeURIComponent(scope) }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authKey,
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Для самоподписанных сертификатов
      }
    );
    return response.data.access_token; // Вернется Access Token
  } catch (error) {
    console.error('Ошибка при получении Access Token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

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

  return response.data.values; // Возвращает массив данных
}

// Функция для генерации поздравления через GigaChat
async function generateGreeting(name, position, accessToken) {
  try {
    const prompt = `Сгенерируй поздравление с днем рождения для ${name}, работающего на позиции ${position}.`;

    const response = await axios.post(
      `${apiUrl}/chat`,
      { prompt }, // Тело запроса
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Для самоподписанных сертификатов
      }
    );

    return response.data.message; // Возвращаем сгенерированное поздравление
  } catch (error) {
    console.error('Ошибка при генерации поздравления:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Основная функция для получения данных из Sheets, генерации поздравления и отправки его в Telegram
async function main() {
  try {
    const accessToken = await getAccessToken(); // Получаем Access Token
    console.log('Access token получен:', accessToken);

    const data = await getDataFromSheet(); // Получаем данные из Google Sheets
    const name = data[0][0]; // Предположим, что имя хранится в первом столбце
    const position = data[0][1]; // Предположим, что должность во втором столбце

    const greeting = await generateGreeting(name, position, accessToken); // Генерируем поздравление
    console.log('Сгенерированное поздравление:', greeting);

    // Отправляем поздравление в Telegram
    const chatId = '<your_chat_id>'; // Замените на ID чата или группы
    bot.sendMessage(chatId, greeting); // Отправляем сообщение в чат
  } catch (error) {
    console.error('Ошибка в процессе выполнения:', error);
  }
}

// Запуск
main();

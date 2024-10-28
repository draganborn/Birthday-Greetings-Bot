const { google } = require('googleapis');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const https = require('https');
const sheets = google.sheets('v4');

// Настройки авторизации для Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: '/home/max/Documents/birthday_bot/for-birthday-bot-b347cad2a667.json', // Укажите путь к вашему JSON-файлу
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Настройки для Telegram Bot
const token = '7906410073:AAFNmNWAW4G4Uj1QWt_uKtAIKPlnrZEJUo0'; // Замените на ваш токен
const bot = new TelegramBot(token, { polling: true });

// Настройки для GigaChat API
const authKey = 'NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOmNjYTIxZWM4LThkMjUtNDc3Yy04OGJmLTU5ZmRhYjEzMzg0Ng=='; // Ваш Authorization key для Basic-аутентификации
const authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1/models';
const scope = 'GIGACHAT_API_PERS';

// Функция получения Access Token
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
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Ошибка при получении Access Token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Функция получения данных из Google Sheets
async function getDataFromSheet() {
  const client = await auth.getClient();
  const spreadsheetId = '1OZwZapUykBgTBt9sRgMfodzl9F1aBar-ILIwvv7GKlI'; // Замените на ID вашей таблицы
  const range = 'page1!A2:D'; // Укажите диапазон, который хотите получить

  const response = await sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range,
  });

  return response.data.values;
}

// Функция генерации поздравления через GigaChat API
async function generateGreeting(name, position, accessToken) {
  try {
    const prompt = `Сгенерируй поздравление с днем рождения для ${name}, работающего на позиции ${position}.`;

    const response = await axios.post(
      `${apiUrl}/chat`,
      { prompt },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    return response.data.message;
  } catch (error) {
    console.error('Ошибка при генерации поздравления:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Основная функция
async function main() {
  try {
    const accessToken = await getAccessToken();
    console.log('Access token получен:', accessToken);

    const data = await getDataFromSheet();
    for (let row of data) {
      const name = row[0];
      const position = row[1];
      const greeting = await generateGreeting(name, position, accessToken);
      console.log(`Сгенерированное поздравление для ${name}:`, greeting);
      const chatId = '-4040312841'; // Замените на ID чата или группы
      bot.sendMessage(chatId, greeting);
    }
  } catch (error) {
    console.error('Ошибка в процессе выполнения:', error);
  }
}

main();

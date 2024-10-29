const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const TelegramBot = require('node-telegram-bot-api');

// Настройка сертификатов для GigaChat API
const rootCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_root_ca_pem.crt');
const subCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_sub_ca_pem.crt');

// Настройка GigaChat API
const authKey = 'NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOmNjYTIxZWM4LThkMjUtNDc3Yy04OGJmLTU5ZmRhYjEzMzg0Ng=='; // Ваш Authorization key для Basic-аутентификации
const authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1/models';

// Настройка Google Sheets API
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  keyFile: '/home/max/Documents/birthday_bot/for-birthday-bot-b347cad2a667.json', // Укажите путь к вашему JSON-файлу
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Настройка Telegram Bot
const token = '7906410073:AAFNmNWAW4G4Uj1QWt_uKtAIKPlnrZEJUo0'; // Замените на ваш токен
const bot = new TelegramBot(token, { polling: true });

// Функция для получения Access Token для GigaChat
async function getAccessToken() {
  try {
    const data = qs.stringify({ 'scope': 'GIGACHAT_API_PERS' });
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: authUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${authKey}`,
      },
      data: data,
      httpsAgent: new https.Agent({ ca: [rootCA, subCA] }),
    };
    const response = await axios(config);
    return response.data.access_token;
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

  return response.data.values;
}

// Функция для генерации поздравления через GigaChat API
async function generateGreeting(name, position, accessToken) {
  try {
    const prompt = `Сгенерируй поздравление с днем рождения для ${name}, работающего на позиции ${position}.`;
    const response = await axios.post(
      `${apiUrl}/chat`,
      { prompt },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
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

// Функция для отправки сообщения в Telegram
async function sendMessageToTelegram(chatId, message) {
  await bot.sendMessage(chatId, message);
}

// Основная функция для выполнения логики
async function main() {
  try {
    // Получение Access Token
    const accessToken = await getAccessToken();
    console.log('Access token получен:', accessToken);

    // Получение данных из Google Sheets
    const data = await getDataFromSheet();
    for (let row of data) {
      const [name, position, chatId] = row;

      // Генерация поздравления
      const greeting = await generateGreeting(name, position, accessToken);
      console.log(`Сгенерированное поздравление для ${name}:`, greeting);

      // Отправка поздравления в Telegram
      await sendMessageToTelegram(chatId, greeting);
    }
  } catch (error) {
    console.error('Ошибка в процессе выполнения:', error);
  }
}

main();

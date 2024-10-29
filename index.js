const { google } = require('googleapis');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');

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


// Загрузка обоих сертификатов
const rootCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_root_ca_pem.crt');
const subCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_sub_ca_pem.crt');

let data = qs.stringify({
  'scope': 'GIGACHAT_API_PERS' 
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded', 
    'Accept': 'application/json', 
    'RqUID': '1b2f1958-174f-4907-a367-10e9aebcd557', 
    'Authorization': 'Basic NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOjQ4MGM0NmViLTIyN2MtNDA5NC1iYTA4LTMwYzRlZjc2MTY2Yg=='
  },
  data: data,
  httpsAgent: new https.Agent({ 
    ca: [rootCA, subCA] // Добавляем оба сертификата
  })
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

// Функция получения Access Token
async function getAccessToken() {
  try {
    const data = qs.stringify({
      'scope': 'GIGACHAT_API_PERS'
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: authUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${authKey}`, // Используем ваш ключ авторизации
      },
      data: data,
      httpsAgent: new https.Agent({
        ca: [rootCA, subCA],
      }),
    };

    const response = await axios(config);
    return response.data.access_token; // Вернем Access Token
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
     console.log(`Текущий access token: ${accessToken}`); // проверка токена перед отправкой
    const prompt = `Сгенерируй поздравление с днем рождения для ${name}, работающего на позиции ${position}.`;

    const response = await axios.post(
      `${apiUrl}/chat`,
      { prompt },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          //'Content-Type': 'application/json',
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

const { google } = require('googleapis');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const qs = require('qs');
const https = require('https');
const fs = require('fs');
const config = require('./GPTconfig'); // Подключаем конфигурацию

// Настройка Google Sheets API
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  keyFile: config.googleAuth.keyFile,
  scopes: config.googleAuth.scopes,
});

// Настройка Telegram Bot
const bot = new TelegramBot(config.telegram.token, { polling: true });

// Функция для получения данных из Google Sheets
async function getDataFromSheet() {
  console.log("Запуск функции getDataFromSheet...");
  const client = await auth.getClient();
  const response = await sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId: config.googleSheets.spreadsheetId,
    range: config.googleSheets.range,
  });

  console.log("Данные из Google Sheets получены:", response.data.values);
  return response.data.values;
}

// Загрузка сертификатов
const rootCA = fs.readFileSync(config.certificates.rootCA);
const subCA = fs.readFileSync(config.certificates.subCA);

// Создание HTTPS агента с сертификатами
const httpsAgent = new https.Agent({ 
  ca: [rootCA, subCA],
  rejectUnauthorized: false
});

// Функция для получения Access Token
function getAccessToken() {
  console.log("Получение Access Token...");
  const data = qs.stringify({ scope: 'GIGACHAT_API_PERS' });

  const configOAuth = {
    method: 'post',
    maxBodyLength: Infinity,
    url: config.gigachat.oauthUrl,
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Accept': 'application/json', 
      'Authorization': config.gigachat.authHeader
    },
    data: data,
    httpsAgent: httpsAgent
  };

  return axios(configOAuth)
    .then(response => {
      console.log("Access Token получен:", response.data);
      return response.data;
    })
    .catch(error => {
      console.log("Ошибка при получении Access Token:", error);
    });
}

// Функция для получения ответа от модели
function getAnswerFromModel(accessToken, message) {
  console.log("Запрос ответа от модели...");
  const data = JSON.stringify({
    "model": "GigaChat",
    "messages": [
      { "role": "system", "content": "Ты HR-специалист в компании Britanca project самой крупной компании Калининграда в сфере хорека. К сотруднику обращайся на вы. Не используй слова позвольте и уважаемый. К себе обращайся - мы." },
      { "role": "user", "content": message }
    ],
    "stream": false,
    "update_interval": 0
  });

  const configModel = {
    method: 'post',
    maxBodyLength: Infinity,
    url: config.gigachat.apiUrl,
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${accessToken}`
    },
    httpsAgent: httpsAgent,
    data: data
  };

  return axios(configModel)
    .then(response => {
      console.log("Ответ модели получен:", response.data);
      return response.data;
    })
    .catch(error => {
      console.log("Ошибка при получении ответа от модели:", error);
    });
}

// Функция для проверки, наступает ли день рождения через 3 дня
function isBirthdayInThreeDays(birthdayStr) {
  const today = new Date();
  const [day, month] = birthdayStr.split('.').map(Number);
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  return (
    birthdayThisYear.getDate() === threeDaysFromNow.getDate() &&
    birthdayThisYear.getMonth() === threeDaysFromNow.getMonth()
  );
}

// Функция для генерации поздравления через GigaChat
async function generateGreeting(name, position, project) {
  console.log(`Генерация поздравления для ${name} на должности ${position} в проекте ${project}...`);
  try {
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    const message = `Поздравляем с днём рождения ${position} ${project} ${name}. К сотруднику обращайся на вы, а от моего лица - мы`;
    const response = await getAnswerFromModel(accessToken, message);

    const modelAnswer = response.choices[0].message.content;
    console.log("Сгенерированное поздравление:", modelAnswer);

    return modelAnswer;
  } catch (error) {
    console.error('Ошибка при генерации поздравления:', error);
    return `Не удалось сгенерировать поздравление для ${name}.`;
  }
}

// Функция для отправки сообщения в Telegram с задержкой
async function sendMessageToTelegramWithDelay(chatId, message, delay) {
  console.log(`Отправка сообщения в Telegram (chatId: ${chatId}) с задержкой ${delay} мс...`);
  return new Promise(resolve => setTimeout(resolve, delay)).then(() => bot.sendMessage(chatId, message));
}

// Основная функция для отправки поздравлений
async function sendBirthdayGreetings() {
  console.log("Запуск функции sendBirthdayGreetings...");
  try {
    const data = await getDataFromSheet();

    for (const row of data) {
      const [name, position, project, birthdayStr, chatId] = row;

      // Устанавливаем project как "Не указан", если его значение пустое
      const actualProject = project || "Не указан";

      if (name && position && birthdayStr && chatId) {
        if (isBirthdayInThreeDays(birthdayStr)) {
          const greeting = await generateGreeting(name, position, actualProject);
          await sendMessageToTelegramWithDelay(chatId, greeting, 1000);
        } else {
          console.log(`У ${name} день рождения не через 3 дня, поздравление не требуется.`);
        }
      } else {
        console.log("Некорректные данные в строке:", row);
      }
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
}

// Планируем задачу на каждый день
cron.schedule(config.cron.schedule, () => {
  console.log('Запуск задачи для отправки поздравлений с днем рождения...');
  sendBirthdayGreetings();
}, {
  scheduled: true,
  timezone: config.cron.timezone
});

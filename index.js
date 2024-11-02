const { google } = require('googleapis');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const qs = require('qs');
const https = require('https');
const fs = require('fs');

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

// Загрузка сертификатов
const rootCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_root_ca_pem.crt');
const subCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_sub_ca_pem.crt');

// Создание HTTPS агента с сертификатами
const httpsAgent = new https.Agent({ 
  ca: [rootCA, subCA],
  rejectUnauthorized: false // Игнорировать самоподписанные сертификаты
});

// Функция для получения Access Token
function getAccessToken() {
  const data = qs.stringify({
    'scope': 'GIGACHAT_API_PERS'
  });

  const config = {
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
    httpsAgent: httpsAgent
  };

  return axios(config)
    .then((response) => {
      console.log("Access Token:", JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      console.log("Error getting Access Token:", error);
    });
}

// Функция для получения списка моделей
function getListOfModels(accessToken) {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://gigachat-preview.devices.sberbank.ru/api/v1/models',
    headers: { 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${accessToken}`
    },
    httpsAgent: httpsAgent
  };

  return axios(config)
    .then((response) => {
      console.log("List of Models:", JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      console.log("Error getting list of models:", error);
    });
}

// Функция для получения ответа от модели
function getAnswerFromModel(accessToken, message) {
  const data = JSON.stringify({
    "model": "GigaChat",
    "messages": [
      {
        "role": "system",
        "content": "Ты доброжелательный hr специалист в компании Britanca project самой крупной компании Калининграда в сфере хорека."
      },
      {
        "role": "user",
        "content": message
      }
    ],
    "stream": false,
    "update_interval": 0
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${accessToken}`
    },
    httpsAgent: httpsAgent,
    data: data
  };

  return axios(config)
    .then((response) => {
      console.log("Model Answer:", JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      console.log("Error getting answer from model:", error);
    });
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

// Функция для генерации поздравления через GigaChat
async function generateGreeting(name, position) {
  try {
    // Получаем Access Token
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    // Получаем список доступных моделей (опционально, если нужен выбор модели)
    await getListOfModels(accessToken);

    // Формируем сообщение для модели
    const message = `Поздравь с днём рождения нашего коллегу ${name}, занимающего должность ${position}. В поздравлении сначала указывай ${position} потом ${name}.  К сотруднику обращайся на вы`;

    // Получаем ответ от модели
    const response = await getAnswerFromModel(accessToken, message);

    // Извлекаем ответ модели из данных ответа
    const modelAnswer = response.choices[0].message.content;

    return modelAnswer;
  } catch (error) {
    console.error('Ошибка при генерации поздравления:', error);
    return `Не удалось сгенерировать поздравление для ${name}.`;
  }
}

// Функция для отправки сообщения в Telegram с задержкой
async function sendMessageToTelegramWithDelay(chatId, message, delay) {
  return new Promise(resolve => setTimeout(resolve, delay)).then(() => bot.sendMessage(chatId, message));
}

// Основная функция для отправки поздравлений
async function sendBirthdayGreetings() {
  try {
    const data = await getDataFromSheet();
    const today = new Date();

    for (const row of data) {
      const [name, position, , birthdayStr, chatId] = row;

      if (name && position && birthdayStr && chatId) {
        if (isBirthdayInThreeDays(birthdayStr)) {
          const greeting = await generateGreeting(name, position);
          await sendMessageToTelegramWithDelay(chatId, greeting, 1000); // Отправляем с задержкой 1 секунда
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
}

// Планируем задачу на каждый день в 16:30 по калининградскому времени
cron.schedule('50 18 * * *', () => {
  console.log('Запуск задачи для отправки поздравлений с днем рождения...');
  sendBirthdayGreetings();
}, {
  scheduled: true,
  timezone: "Europe/Kaliningrad" // Часовой пояс Калининграда
});


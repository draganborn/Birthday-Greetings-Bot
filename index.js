const { google } = require('googleapis');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
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
  const range = 'page1!A2:E21'; // Укажите диапазон, который хотите получить

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
        "content": "Ты доброжелательный hr специалист в сети ресторанов и кафе."
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
function isBirthdayInThreeDays(birthday) {
  const today = new Date();
  const birthdayDate = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  return birthdayDate.getDate() === threeDaysFromNow.getDate() && birthdayDate.getMonth() === threeDaysFromNow.getMonth();
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
    const message = `Поздравь с днём рождения нашего коллегу ${name}, занимающего должность ${position}.`;

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

// Функция для отправки сообщения в Telegram
async function sendMessageToTelegram(chatId, message) {
  await bot.sendMessage(chatId, message);
}

// Запуск скрипта
getDataFromSheet()
  .then(async (data) => {
    const today = new Date();
    
    data.forEach(async (row) => {
      const [name, position, , birthdayStr, chatId] = row;

      // Проверяем, заполнены ли необходимые ячейки
      if (name && position && birthdayStr && chatId) {
        const birthdayParts = birthdayStr.split('.');
        const birthday = new Date(today.getFullYear(), birthdayParts[1] - 1, birthdayParts[0]);

        if (isBirthdayInThreeDays(birthday)) {
          const greeting = await generateGreeting(name, position);
          sendMessageToTelegram(chatId, greeting);
        }
      }
    });
  })
  .catch(error => {
    console.error('Ошибка при получении данных:', error);
  });


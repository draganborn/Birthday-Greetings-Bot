const { google } = require("googleapis");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const qs = require("qs");
const https = require("https");
const fs = require("fs");
const privateConfig = require("./config.js");

// Настройка Google Sheets API
const sheets = google.sheets("v4");
const auth = new google.auth.GoogleAuth({
  keyFile:
    privateConfig.google.keyFile, // Укажите путь к вашему JSON-файлу
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Настройка Telegram Bot
const token = privateConfig.telegram.token; // Замените на ваш токен
const bot = new TelegramBot(token, { 
  polling: { 
    interval: 3000, // Интервал между запросами в миллисекундах
    params: { 
      timeout: 10 // Новый способ указания таймаута
    }
  }
});

// Функция для получения данных из Google Sheets
async function getDataFromSheet() {
  const client = await auth.getClient();
  const spreadsheetId = privateConfig.google.spreadsheetId; // Замените на ID вашей таблицы
  const range = "page1!A2:F2007"; // Получаем данные со 2 по 2007 строку, включая колонку F

  const response = await sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range,
  });

  return response.data.values;
}

// Функция для обновления статуса отправленного напоминания в таблице
async function updateReminderStatusInSheet(rowIndex, status) {
  const client = await auth.getClient();
  const spreadsheetId = privateConfig.google.spreadsheetId; // ID вашей таблицы
  const range = `page1!F${rowIndex + 2}`; // Предполагая, что колонка F - это "Напоминание отправлено"

  await sheets.spreadsheets.values.update({
    auth: client,
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    resource: {
      values: [[status]],
    },
  });
}

// Загрузка сертификатов
const rootCA = fs.readFileSync(
 privateConfig.certificates.rootCA,
);
const subCA = fs.readFileSync(
  privateConfig.certificates.subCA,
);

// Создание HTTPS агента с сертификатами
const httpsAgent = new https.Agent({
  ca: [rootCA, subCA],
  rejectUnauthorized: false, // Игнорировать самоподписанные сертификаты
});

// Функция для получения Access Token
function getAccessToken() {
  const data = qs.stringify({
    scope: "GIGACHAT_API_PERS", //замените на своё значение
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: privateConfig.sberbank.oauth.url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      RqUID: privateConfig.sberbank.oauth.headers.RqUID,
      Authorization: privateConfig.sberbank.oauth.headers.Authorization,
    },
    data: data,
    httpsAgent: httpsAgent,
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
    method: "get",
    maxBodyLength: Infinity,
    url: "https://gigachat-preview.devices.sberbank.ru/api/v1/models",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    httpsAgent: httpsAgent,
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
    model: "GigaChat",
    messages: [
      {
        role: "system",
        content:
          "Ты HR-специалист в  самой крупной компании Калининграда в сфере хорека. К сотруднику обращайся на вы. Избегай слов позвольте и уважаемый. К себе обращайся - мы.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    stream: false,
    update_interval: 0,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    httpsAgent: httpsAgent,
    data: data,
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
  const [day, month] = birthdayStr.split(".").map(Number); // Разбиваем дату на день и месяц
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day); // Создаем дату без учета года рождения

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  return (
    birthdayThisYear.getDate() === threeDaysFromNow.getDate() &&
    birthdayThisYear.getMonth() === threeDaysFromNow.getMonth()
  );
}

// Функция для генерации поздравления через GigaChat
async function generateGreeting(name, position, project, birthdayStr) {
  try {
    // Получаем Access Token
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    // Получаем список доступных моделей (опционально, если нужен выбор модели)
    await getListOfModels(accessToken);

    // Формируем сообщение для модели

    const message = `Поздравь с днём рождения нашего коллегу. Сообщение начинай так: ${birthdayStr} мы поздравляем с днем рождения нашего коллегу ${name}, занимающего должность ${position} в проекте ${project}. (А дальше можно продолжать от себя) `;

    // Получаем ответ от модели
    const response = await getAnswerFromModel(accessToken, message);

    // Извлекаем ответ модели из данных ответа
    const modelAnswer = response.choices[0].message.content;

    return modelAnswer;
  } catch (error) {
    console.error("Ошибка при генерации поздравления:", error);
    return `Не удалось сгенерировать поздравление для ${name}.`;
  }
}

// Функция для отправки сообщения в Telegram с задержкой
async function sendMessageToTelegramWithDelay(chatId, message, delay) {
  return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
    bot.sendMessage(chatId, message),
  );
}

// Основная функция для отправки поздравлений
async function sendBirthdayGreetings() {
  try {
    const data = await getDataFromSheet();
    const today = new Date();

    for (const [index, row] of data.entries()) { // Используем entries для получения индекса
      const [name, position, project, birthdayStr, chatId, reminderSent] = row; // Добавляем reminderSent

      if (name && position && project && birthdayStr && chatId) {
        // Проверяем, наступает ли день рождения завтра
        const isBirthdayTomorrow = isBirthdayInDays(birthdayStr, 1);
        // Проверяем, наступает ли день рождения через 2 дня
        const isBirthdayInTwoDays = isBirthdayInDays(birthdayStr, 2);
        // Проверяем, наступает ли день рождения через 3 дня
        const isBirthdayInThreeDays = isBirthdayInDays(birthdayStr, 3);

        // Если день рождения завтра и напоминание не было отправлено
        if (isBirthdayTomorrow && reminderSent !== 'yes') {
          const greeting = await generateGreeting(name, position, project, birthdayStr);
          await sendMessageToTelegramWithDelay(chatId, greeting, 1000); // Отправляем с задержкой 1 секунда
          await updateReminderStatusInSheet(index, 'yes'); // Обновляем статус на 'yes'
        }

        // Если день рождения через 2 дня и напоминание не было отправлено
        if (isBirthdayInTwoDays && reminderSent !== 'yes') {
          const greeting = await generateGreeting(name, position, project, birthdayStr);
          await sendMessageToTelegramWithDelay(chatId, greeting, 1000); // Отправляем с задержкой 1 секунда
          await updateReminderStatusInSheet(index, 'yes'); // Обновляем статус на 'yes'
        }

        // Если день рождения через 3 дня и напоминание не было отправлено
        if (isBirthdayInThreeDays && reminderSent !== 'yes') {
          const greeting = await generateGreeting(name, position, project, birthdayStr);
          await sendMessageToTelegramWithDelay(chatId, greeting, 1000); // Отправляем с задержкой 1 секунда
          await updateReminderStatusInSheet(index, 'yes'); // Обновляем статус на 'yes'
        }
      }
    }
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
}

// Функция для проверки, наступает ли день рождения через N дней
function isBirthdayInDays(birthdayStr, days) {
  const today = new Date();
  const [day, month] = birthdayStr.split(".").map(Number); // Разбиваем дату на день и месяц
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day); // Создаем дату без учета года рождения

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + days); // Устанавливаем целевую дату

  return (
    birthdayThisYear.getDate() === targetDate.getDate() &&
    birthdayThisYear.getMonth() === targetDate.getMonth()
  );
}

// Функция для очистки ячеек F2 по F2007
async function clearCells() {
  try {
    const client = await auth.getClient();
    const spreadsheetId = privateConfig.google.spreadsheetId; // ID вашей таблицы
    const range = "page1!F2:F2007"; // Диапазон ячеек для очистки

    await sheets.spreadsheets.values.update({
      auth: client,
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: {
        values: Array(2006).fill([""]), // Заполняем массив пустыми строками для очистки ячеек
      },
    });

    console.log("Ячейки F2:F2007 успешно очищены.");
  } catch (error) {
    console.error("Ошибка при очистке ячеек:", error);
  }
}

// Запланируйте задачу на 1 января в 00:10 по калининградскому времени 10 0 1 1 *
cron.schedule(
  "* * * * *", // Каждое 1 января в 00:10
  () => {
    console.log("Запуск задачи для очистки ячеек F2:F2007...");
    clearCells();
  },
  {
    scheduled: true,
    timezone: "Europe/Kaliningrad", // Часовой пояс Калининграда
  }
);

// 15 0 * * * каждую полночь запуск задачи для отправки поздравлений
cron.schedule(
  "* * * * *",
  () => {
    console.log("Запуск задачи для отправки поздравлений с днем рождения...");
    sendBirthdayGreetings();
  },
  {
    scheduled: true,
    timezone: "Europe/Kaliningrad", // Часовой пояс Калининграда
  },
);

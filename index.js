// Импорт необходимых модулей
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');

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

// Пример использования функций
getAccessToken().then((tokenData) => {
  const accessToken = tokenData.access_token;
  getListOfModels(accessToken).then((models) => {
    const message = "Поздравь с днём рождения нашего коллегу Валерий Мамкин, занимающего должность системный администратор.";
    getAnswerFromModel(accessToken, message);
  });
});

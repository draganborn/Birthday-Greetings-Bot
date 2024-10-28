const request = require('request');
const https = require('https');

const authKey = 'NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOmNjYTIxZWM4LThkMjUtNDc3Yy04OGJmLTU5ZmRhYjEzMzg0Ng=='; // Ваш Authorization key для Basic-аутентификации
const authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const scope = 'GIGACHAT_API_PERS';

async function getAccessToken() {
  try {
    const options = {
      url: authUrl,
      method: 'POST',
      form: { scope: encodeURIComponent(scope) },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(authKey).toString('base64')}`, // Кодируем authKey в Base64
      },
      agentOptions: {
        rejectUnauthorized: false, // Отключаем проверку SSL-сертификата
      }
    };

    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        } else {
            console.log("Ответ сервера:", body); // Добавит вывод в консоль
          resolve(JSON.parse(body).access_token);
        }
      });
    });
  } catch (error) {
    console.error('Ошибка при получении Access Token:', error);
    throw error;
  }
}

getAccessToken()
  .then((token) => {
    console.log('Полученный токен:', token);
  })
  .catch((error) => {
    console.error('Ошибка:', error);
  });

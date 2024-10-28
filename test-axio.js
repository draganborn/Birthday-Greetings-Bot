const axios = require('axios');
const https = require('https');

const authKey = 'NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOmNjYTIxZWM4LThkMjUtNDc3Yy04OGJmLTU5ZmRhYjEzMzg0Ng=='; // Ваш Authorization key для Basic-аутентификации
const authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const scope = 'GIGACHAT_API_PERS';

async function getAccessToken() {
  try {
    const response = await axios.post(
      authUrl,
      new URLSearchParams({ 'scope': encodeURIComponent(scope) }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(authKey).toString('base64')}`, // Кодируем authKey в Base64
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

getAccessToken()
  .then((token) => {
    console.log('Полученный токен:', token);
  })
  .catch((error) => {
    console.error('Ошибка:', error);
  });

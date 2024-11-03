// config.js
module.exports = {
  googleAuth: {
    keyFile: '/home/max/Documents/birthday_bot/for-birthday-bot-b347cad2a667.json', // Укажите путь к вашему JSON-файлу
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  },
  telegram: {
    token: '7906410073:AAFNmNWAW4G4Uj1QWt_uKtAIKPlnrZEJUo0', // Замените на ваш токен
  },
  googleSheets: {
    spreadsheetId: '1y05NcVavF_LjX8se8oO5ASnPrI9nmvebq8neMOMWzqg', // Замените на ID вашей таблицы
    range: 'page1!A2:E101', // Диапазон для получения данных
  },
  gigachat: {
    apiUrl: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    oauthUrl: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    authHeader: 'Basic NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOjQ4MGM0NmViLTIyN2MtNDA5NC1iYTA4LTMwYzRlZjc2MTY2Yg==', // Авторизация для OAuth
  },
  certificates: {
    rootCA: '/etc/ca-certificates/trust-source/anchors/russian_trusted_root_ca_pem.crt',
    subCA: '/etc/ca-certificates/trust-source/anchors/russian_trusted_sub_ca_pem.crt',
  },
  cron: {
    schedule: '* * * * *', // Настройка времени по расписанию
    timezone: 'Europe/Kaliningrad',
  }
};

const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');

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

const axios = require('axios');
const https = require('https');
const fs = require('fs');
const rootCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_root_ca_pem.crt');
const subCA = fs.readFileSync('/etc/ca-certificates/trust-source/anchors/russian_trusted_sub_ca_pem.crt');
const agent = new https.Agent({ ca: [rootCA, subCA] });

let config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://gigachat-preview.devices.sberbank.ru/api/v1/models',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Bearer eyJjdHkiOiJqd3QiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.cJ0XtnykRB3R11IzUTHhj4qhgvbXr52f-n-7JjXtrNchXd1ACgvlhCdOZ8ckp4EtG8mwUQvqmPAAWoLZ120ItC9YzaqWyZLglQZMfRlmJKo56Dpoz00GpNVqNKUiAqw5ZsCLseSzfGZIDG5UKg-ludXFvFVXL7zEmDDG-WC0twBWg5YzMn3Z_MkSOElIaKfG0x50k9qoiJyHmN4cM_wPx5mknZ_NMv59F0ZmVRZnNJUnmCNIiP1Jrg1mKDMhQ2Lt3gNF1eL5-ya3m51yaL1Tfl3ZQA9xP3SC8NFKdPBn4AgIoSpvRsKsNPTcff-sYhQI9hgfa8KhiQJZHial3U4rAQ.fTZdPcb83nnRGA0PCy7lIA.rKX-0fXQn4kXByMGjgCcD63tuG87XVws0hHYgWaORpd7DCtQK7OCBU9mPjHQdNm06T8z00H8j_n1h2B2cbIZUyu62HwGMJKo8grb4TNysvX5DXqiW2uOT306e7-bIIP7CHgtaN7oqp5tySQ35sDub5OSkDIwGxKZ7q0Wot3ouN_yZV-iKxvf_MMDnBJBskVc_WDCEqgOKaoadJPIZP7uxkZbdKMgVfblU53xEbo3jr9760OoCchOWUl8_aqSFITCfOmMdhN3RLgWRUlRPr7TnxAxhcu2x6QM1Uu01KWuuEanXsaGVfehLQjty1owow9dXRbCYkyScF5Asz6HvD20Mr_Ura37MRFiUzACkbKpEZ6zN9QtPJ5CC6KH1IWT3JpPla9iRgXSYj0Z7oFrVekSz5BoLrdlJb_ED9AXVC8-U_1V6fyF6QXxuH1YIourtw6XRvl80BHs2mw91KGGcFv2weD_NAxbCExc2F3BpRcE-Ud33_2fMYCRgyQHOs7r1qhY53uQU7AqPm0XkzCwhUvrlnu0nqRTBI9XOSmUl34usDDVn-JMrKnZgaiZBFiI30eXYJr2exZHXdo2Ag0XJ7f1r3aNn-GSRxRhjMLTgK2Z2imktZ6YHgWkErSEiZyPh9McY5YRh4OwuIYj2P_ipWEdRgg370dQUSHXljIt69FaQU6A2I3juStrlSPKGbOwLiVXLo6pkEo9xPGW455ckW_0BWp_tpUcp9PKJi9JIQqh__k.QzazI0NX9famFDwI-c-1Vv-kd4aCP0Mciuy_12DB0Xg'
  },
    httpsAgent: agent
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

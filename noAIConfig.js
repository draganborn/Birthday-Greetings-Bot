const config = {
  google: {
    keyFile: "/home/max/Documents/birthday_bot/for-birthday-bot-b347cad2a667.json",
    spreadsheetId: "1y05NcVavF_LjX8se8oO5ASnPrI9nmvebq8neMOMWzqg",
  },
  telegram: {
    token: "7906410073:AAFNmNWAW4G4Uj1QWt_uKtAIKPlnrZEJUo0",
  },
  sberbank: {
    oauth: {
      url: "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
      headers: {
        RqUID: "1b2f1958-174f-4907-a367-10e9aebcd557",
        Authorization:
          "Basic NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOjQ4MGM0NmViLTIyN2MtNDA5NC1iYTA4LTMwYzRlZjc2MTY2Yg==",
      },
    },
    gigachat: {
      url: "https://gigachat-preview.devices.sberbank.ru/api/v1/models",
      chatUrl: "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
    },
  },
  certificates: {
    rootCA: "/etc/ca-certificates/trust-source/anchors/russian_trusted_root_ca_pem.crt",
    subCA: "/etc/ca-certificates/trust-source/anchors/russian_trusted_sub_ca_pem.crt",
  },
};

module.exports = config;

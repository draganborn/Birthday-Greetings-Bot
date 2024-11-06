# Birthday Greetings Bot

This project is a Telegram bot that sends birthday greetings to colleagues based on data retrieved from a Google Sheets document. The bot checks for upcoming birthdays and generates personalized messages using the GigaChat API.

## Features

- Retrieves data from Google Sheets, including names, positions, projects, birthdays, and Telegram chat IDs.
- Sends birthday greetings via Telegram.
- Generates personalized messages using the GigaChat API.
- Scheduled task to check for upcoming birthdays every minute.

## Prerequisites

- Node.js installed on your machine.
- A Google Cloud project with the Google Sheets API enabled.
- A Telegram bot token from [BotFather](https://core.telegram.org/bots#botfather).
- Access to the GigaChat API.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/birthday-greetings-bot.git
   cd birthday-greetings-bot
   ```

2. Install the required dependencies:

   ```bash
   npm install googleapis axios node-telegram-bot-api node-cron qs
   ```

3. Create a `config.js` file in the root directory with the following structure:

   ```javascript
   module.exports = {
     google: {
       keyFile: 'path/to/your/google-credentials.json', // Path to your Google credentials JSON file
       spreadsheetId: 'your_spreadsheet_id', // Your Google Sheets ID
     },
     telegram: {
       token: 'your_telegram_bot_token', // Your Telegram bot token
     },
     sberbank: {
       oauth: {
         url: 'your_sberbank_oauth_url', // Your Sberbank OAuth URL
         headers: {
           RqUID: 'your_rquuid', // Your RqUID
           Authorization: 'your_authorization_header', // Your Authorization header
         },
       },
     },
     certificates: {
       rootCA: 'path/to/rootCA.pem', // Path to your root CA certificate
       subCA: 'path/to/subCA.pem', // Path to your sub CA certificate
     },
   };
   ```

4. Make sure to replace the placeholders with your actual values.

## Usage

1. Run the bot:

   ```bash
   node index.js
   ```

2. The bot will check for upcoming birthdays every minute and send greetings to the specified Telegram chat IDs.

## Customization

- You can modify the message template in the `generateGreeting` function to change how the birthday greetings are formatted.
- Adjust the cron schedule in the `cron.schedule` function to change how often the bot checks for upcoming birthdays.

## License

This project is licensed under the AGPL-3.0 License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Sheets API](https://developers.google.com/sheets/api)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [GigaChat API](https://gigachat-api.sberbank.ru)
- [Node.js](https://nodejs.org/)

---

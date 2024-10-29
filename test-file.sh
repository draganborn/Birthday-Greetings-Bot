curl -L -X POST 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer NmY4OGE4ZGMtN2FhYy00NTQzLWEyNjAtYjFmODY1NzM3NjhmOjQ4MGM0NmViLTIyN2MtNDA5NC1iYTA4LTMwYzRlZjc2MTY2Yg==' \
--data-raw '{
  "model": "GigaChat",
  "messages": [
    {
      "role": "system",
      "content": "Ты профессиональный переводчик на английский язык. Переведи точно сообщение пользователя."
    },
    {
      "role": "user",
      "content": "GigaChat — это сервис, который умеет взаимодействовать с пользователем в формате диалога, писать код, создавать тексты и картинки по запросу пользователя."
    }
  ],
  "stream": false,
  "update_interval": 0
}'

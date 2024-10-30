curl -L -X POST 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer eyJjdHkiOiJqd3QiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.I_6VRPeTgMuN2xRjYJSB_nrPt2nJG08yTM8IR-h4CDiS81T8HGz4BuPDbL1ffUYFrLmYhxU8rTPC-wQ2xwD_H75V1jB21M4NmtxoDTT6IakBOtz9JPUFQ_3rqU0jkqDnrBuV4Fie_cwKIIPrQPzGJL-AxD23msgUMo8-pQDZrjynW-cQcs1cARaHsS64xEmQFnAauCJsjAEL5vd76gnkoxgxmzfVZ3TPjlUWsLKPIPKuXsj8Ny_lOJgVR5tdyhWjNPIaZ34Bgu-qwvzJCDq03ixwFOHgO0Al3UZcNEvRpT5JseLhgH4kr5jcSmL4OSPcqd8KY6QiznGg1Yz6h3SBiw.d7sVfGDxo2-zSxP6jTXRdw.FVFEKTtszsM2Tk1CCdBP2ida-z7Z_dy9qrKXLvYXekdHzDuqZZv8Ir3I29ScVO9X85YERLyMI6dV5sLASYpMOoS-kh2chscz0cB84R0hoF7N3CcvzQ-NBR_qdClkwXipNHgsqgZQ03IR0hGPHqB7gbegTPVUqUYS4ZLEL62Y02MlO4gw1Rk14tK8_BOBvaUnOiJjuJWccXSCoqlATYIlRti1lvpKQi6nFIUXpbko0CwNrcW_X16bPO0I1TpkZ37gllmn-QY-wieTqd9xihkUATF5yQvQYYK0Af65co91EIx1Iz9cWsOL3Te8GnmjazsGzmkc_NqaGP5BHMcZc9F2gOYc4HDr-N_rPfYgnTeovaknfZ9uwcznxrvzFoPbl87va3r56Mu7OGrIUpil3SWrupH7hRYre-ToYMB1_4id7PxLHzjgvjY2K49mDmjLd4_j7Aqr-_KVEY43FYRgHyP8ZvoU_FZ3vlXR2KYnmR9fjzrYhF6KX0pLY2yqm-0ojbhMuhrv8LyYigjUjtfzDrIXXWCcwXdGLgdsXaG_E7293RIqiB-IF9-IoclLP0v3Ll_kEoR3KpT7PCGU7VpMVZUJA86_INvjpJbdAsJxsLDGso9QmHMmsAXDkjS93dGfOWGMNvenQNXuy2hwCsh981DrB0S-tAcxR9iUSTSTFRRW3Vy_zu8_xm0GzN6-d9-dCda4CsC8dYEtzcGvkygRx99vUq8nUOIhwmVEqRkSRVzLU9I.I5AaTgwcj-o8pP-MreuA22UY4fOhapx1qNR6r0787Y8' \
--data-raw '{
  "model": "GigaChat",
  "messages": [
    {
      "role": "system",
      "content": "Ты дружелюбный hr-специалист, который профессионально поздравляет коллегу с днём рождения"
    },
    {
      "role": "user",
      "content": "Сегодня день рождения у нашего коллеги Валерия Мамкина, занимающего должность системный администратор. Пожалуйста, придумай ему поздравление."
    }
  ],
  "stream": false,
  "update_interval": 0
}'

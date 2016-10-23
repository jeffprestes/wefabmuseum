
++ Adding a welcome message

curl -X POST -H "Content-Type: application/json" -d '{
  "setting_type":"greeting",
  "greeting":{
    "text":"Olá {{user_first_name}}, bem vindo ao Bot do Wefabmuseum."
  }
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=PAGE_ACCESS_TOKEN"

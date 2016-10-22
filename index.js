express = require('express');
bodyParser = require('body-parser');
request = require('request');

function sendMessage(recipientID, message)  {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientID},
      message: message,
    }
  }, function (erro, response, body) {
    if (erro)  {
      console.log("Erro enviando mensagem: ", erro);
    } else if (response.body.error) {
      console.log("erro: ", response.body.error);
    }
  })
}


app = express();

app.use (bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 8181));

console.log ("Inicializando App...");
app.get("/", function (req, res)  {
  res.send("Este eh um Bot");
});

app.get("/webhook", function(req, res)  {
  console.log("validate webtoken");
  if (req.query['hub.verify_token']==='webfab_museum_token')  {
    console.log("Validated webtoken");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Token de validacao invalido');
    res.sendStatus(403);
  }
});

app.post("/webhook", function(req, res) {
  console.log("Recieving Messages");
  var events = req.body.entry[0].messaging;
  for (i=0; i<events.length; i++) {
    var event = events[i];
    if (event.message && event.message.text)  {
      sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
    }
  }
  res.sendStatus(200);
});

console.log ("Carregado App...");
console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

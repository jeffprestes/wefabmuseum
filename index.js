express = require('express');
bodyParser = require('body-parser');
request = require('request');

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Funcoes de recebimento de mensagem
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function receivedAuthentication(event)  {
  console.log("receivedAuthentication: ", event);
}

function receivedMessage (event)  {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Mensagem recebida para o usuario %d e a pagina %d em %d com mensagem: ",
              senderID,
              recipientID,
              timeOfMessage,
              console.log(JSON.stringify(message))
              );

  var messageID = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText)  {
    switch (messageText) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Mensagem com anexo recebida");
  }
}

function receivedDeliveryConfirmation(event)  {
  console.log("Messagem entregue: ", event);
}

function receivedPostback(event)  {
  console.log("receivedPostback: ", event);
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Funcoes de envio de mensagem
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function sendImageMessage(recipientID)  {
  sendTextMessage(recipientID, "Respondendo uma imagem");
}

function sendButtonMessage(recipientID)  {
  sendTextMessage(recipientID, "Respondendo um botao");
}

function sendGenericMessage(recipientID)  {
  sendTextMessage(recipientID, "Respondendo um botao");
}

function sendReceiptMessage(recipientID)  {
  sendTextMessage(recipientID, "Respondendo um recibo");
}

function sendTextMessage(recipientID, messageText)  {
  var dado = {
    recipient: {
      id: recipientID
    },
    message:  {
      text: messageText
    }
  };
  envioGenerico(recipientID, dado);
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Funcao de envio de mensagem com conteudo generico
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function envioGenerico(recipientID, messageData)  {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData
  }, function (erro, response, body) {
    if (erro)  {
      console.log("Erro enviando mensagem: ", erro);
    } else if (response.body.error) {
      console.log("erro: ", response.body.error);
    }
  });

  console.log ("Enviado a mensagem: %d para %d", recipientID, JSON.stringify(messageData));
}

console.log ("Inicializando App...");

app = express();

app.use (bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Rotas
app.get("/", function (req, res)  {
  res.send("Este eh um Bot e agora eh:" + Date.now());
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
  var data = req.body;
  console.log("Objeto recebido: ", data);

  if (data.object == 'page')  {
    data.entry.forEach (function (pageEntry)  {
      var pageId = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      pageEntry.messaging.forEach (function (messagingEvent)  {

        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);

        } else if (messagingEvent.message)  {
          receivedMessage(messagingEvent);

        } else if (messagingEvent.delivery) {
          recievedDeliveryConfirmation(messagingEvent);

        } else if (messagingEvent.postback) {
          recievedPostback(messagingEvent);

        } else {
          console.log("Webhook recebeu um evento de mensagem desconhecido: ", messagingEvent);
        }

      });

    });

    res.sendStatus(200);
  }
});

app.listen((process.env.PORT || 8181));

console.log ("Carregado App...");
console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

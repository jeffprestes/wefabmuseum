express = require('express');
bodyParser = require('body-parser');
request = require('request');

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Funcoes de recebimento de mensagem
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function receivedAuthentication(event)  {
  console.log("[RECEIVED_Authentication] received");
}

function receivedMessage (event)  {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("[RECEIVED_MESSAGE] Mensagem recebida para o usuario %d e a pagina %d em %d com mensagem %s",
              senderID,
              recipientID,
              timeOfMessage,
              JSON.stringify(message));

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
  console.log("[RECEIVED_DELIVERY_CONFIRMATION] A Messagem " + JSON.stringify(event) + " foi entregue ");
}

function receivedPostback(event)  {
  console.log("[receivedPostback]: ");
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

  console.log ("[ENVIO_GENERICO]: Enviando a mensagem: %d para %s", recipientID, JSON.stringify(messageData));

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: messageData
  }, function (erro, response, body) {

    if (erro)  {
      console.log("[ENVIO_GENERICO]: Erro enviando mensagem: %s", erro);

    }  else if (!erro && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("[ENVIO_GENERICO]: Mensagem generica enviada com sucesso de ID %s para recebedor %s",
        messageId, recipientId);
    }

    if (response.body.error) {
      console.log("[ENVIO_GENERICO]: Erro no corpo: %s", JSON.stringify(response.body.error));

    }
  });


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
    console.log("[GET WEBHOOK]: Validated webtoken");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('[GET WEBHOOK]: Token de validacao invalido');
    res.sendStatus(403);
  }
});

app.post("/webhook", function(req, res) {

  var data = req.body;
  console.log("[POST WEBHOOK]: Objeto recebido: ", data);

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
          receivedDeliveryConfirmation(messagingEvent);

        } else if (messagingEvent.postback) {
          recievedPostback(messagingEvent);

        } else {
          console.log("[POST WEBHOOK]: Webhook recebeu um evento de mensagem desconhecido: ", messagingEvent);
        }

      });

    });

    res.sendStatus(200);
  }
});

app.listen((process.env.PORT || 8181));

console.log ("Carregado App...");
console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

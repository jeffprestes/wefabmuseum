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

//Verifica se a mensagem nao eh um echo para checagem
  if (message.is_echo)  {
    console.log("[RECEIVED_MESSAGE] Mensagem de echo recebida da pagina %d e para o usuario %d em %d com mensagem %s",
                senderID,
                recipientID,
                timeOfMessage,
                JSON.stringify(message));

  }           else        {

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
          var msg = "";
          messageText = messageText.trim().toLowerCase();
          var attachment = " ";

          //Obtendo o usuario
          request({
            url: 'https://graph.facebook.com/v2.6/'+senderID+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+process.env.PAGE_ACCESS_TOKEN,
            method: 'GET'
          }, function (erro, response, body) {

            if (erro)  {
              console.log("[RECEIVED_MESSAGE]: Erro ao obter usuario: %s", erro);
              msg = "Erro ao obter usuario";
              sendTextMessage(senderID, msg);
              return;

            } else if (!erro && response.statusCode == 200) {
              console.log("[RECEIVED_MESSAGE]: Usuario retornado %s", JSON.stringify(body));
              console.log("[RECEIVED_MESSAGE]: Nome=" + response.body);

              if (messageText == 'iniciar')  {

                if (body.gender ==='male')   {
                  var welcome = "bem vindo";
                  var nome = ", " + body.first_name + ", ";
                } else if (body.gender ==='female')   {
                  var welcome = "bem vinda";
                  var nome = ", " + body.first_name + ", ";
                } else {
                  var welcome = "bem vindo(a)";
                  var nome = "";
                }

                msg = "Olá " + nome + " seja " + welcome + ", vamos começar a nossa visita ao museu.\n";
                msg += "Quando quiser uma informação basta informar o nome da obra ou do autor que eu lhe dou detalhes.";

              } else if (messageText == 'marco castillo')  {
                msg = "Marco Antonio Castillo Valdes, nació el 18 de septiembre de 1971 en Camagüey, Cuba. \nGraduado en 1994 del Instituto Superior de Arte (ISA), La Habana, Cuba.";

              } else if (messageText == 'tocador de pifaro' || messageText == 'o tocador de pifaro')  {
                msg = "Esta tela foi recusada no Salão de Outono de Paris de 1867, que ainda vivia sob o domínio da estética acadêmica. ";
                msg += "Manet apresenta um menino humilde, que parece ser um pouco manco...";
                attachment = "https://deborando.files.wordpress.com/2012/10/o-tocador-de-pc3adfaro-edouard-manet-reproducao.jpg";

              } else if (messageText == 'manet' || messageText == 'edouard manet' || messageText == 'édouard manet')  {
                msg = body.first_name + ", Édouard Manet (Paris, 23 de janeiro de 1832 — Paris, 30 de abril de 1883) foi um pintor e artista gráfico francês e uma das figuras mais importantes da arte do século XIX. ";

              //Trick part - Só para ter algo secreto e divertido ;)
              } else if (messageText == 'erica lima' || messageText == 'jeff prestes' || messageText == 'jefferson prestes')  {
                if (senderID == 1490960767586723)   {
                  msg = "Ele te ama <3!!";
                } else if (senderID == 1142580935820395)  {
                  msg = "Ele te ama <3!!";
                }

              } else {
                msg = "Desculpe, não entendi a mensagem: " + message.text;
              }

              //Voce precisa fazer uma chamada para enviar uma imagem e outra mensagem para o texto
              console.log("[RECEIVED_MESSAGE] attachment = [" + attachment + "]");
              if (attachment != " ")   {
                sendImageMessage(senderID, attachment);
              }

              sendTextMessage(senderID, msg);
            }

            if (response.body.error) {
                console.log("[RECEIVED_MESSAGE]: Erro no corpo da requisicao do usuario: %s", JSON.stringify(response.body.error));
                msg = "Erro ao obter usuario";
                sendTextMessage(senderID, msg);
                return;
            }
          });



      }
    } else if (messageAttachments) {
      sendTextMessage(senderID, "Mensagem com anexo recebida");
    }
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
    message: {
      text: messageText
    }
  };

  envioGenerico(recipientID, dado);
}

function sendImageMessage(recipientID, attachmentUrl)  {
  var dado = {
    recipient: {
      id: recipientID
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url:attachmentUrl
        }
      }
    }
  };

  envioGenerico(recipientID, dado);
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Funcao de envio de mensagem com conteudo generico
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function envioGenerico(recipientID, messageData)  {

  console.log ("[ENVIO_GENERICO]: Enviando a mensagem %s", JSON.stringify(messageData));

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

function obtemDadoUsuario(userId)   {

  console.log ("[OBTEM_DADO_USUARIO]: Buscando dado do usuario %d", userId);

  return request({
    url: 'https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+process.env.PAGE_ACCESS_TOKEN,
    method: 'GET'
  }, function (erro, response, body) {

    if (erro)  {
      console.log("[OBTEM_DADO_USUARIO]: Erro enviando mensagem: %s", erro);
      return;

    } else if (!erro && response.statusCode == 200) {
        console.log("[OBTEM_DADO_USUARIO]: Usuario retornado %s", JSON.stringify(body));
        usuario = body;
    }

    if (response.body.error) {
        console.log("[OBTEM_DADO_USUARIO]: Erro no corpo: %s", JSON.stringify(response.body.error));
        return;
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
  console.log("-                                                           +");

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

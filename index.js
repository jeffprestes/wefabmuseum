express = require('express');
bodyParser = require('body-parser');
request = require('request');
app = express();

app.use (bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 8181));

app.get("/", function (req, res)  {
  res.send("Este eh um Bot");
});

app.get("/webhook", function(req, res)  {
  if (req.query['hub.verify_token']==='webfab_museum_token')  {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Token de validacao invalido');
  }
});

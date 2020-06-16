const express = require('express');
const bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');
var app = express();
var port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var routes = require('./routes');
routes(app);

var server = https.createServer({
    key: fs.readFileSync('Private Key wildcard_beonesolution_com_2019-2021.key'),
    cert: fs.readFileSync('Server Certificate.crt')
  }, app).listen(port);
console.log('API server started on: ' + port);
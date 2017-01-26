var config = {
};

var express = require('express');
var stylish = require('stylish');
var exphbs  = require('express-handlebars');
var request = require('request');


var app = express();

app.use(express.static('public'));
app.use(stylish('public'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get("/", function (request, response) {
  response.render('home');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

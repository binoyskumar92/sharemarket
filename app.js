var express = require('express');
var app = express();
https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=PQVMWRK4YYPUXSMD&outputsize=full

var request = require("request");
var parseString = require('xml2js').parseString;

 app.get('/timeseries', function (req, res) {
  var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+req.query.symbol+"&apikey=PQVMWRK4YYPUXSMD&outputsize=full";
  request(url, function(error, response, body) {
  	if (!error && response.statusCode == 200) {
	 res.setHeader('Content-Type', 'application/json');
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  	res.send(body);
  }
});
});
 app.get('/indicator', function (req, res) {
  var url =  "https://www.alphavantage.co/query?function="+req.query.indicator+"&symbol="+req.query.symbol+"&interval=daily&time_period=10&series_type=open&apikey=PQVMWRK4YYPUXSMD";
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
   res.setHeader('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(body);
  }
});
});


  app.get('/autocomplete', function (req, res) {
  var url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input="+req.query.input;
  request(url, function(error, response, body) {
  	if (!error && response.statusCode == 200) {
	 res.setHeader('Content-Type', 'application/json');
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  	res.send(body);
  }
});
});

    app.get('/news', function (req, res) {
  var url = "https://seekingalpha.com/api/sa/combined/"+req.query.symbol+".xml";
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
   res.setHeader('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  parseString(body, function (err, result) {
  console.dir(JSON.stringify(result));
    res.send(result);
});
  }
});
});


app.listen(8081, function () {
  console.log('app listening on port 8081!');
});
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var mysql      = require('mysql');
var request = require('request');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'mosque_finder'
});
var googleMapKey = 'AIzaSyAVDeI77bw_EErBIivLzOztZKMzKXjphdE';

connection.connect();

app.get('/nearestmosques', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var location = req.query.location;
  var count = req.query.count || 3;
  request.get(
    {
      url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=50000&type=mosque&key=' + googleMapKey + '&location=' + location
    }, 
    function (err, response, body) {
      var bodyjson = JSON.parse(body);
      var results= [];
      if (bodyjson) {
        results = bodyjson.results;
        results = results.splice(0,count);
        var googleIds = [];
        results.forEach(function (result) {
          googleIds.push('"' + result.id + '"');
        });
        googleIds = googleIds.join(',');
        googleIds = googleIds || '""';
        connection.query('select * from mosques where google_id in ('+ googleIds +')', function(err, rows, fields) {
            if (err) {
                throw err;
            }
            results.forEach(function (currentResult) {
              rows.some(function (currentRow) {
                if (currentResult.id === currentRow.google_id) {
                  currentResult.timings = currentRow.timings;
                  return true;
                }
              });
            });
            res.send(JSON.stringify(results));
        });
      }
    }
  );
});

var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('map app listening at http://%s:%s \n', host, port);
});

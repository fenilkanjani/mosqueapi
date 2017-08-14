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
var googleMapKey = 'AIzaSyBG0ylGK5baF3F5Slmnguk7mt3DiHg7hQM';

connection.connect();

app.use(express.static('settimings'));

app.use('/areas', function (req, res) {
  res.sendFile(__dirname + '/settimings/areas.html');
});

app.get('/nearestmosques', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var location = req.query.location;
  var count = req.query.count || 3;
  request.get(
    {
      url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?rankby=distance&type=mosque&key=' + googleMapKey + '&location=' + location
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
        connection.query('select * from mosques where google_id in ('+ googleIds +');', function(err, rows, fields) {
            if (err) {
                throw err;
            }
            results.forEach(function (currentResult) {
              rows.some(function (currentRow) {
                if (currentResult.id === currentRow.google_id) {
                  currentResult.timings = JSON.parse(currentRow.timings);
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

app.post('/updatetimings', jsonParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var googleId = req.body.google_id;
  var timings = req.body.timings;
  if (googleId && timings && timings.length === 6) {
    timings = JSON.stringify(timings);
  } else {
    res.send(JSON.stringify({ 
        message: 'There seems to be an issue with the data that was posted'
    }));
    return;
  }
  connection.query('update mosques set timings=\'' + timings + '\' where google_id="' + googleId + '";', function(err, rows, fields) {
      if (err) {
          throw err;
      }
      if (!rows.affectedRows) {
        connection.query('insert into mosques values (null,"' + googleId + '",\'' + timings + '\');', function(err, rows, fields) {
            if (err) {
                throw err;
            }
            res.send(JSON.stringify({ 
                message: 'Timings saved!!'
            }));
        });
      } else {
        res.send(JSON.stringify({ 
            message: 'Timings updated!!'
        }));
      }
  });
});

app.get('/getareas', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  connection.query('select * from areas;', function(err, rows, fields) {
      if (err) {
          throw err;
      }
      res.send(JSON.stringify({ 
          areas: rows
      }));
  });
});

app.post('/setarea', jsonParser,function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var name = req.body.name || '';
  var pincode = req.body.pincode || '';
  var zone = req.body.zone || '';
  connection.query('insert into areas values (null ,"' + name + '","' + pincode + '","' + zone + '")', function(err, rows, fields) {
      if (err) {
          throw err;
      }
      res.send(JSON.stringify({
          message: 'successfully added',
          data: {
            id: rows.insertId,
            name: name,
            pincode: pincode,
            zone: zone
          }
      }));
  });
});

app.patch('/setarea/:areaId', jsonParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var areaId = req.params.areaId;
  var name = req.body.name || '';
  var pincode = req.body.pincode || '';
  var zone = req.body.zone || '';
  connection.query('update areas set name = "' + name + '",pincode = "' + pincode + '", zone = "' + zone + '" where id = ' + areaId, function(err, rows, fields) {
      if (err) {
          throw err;
      }
      res.send(JSON.stringify({ 
          message: 'successfully updated'
      }));
  });
});

app.delete('/deletearea/:areaId', jsonParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var areaId = req.params.areaId;
  connection.query('delete from areas where id = ' + areaId, function(err, rows, fields) {
      if (err) {
          throw err;
      }
      res.send(JSON.stringify({ 
          message: 'successfully deleted'
      }));
  });
});

app.get('/querysearch', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var location = req.query.query;
  request.get(
    {
      url: 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + location + '&key=' + googleMapKey
    }, 
    function (err, response, body) {
      var bodyjson = JSON.parse(body);
      var results= [];
      if (bodyjson) {
        results = bodyjson.results;
        var googleIds = [];
        results.forEach(function (result) {
          googleIds.push('"' + result.id + '"');
        });
        googleIds = googleIds.join(',');
        googleIds = googleIds || '""';
        connection.query('select * from mosques where google_id in ('+ googleIds +');', function(err, rows, fields) {
            if (err) {
                throw err;
            }
            results.forEach(function (currentResult) {
              rows.some(function (currentRow) {
                if (currentResult.id === currentRow.google_id) {
                  currentResult.timings = JSON.parse(currentRow.timings);
                  return true;
                }
              });
            });
            results = results.filter(function (result) {
              return result.types.indexOf('mosque') !== -1 || result.types.indexOf('place_of_worship') !== -1;
            });
            res.send(JSON.stringify(results));
        });
      }
    }
  );
});

app.get('/gettimings', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var googleId = req.query.google_id;
  connection.query('select * from mosques where google_id="'+ googleId +'";', function(err, rows, fields) {
      if (err) {
          throw err;
      }
      if (rows.length) {
        res.send(JSON.stringify({ 
            timings: JSON.parse(rows[0].timings)
        }));
      } else {
        res.send(JSON.stringify({ 
            message: 'no entry'
        }));
      }
  });
});

var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('map app listening at http://%s:%s \n', host, port);
});

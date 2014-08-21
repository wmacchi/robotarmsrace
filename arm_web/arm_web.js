var express = require('express');
var path = require('path');
var jayson = require('jayson');
var bodyParser = require('body-parser');
var debug = require('debug')('arm_web');
var util = require('util');

var webPort = 10000;

var jaysonClientPort = 3030;
var jaysonClientIP = '127.0.0.1';

var app = express();
var router = express.Router();

app.set('port', process.env.PORT || webPort);

app.use(function(req, res, next) {
    //util.log(util.inspect(req, { showHidden: false, depth: 1, colors: true }));
    console.log("request: " + req.originalUrl);
    next();
});
app.use(express.static(path.join(__dirname, 'www')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

function arm_page(req, res)
{
    res.sendfile('./www/arm.html');
}

function arm_data(req, res)
{
    // POST
    if (req.body.method) {
        var device = req.body.params.device;
        var action = req.body.params.action;
        console.log('doAction', [device,action]);
        res.send("{}");

        jsonClient.request('doAction', [device,action], function(err, error, response) 
        {
              if(err) throw err;
              console.log(response);
        });
    } else {
        console.log('Error - arm data post: ', req.body);
    }
    
    res.end();
}

//router.get('/arm:id', arm_request);
router.get('/arm1', arm_page);
router.get('/arm2', arm_page);
router.post('/arm1', arm_data);
router.post('/arm2', arm_data);

app.use(router);

var server = app.listen(app.get('port'), function() {
    console.log('Web server ready at: http://*:' + server.address().port);
});

var jsonClient = jayson.client.tcp({
    port: jaysonClientPort,
    host: jaysonClientIP
});

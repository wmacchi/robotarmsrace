/*
 * arm_web.js
 * Web interface for the RobotArm controller.
 *
 * Creates a json.rpc client and forwards web page action commands
 * to a json.rpc server.
 * A device is in the form 'arm1.m3', actions are integers.
 *
 * See LICENSE for license information.
 */

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var util = require('util');
var wsio = require("websocket.io");

var keypress = require('keypress');
var jayson = require('jayson');

var webPort = 10000;

var jaysonClientPort = 3030;
var jaysonClientIP = '127.0.0.1';

var arm = 'arm1.';

var app = express();
var router = express.Router();

var clients = {};
var clientId = 0;

app.set('port', process.env.PORT || webPort);

app.use(function(req, res, next) {
    // This is used for debugging purposes only.
    //util.log(util.inspect(req, { showHidden: false, depth: 1, colors: true }));
    //console.log("request: " + req.originalUrl);
    next();
});
app.use(express.static(path.join(__dirname, 'www')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function arm_page(req, res) {
    // page determines the arm id based on the URL, e.g. "/arm1" is arm 1.
    res.sendfile('./www/arm.html');
}

function arm_data(req, res) {
    // POST from clicking on the page controller hotspots
    if (req.body.method) {
        var device = req.body.params.device;
        var action = req.body.params.action;

        res.send("{}");

        if ((/^arm[12].m[1-5]$/).test(device) && action >= 0 && action <= 2) {
            motorAction(device, action)
        } else {
            console.log("  invalid action: " + device + " - " + action);
        }
    } else {
        console.log('Error - arm data post: ', req.body);
    }
    
    res.end();
}

function processKeys(ch, key) {
    console.log('keypress ch=' + (ch? ch : 'unkn'),
        "key=" + (key? key.name : 'unkn'));

    if (key) {
        // Doesn't use CTL-C because jayson seems to be interfering
        if (key.name == 'escape') {
            stopAllMotors();
            process.exit();
        }
    }

    if (!ch)
        return;

    switch (ch) {
        case '1': arm = 'arm1.'; break;
        case '2': arm = 'arm2.'; break;

        case 'q': motorAction(arm + 'm1', 1); break;
        case 'a': motorAction(arm + 'm1', 2); break;
        case 'w': motorAction(arm + 'm2', 1); break;
        case 's': motorAction(arm + 'm2', 2); break;
        case 'e': motorAction(arm + 'm3', 1); break;
        case 'd': motorAction(arm + 'm3', 2); break;
        case 'r': motorAction(arm + 'm4', 1); break;
        case 'f': motorAction(arm + 'm4', 2); break;
        case 'z': motorAction(arm + 'm5', 1); break;
        case 'x': motorAction(arm + 'm5', 2); break;

        case 'n':
            sendMessageToAll("The game has finished");
            break;

        case ' ':
            stopAllMotors();
            break;
    }
}

function setupKeys() {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', processKeys);
    process.stdin.resume();
}

function stopAllMotors() {
    motorAction('arm1.m1', 0);
    motorAction('arm1.m2', 0);
    motorAction('arm1.m3', 0);
    motorAction('arm1.m4', 0);
    motorAction('arm1.m5', 0);
    motorAction('arm2.m1', 0);
    motorAction('arm2.m2', 0);
    motorAction('arm2.m3', 0);
    motorAction('arm2.m4', 0);
    motorAction('arm2.m5', 0);
}

function motorAction(device, action) {
    var cmd = device + ".move(" + action + ")";
    util.log("  motorAction: " + cmd);
    jsonClient.request('doAction', [device, action], function(err, error, response) {
        if (err) {
            console.log("Error - json client");
        }
    });
}

function sendMessageToAll(msg) {
    util.log("Sending message to " + Object.keys(clients).length + " clients: " + msg);

    for (var key in clients) {
        if (!clients.hasOwnProperty(key)) continue;

        try {
            clients[key].send(msg);
        } catch (e) {
            util.log("Error - client " + key + " send error");
        }
    }
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

var ws = wsio.attach(server);

ws.on('connection', function(client) {
    client.clientId = clientId++;
    clients[client.clientId] = client;
    util.log('Web client connected: ' + client.clientId);

    client.on('message',  function(msg) {
        try {
            var req = JSON.parse(msg);

            if ((/^arm[12].m[1-5]$/).test(req.device) && req.action >= 0 && req.action <= 2) {
                motorAction(req.device, req.action)
            } else {
                console.log("  invalid action: " + req.device + " - " + req.action);
            }

        } catch (e) {
            util.log('Error - message error: ' + msg);
        }
    });

    client.on('close', function() {
        util.log('Web client closed: ' + client.clientId);
        delete clients[client.clientId];
    });
});

setupKeys();

util.log('Waiting for keypress and web page requests...');
util.log('Use 1 for Arm 1, 2 for Arm 2');


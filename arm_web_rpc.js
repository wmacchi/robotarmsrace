/*
 * arm_web_rpc.js
 * Web interface for the RobotArm controller.
 *
 * Creates a json.rpc client and forwards web page action commands
 * to a json.rpc server.
 * A device is in the form 'arm1.m3', actions are integers.
 *
 * See LICENSE for license information.
 */

var webPort = 10000;
var wwwPagesDir = './www';

var jaysonClientPort = 3030;
var jaysonClientIP = '127.0.0.1';

var express = require('express');
var app = express();
var path = require('path');
var util = require('util');
var socketio = require("socket.io");

var keypress = require('keypress');
var jayson = require('jayson');

var arm = 'arm1.';

var clients = {};
var clientId = 0;

app.set('port', process.env.PORT || webPort);

app.use(function(req, res, next) {
    // This is used for debugging purposes only.
    //util.log(util.inspect(req, { showHidden: false, depth: 1, colors: true }));
    //console.log("request: " + req.originalUrl);
    next();
});

app.use(express.static(path.join(__dirname, wwwPagesDir)));

function arm_page(req, res) {
    util.log(util.inspect(req.headers, { showHidden: false, depth: 1, colors: false }));
    // page determines the arm id based on the URL, e.g. "/arm1" is arm 1.
    res.sendFile('arm.html', { root: wwwPagesDir });
}

function processKeys(ch, key) {
    console.log('keypress ch=' + (ch? ch : 'unkn'),
        "key=" + (key? key.name : 'unkn'));

    if (key) {
        if ((key.ctrl && key.name == 'c') || key.name == 'escape' ) {
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
        case 't': armAction(arm + 'led1', 1); break;
        case 'g': armAction(arm + 'led1', 0); break;

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

function armAction(device, action) {
    var cmd = device + ".set(" + action + ")";
    //util.log("  armAction: " + cmd);
    jsonClient.request('doAction', [device, action], function(err, error, response) {
        if (err) {
            console.log("Error - json client");
        }
    });
}

function motorAction(device, action) {
    var cmd = device + ".move(" + action + ")";
    //util.log("  motorAction: " + cmd);
    jsonClient.request('doAction', [device, action], function(err, error, response) {
        if (err) {
            console.log("Error - json client");
        }
    });
}

function sendMessageToAll(msg) {
    util.log("Sending message to " + Object.keys(clients).length + " clients: " + msg);
    wsio.emit('message', msg);
}

function printNetworkAddresses() {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var alias = 0;
        ifaces[dev].forEach(function(details) {
            if (details.family == 'IPv4') {
                console.log("  " + dev + (alias?':'+alias:''), details.address);
                ++alias;
            }
        });
    }
}

app.get('/arm1', arm_page);
app.get('/arm2', arm_page);

var server = app.listen(app.get('port'), function() {
    console.log('Web server ready at port ' + server.address().port);
    printNetworkAddresses();
});

var jsonClient = jayson.client.tcp({
    port: jaysonClientPort,
    host: jaysonClientIP
});

var wsio = socketio(server);

wsio.on('connection', function(client) {
    client.clientId = clientId++;
    clients[client.clientId] = client;
    util.log("Web client " + client.clientId + " connected from "
        + client.request.connection.remoteAddress);

    client.on('action',  function(msg) {
        try {
            var req = JSON.parse(msg);
            var device = req.device;
            var action = req.action;

            if ((/^arm[12].m[1-5]$/).test(device) && action >= 0 && action <= 2) {
                motorAction(device, action);
            } else if ((/^arm[12].led[1]$/).test(device) && action >= 0 && action <= 1) {
                armAction(device, action);
            } else {
                console.log("  invalid action: " + device + " - " + action);
            }

        } catch (e) {
            util.log('Error - message error: ' + msg);
        }
    });

    client.on('log', function(msg) {
        console.log(msg);
    });

    client.on('disconnect', function() {
        util.log("Web client " + client.clientId + " disconnected");
        delete clients[client.clientId];
    });
});

setupKeys();

util.log('Waiting for keypress and web page requests...');
util.log('Use 1 for Arm 1, 2 for Arm 2');


/*
 * arm_server_rpc.js
 * JSON.RPC and key interface for the RobotArm controller.
 *
 * Creates a json.rpc server and waits for device action commands.
 * A device is in the form 'arm1.m3', actions are integers.
 *
 * See LICENSE for license information.
 */

var jsonServerPort = 3030;

var util = require('util');
var jayson = require('jayson');

var keypress = require('keypress');
var robotarm = require('./robotarm/robotarm.js');

var arm1 = new robotarm.RobotArm(0x20);
var arm2 = new robotarm.RobotArm(0x21);
var arm = 'arm1.';

var server = jayson.server();

function processKeys(ch, key) {
    console.log('keypress ch=' + (ch? ch : 'unkn'),
        "key=" + (key? key.name : 'unkn'));

    if (key) {
        if (key.ctrl && key.name == 'c') {
            arm1.reset();
            arm2.reset();
            process.stdin.pause();
        } else if (key.name == 'escape') {
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
    arm1.reset();
    arm2.reset();
}

function armAction(device, action) {
    var cmd = device + ".set(" + action + ")";
    util.log("  armAction: " + cmd);
    eval(cmd);
}

function motorAction(device, action) {
    var cmd = device + ".move(" + action + ")";
    console.log("  motorAction: " + cmd);
    eval(cmd);
} 

server.tcp().listen(jsonServerPort, function () {
    util.log('Json server ready on port ' + jsonServerPort);
});

server.method('doAction', function (device, action, callback) {
    callback(null, '');

    if ((/^arm[12].m[1-5]$/).test(device) && action >= 0 && action <= 2) {
        motorAction(device, action)
    } else if ((/^arm[12].led[1]$/).test(device) && action >= 0 && action <= 1) {
        armAction(device, action);
    } else {
        console.log("  invalid action: " + device + " - " + action);
    }
});

setupKeys();

util.log('Waiting for keypress and json.rpc calls...');
util.log('Use 1 for Arm 1, 2 for Arm 2');

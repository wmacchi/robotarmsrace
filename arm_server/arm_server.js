/*
 * arm_server.js
 * JSON.RPC and key interface for the RobotArm controller.
 *
 * Creates a json.rpc server and waits for device action commands.
 * A device is in the form 'arm1.m3', actions are integers.
 *
 * See LICENSE for license information.
 */

var jsonServerPort = 3030;

var keypress = require('keypress');
var jayson = require('jayson');
var util = require('util');
var robotarm = require('./robotarm.js');

var arm1 = new robotarm.RobotArm(0x20);
var arm2 = new robotarm.RobotArm(0x21);
var arm = arm1;

var server = jayson.server();


function testKeypress() {
    /// Used for testing only
    console.log('Waiting for keypress...');

    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', function (ch, key) {
        console.log('got "keypress"', key);
        if (key && key.ctrl && key.name == 'c') {
            process.stdin.pause();
        }
    });
    process.stdin.resume();
}

function processKeys(ch, key) {
    console.log('keypress ch=' + (ch? ch : 'unkn'),
        "key=" + (key? key.name : 'unkn'));

    if (key) {
        if (key.ctrl && key.name == 'c') {
            arm1.reset();
            arm2.reset();
            process.stdin.pause();
        } else if (key.name == 'escape') {
            arm1.reset();
            arm2.reset();
            process.exit();
        }
    }
    
    if (!ch)
        return;

    switch (ch) {
        case '1': arm = arm1; break; // Arm 1
        case '2': arm = arm2; break; // Arm 2

        case 'q': arm.m1.up(); break; // m1 U
        case 'a': arm.m1.down(); break; // m1 D
        case 'w': arm.m2.up(); break; // m2 U
        case 's': arm.m2.down(); break; // m2 D
        case 'e': arm.m3.up(); break; // m3 U
        case 'd': arm.m3.down(); break; // m3 D
        case 'r': arm.m4.up(); break; // m4 U
        case 'f': arm.m4.down(); break; // m4 D
        case 'z': arm.m5.up(); break; // m5 U
        case 'x': arm.m5.down(); break; // m5 D
        
        case ' ': arm1.stopMotors(); arm2.stopMotors(); break;
    }
}

function setupKeys() {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', processKeys);
    process.stdin.resume();
}

function motorAction(device, action) {
    var cmd = device + ".move(" + action + ")";
    console.log("  motorAction: " + cmd);
    eval(cmd);
} 

function setup() {
    setupKeys();
}

setup();
//testKeypress();

server.tcp().listen(jsonServerPort, function () {
    util.log('JSon server is listening on *: ' + jsonServerPort);
});

server.method('doAction', function (device, action, callback) {
    callback(null, '');

    if ((/^arm[12].m[1-5]$/).test(device) && action >= 0 && action <= 2) {
        motorAction(device, action)
    } else {
        console.log("  invalid action: " + device + " - " + action);
    }
});

util.log('Waiting for keypress and json.rpc calls...');
util.log('Use ALT-1 for Arm 1, ALT-2 for Arm 2');

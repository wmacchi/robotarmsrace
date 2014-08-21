/*
 * manual_robotarm.js
 * Manual control of the OWI Robot Arm using the keyboard.
 */

var keypress = require('keypress');
var i2cio = require('./i2cio.js');
var robotarm = require('./robotarm.js');
var jayson = require('jayson');

var arm1 = new robotarm.RobotArm(0x20);
var arm2 = new robotarm.RobotArm(0x21);
var arm = arm1;

// create a server
var server = jayson.server();

var jsonPort = 3030;

// Bind a http interface to the server and let it listen to localhost:3000
server.tcp().listen(jsonPort, function () {

    console.log('JSon server is listening on *: ' + jsonPort);
});

function testKeypress() {
    console.log('Waiting for keypress...');

    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', function (ch, key) {
        console.log('got "keypress"', key.name);
        if (key && key.ctrl && key.name == 'c') {
            process.stdin.pause();
        }
    });
    process.stdin.resume();
}

function setupKeys() {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    
    process.stdin.on('keypress', function (ch, key) {
        console.log('got "keypress"', key.name);
        if (!key) return;
        
        if (key.ctrl && key.name == 'c') {
            arm1.reset();
            arm2.reset();

            process.stdin.pause();
        }

	if (key.name == 'escape') {
	    arm1.reset();
            arm2.reset();
	    process.exit();
	}
        
        switch (key.name) {
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

            case 'space': arm1.stopMotors(); arm2.stopMotors(); break;
            
        }
            
    });
    
    process.stdin.resume();
}

function setup() {
    setupKeys();
}

setup();
//testKeypress();

server.method('doAction', function (device, action, callback) {
    var deviceTargets = device.split('.');

    callback(null, '');
    console.log("deviceTargets =", deviceTargets);
    if (deviceTargets[0].indexOf('arm') > -1) {
        if (deviceTargets[0] == 'arm1' || deviceTargets[0] == 'arm2') {
            handleMotorMovement(deviceTargets[0], deviceTargets[1], action)
        }
    }

    console.log('action: ' + device + ": " + action);
});

var handleMotorMovement = function (arm, motor, action)
{
    var actionFunc;
    
    switch (action) {
        case '0': actionFunc = "stop()"; break;
        case '1': actionFunc = "up()"; break;
        case '2': actionFunc = "down()"; break;
        default: return;
    }
    
    var todo = arm + "." + motor + "." + actionFunc;
    console.log("eval = " + todo);
    eval(todo);
} 

console.log('Waiting for keypress...');
console.log('Use ALT-1 for Arm 1, ALT-2 for Arm 2');

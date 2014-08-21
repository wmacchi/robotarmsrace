/*
 * manual_robotarm.js
 * Manual control of the OWI Robot Arm using the keyboard.
 */

var keypress = require('keypress');
var i2cio = require('./i2cio.js');
var robotarm = require('./robotarm.js');

var arm = new robotarm.RobotArm(0x21);

function testKeypress() {
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

function setupKeys() {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    
    process.stdin.on('keypress', function (ch, key) {
        console.log('got "keypress"', key.name);
        if (!key) return;
        
        if (key.ctrl && key.name == 'c') {
            arm.reset();

            process.stdin.pause();
        }
        
        switch (key.name) {
            case '1': break; // Arm 1
            case '2': break; // Arm 2

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
            
            case 'space': arm.stopMotors(); break;
        }
    });
    
    process.stdin.resume();
}

function setup() {
    setupKeys();
}

setup();
//testKeypress();

console.log('Waiting for keypress...');
console.log('Use ALT-1 for Arm 1, ALT-2 for Arm 2');

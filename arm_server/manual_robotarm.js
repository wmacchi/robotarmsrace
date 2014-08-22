/*
 * manual_robotarm.js
 * Manual control of the Robot Arm using the keyboard.
 *
 * See LICENSE for license information.
 */

var keypress = require('keypress');
var robotarm = require('./robotarm.js');

var arm1 = new robotarm.RobotArm(0x20);
var arm2 = new robotarm.RobotArm(0x21);
var arm = arm1;

function processKeys(ch, key) {
    console.log('keypress ch=' + (ch? ch : ' '),
        " key=" + (key? key.name : ' '));

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
        
        case ' ': arm.stopMotors(); break;
        default: break;
    }
}

function setupKeys() {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', processKeys);
    process.stdin.resume();
}

setupKeys();

console.log('Waiting for keypress...');
console.log('Use 1 for Arm 1 (default), 2 for Arm 2');

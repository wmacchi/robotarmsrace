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

var danceMoves = [
    [ 'm5', 'up', 2000 ],
    [ 'm5', 'stop', 100 ],

    [ 'm4', 'up', 0 ],
    [ 'm3', 'down', 2000 ],
    [ 'm4', 'down', 0 ],
    [ 'm3', 'up', 2000 ],

    [ 'm5', 'down', 2000 ],
    [ 'm5', 'stop', 0 ],

    [ 'm4', 'up', 0 ],
    [ 'm3', 'down', 4000 ],

    [ 'm3', 'up', 0 ],
    [ 'm4', 'stop', 3000 ],
    [ 'm3', 'stop', 0 ],

    [ 'm2', 'down', 1000],
    [ 'm2', 'stop', 1500 ],

    [ 'm2', 'up', 500 ],
    [ 'm2', 'down', 500 ],
    [ 'm2', 'up', 500 ],
    [ 'm2', 'down', 500 ],
    [ 'm2', 'up', 500 ],
    [ 'm2', 'down', 500 ],
    [ 'm2', 'stop', 3000 ],

    // reset to starting position (more or less...manually estimated)
    [ 'm2', 'up', 0],
    [ 'm4', 'down', 1000 ],
    [ 'm2', 'stop', 1000],

    [ 'm5', 'stop', 0 ],
    [ 'm4', 'stop', 0 ],
    [ 'm3', 'stop', 0 ],
    [ 'm2', 'stop', 0 ],
    [ 'm1', 'stop', 0 ]
];

var danceId = 0;

function dancePlayNext() {
    if (danceId < 0 || danceId >= danceMoves.length)
        return;

    var move = danceMoves[danceId++];

    eval("arm1." + move[0] + "." + move[1] + "()");
    eval("arm2." + move[0] + "." + move[1] + "()");

    setTimeout(dancePlayNext, move[2]);
}

function danceBegin() {
    danceId = 0;
    dancePlayNext();
}

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
        case '1': arm = arm1; break;
        case '2': arm = arm2; break;

        case 'q': arm.m1.up(); break;
        case 'a': arm.m1.down(); break;
        case 'w': arm.m2.up(); break;
        case 's': arm.m2.down(); break;
        case 'e': arm.m3.up(); break;
        case 'd': arm.m3.down(); break;
        case 'r': arm.m4.up(); break;
        case 'f': arm.m4.down(); break;
        case 'z': arm.m5.up(); break;
        case 'x': arm.m5.down(); break;

        case 'p': danceBegin(); break;
        
        case ' ': arm.stopMotors(); danceId = -1; break;
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

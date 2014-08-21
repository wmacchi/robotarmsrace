var i2cio = require('./i2cio.js');
var robotarm = require('./robotarm.js');

var i2c_20_A = new i2cio(0x21, false);
var i2c_20_B = new i2cio(0x21, true);
i2c_20_A.reset();
i2c_20_B.reset();

var m = new robotarm.ArmMotor(i2c_20_A, robotarm.Motor.M4);

console.log('Moving ' + m.name + ' UP...');
m.up();
//m.down();
//m.up();

setTimeout(function() {
    console.log('Moving ' + m.name + ' DOWN...');
    m.down();
}, 1000);

setTimeout(function() {
    console.log('Stopping ' + m.name + '...');
    m.stop();
    console.log('Stopping all...');
    i2c_20_A.reset();
    i2c_20_B.reset();
}, 2000);

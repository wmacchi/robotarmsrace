/*
 * i2cio.js
 * Simple wrapper for the i2cset command line.
 *
 * See LICENSE for license information.
 */

var sys = require('sys')
//var exec = require('child_process').exec;
var exec = console.log // for debugging

var exports = module.exports = i2cio;

var GPIOPort = {
    'A': 0, // Port A
    'B': 1  // Port B
}

exports.GPIOPort = GPIOPort;

/// E.g.: i2cio(0x20, true)
function i2cio(address, gpioPort) {
    this.address = address;
    this.useGpioB = (gpioPort === GPIOPort.B);
    this._olat = 0;
}

i2cio.prototype.reset = function() {
    var port = (this.useGpioB? " 0x01 0x" : " 0x00 0x");
    this._olat = 0;
    exec("i2cset -y 1 0x" + this.address.toString(16) + port.toString(16) + "00");
    this.set(0, 0xFF);
}

i2cio.prototype.set = function(value, mask) {
    var port = (this.useGpioB? " 0x15 0x" : " 0x14 0x");
    this._olat = (this._olat & (~mask)) | (value & mask);
    exec("i2cset -y 1 0x" + this.address.toString(16) + port.toString(16) + this._olat.toString(16));
}

i2cio.prototype.get = function() {
    return this._olat;
}
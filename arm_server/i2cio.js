/*
 * i2cio.js
 * Simple wrapper for the i2cset command line.
 *
 * See LICENSE for license information.
 */

var sys = require("sys");
var i2c = require("i2c");

//var exec = require('child_process').exec;
//var exec = console.log // for debugging

var exports = module.exports = i2cio;

var GPIOPort = {
    'A': 0, // Port A
    'B': 1  // Port B
}

exports.GPIOPort = GPIOPort;

/// E.g.: i2cio(0x20, true)
function i2cio(address, gpioPort) {
    this.address = address;
    this.gpioPort = gpioPort;
    this._olat = 0;
    // NOTE: Use "/dev/i2c-0" for rev A RPis
    this._wire = new i2c(address, {device: "/dev/i2c-1", debug: false});
}

i2cio.prototype.reset = function() {
    var port = (this.gpioPort === GPIOPort.B? 0x01 : 0x00);
    this._olat = 0;
    this._wire.writeBytes(port, [0x00], function(err) { if (err) console.log(err); });
    //var port = (this.gpioPort === GPIOPort.B? " 0x01 0x" : " 0x00 0x");
    //exec("i2cset -y 1 0x" + this.address.toString(16) + port.toString(16) + "00");
    this.set(0, 0xFF);
}

i2cio.prototype.set = function(value, mask) {
    var port = (this.gpioPort === GPIOPort.B? 0x15 : 0x14);
    this._olat = (this._olat & (~mask)) | (value & mask);
    this._wire.writeBytes(port, [this._olat], function(err) { if (err) console.log(err); });
    //exec("i2cset -y 1 0x" + this.address.toString(16) + port.toString(16) + this._olat.toString(16));
}

i2cio.prototype.get = function() {
    return this._olat;
}

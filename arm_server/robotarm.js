/*
 * robotarm.js
 * RobotArm wrapper for motors and I2C commands.
 *
 * See LICENSE for license information.
 */

var MOTOR_REVERSE_TIMEOUT = 250;

var i2cio = require('./i2cio.js');

var exports = module.exports;

var ArmMotorSelect = {
    'M1': 0,  // Port A
    'M2': 1,  // Port A
    'M3': 2,  // Port A
    'M4': 3,  // Port A
    'M5': 0,  // Port B
};

exports.Motor = ArmMotorSelect;

var ArmMotorAction = {
    'STOP': 0x00,
    'UP': 0x01,
    'DOWN': 0x02,
};

exports.MotorAction = ArmMotorAction;

exports.ArmMotor = ArmMotor;

function ArmMotor(i2c, index) {
    this._i2c = i2c;
    this._index = index;
    this._currentAction = 0;
    this._timeout = null;
    this.name = "M" + (this._index + 1);
}

ArmMotor.prototype._clearTimeout = function() {
    if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
    }
}

ArmMotor.prototype._move = function(action) {
    this._currentAction = action;
    this._i2c.set(action << (this._index*2), 0x03 << (this._index*2));
}

ArmMotor.prototype.up = function() {
    this._clearTimeout();
    if (this._currentAction == ArmMotorAction.UP)
        return;

    if (this._currentAction > 0) {
        var me = this;
        this.stop();
        this._timeout = setTimeout(function() { me.up(); }, MOTOR_REVERSE_TIMEOUT);
    } else {
        this._move(ArmMotorAction.UP);
    }
}

ArmMotor.prototype.down = function() {
    this._clearTimeout();
    if (this._currentAction == ArmMotorAction.DOWN)
        return;

    if (this._currentAction > 0) {
        var me = this;
        this.stop();
        this._timeout = setTimeout(function() { me.down(); }, MOTOR_REVERSE_TIMEOUT);
    } else {
        this._move(ArmMotorAction.DOWN);
    }
}

ArmMotor.prototype.stop = function() {
    this._clearTimeout();

    this._move(ArmMotorAction.STOP);
}

ArmMotor.prototype.move = function(action) {
    switch (action) {
        case ArmMotorAction.STOP: this.stop(); break;
        case ArmMotorAction.UP: this.up(); break;
        case ArmMotorAction.DOWN: this.down(); break;
        default: break;
    }
}

exports.RobotArm = RobotArm;

function RobotArm(address) {
    var i2c_A = new i2cio(address, i2cio.GPIOPort.A);
    var i2c_B = new i2cio(address, i2cio.GPIOPort.B);
    this.setI2C(i2c_A, i2c_B);
}

RobotArm.prototype.setI2C = function(i2c_A, i2c_B) {
    this._i2c_A = i2c_A;
    this._i2c_B = i2c_B;

    this._i2c_A.reset();
    this._i2c_B.reset();

    this.m1 = new ArmMotor(this._i2c_A, ArmMotorSelect.M1);
    this.m2 = new ArmMotor(this._i2c_A, ArmMotorSelect.M2);
    this.m3 = new ArmMotor(this._i2c_A, ArmMotorSelect.M3);
    this.m4 = new ArmMotor(this._i2c_A, ArmMotorSelect.M4);
    this.m5 = new ArmMotor(this._i2c_B, ArmMotorSelect.M5);
}

RobotArm.prototype.stopMotors = function() {
    this.m1.stop();
    this.m2.stop();
    this.m3.stop();
    this.m4.stop();
    this.m5.stop();
}

RobotArm.prototype.reset = function() {
    this._i2c_A.reset();
    this._i2c_B.reset();
}

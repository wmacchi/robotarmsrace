robotarmsrace
=============

Robot Arms Race Project for the [Orlando Maker Faire](http://www.makerfaireorlando.com) on September 13-14, 2014.


Technology Components
---------------------

This project was built using the following technologies:

* [Raspberry Pi Model B](http://www.raspberrypi.org/)
* [OWI-535 Robotic Arm](http://www.owirobots.com/store/catalog/robotic-arm-and-accessories/owi-535-robotic-arm-edge-kit-110.html)
* [MCP23017 I2C 16-Bit IO Expander](http://www.microchip.com/wwwproducts/Devices.aspx?product=MCP23017)
* L9110S H-bridge DC Motor Driver Controllers
* DC adjustable voltage regulators (to adjust power to the H-bridge drivers)
* [Node.js](http://nodejs.org/)
  * [express](http://expressjs.com/)
  * [jayson](https://github.com/tedeh/jayson/)
  * [keypress](https://github.com/TooTallNate/keypress/)
  * [socket.io](http://socket.io/)
  * [i2c](https://github.com/kelly/node-i2c/)
* [jQuery](http://jquery.com/)
* [WebSockets, through socket.io](http://dev.w3.org/html5/websockets/)
* [I2C](http://en.wikipedia.org/wiki/I%C2%B2C)
* [JSON-RPC](http://www.jsonrpc.org/)


Installation, Setup, and Usage
------------------------------

* Build the circuit and connect it to the RPi (more details/instructions in progress).
* Connect the RPi to your network and login.
* Follow Node.js i2c module installation steps for editing the "/etc/modules" and modprobe blacklist file, reboot.
* Download this code and place it in a new directory (e.g. "robotarms").
* Then do:
```bash
cd robotarms
npm install
node arm_web_i2c.js
```

Once the code is running you can connect to the RPi with a web browser connected to your network. Use the RPi's IP address and port 10000, for example "http://192.168.1.100:10000/arm1". You should see a page that looks like the image in the "www" directory.

You can also control the robot arm from the shell by using Q/A for M1 (gripper), W/S for M2, E/D for M3, R/F for M4, Z/X for M5, and T/G for LED on/off.


Alternative JSON-RPC Version
----------------------------

There is another version of the code that separates the web server from the rest of the backend (I2C, motor drivers). The two components talk through sockets using JSON-RPC over TCP. We used this approach for driving a separate set of robot arms being simulated on a 3D display. The 3D version of the robot arms was created using [Unity 3D](http://unity3d.com/). To run the code using the JSON-RPC version you will need to start two node apps:
* Server (receives JSON-RPC calls, sends I2C commands to control the motor drivers):
```bash
node arm_server_rpc.js
```
* Web (receives browser requests, sends JSON-RPC calls to the Server):
```bash
node arm_web_rpc.js
```


Useful Links
------------

* Orlando Maker Faire - Robot Arms Race: http://www.makerfaireorlando.com/maker-detail/?maker-id=125)

* Orlando Maker Faire: http://www.makerfaireorlando.com

* YouTube video: http://youtu.be/57v3UDw2FTk


License
-------

Copyright (C) 2014 Kevin Ambruster, Anthony Barresi, Brendan Gaylord-Miles, Warren Macchi <wmacchi@abamis.com>

See [License file](LICENSE)

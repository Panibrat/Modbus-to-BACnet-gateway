const http = require('http');
const port = 80;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Energy Meter running...\n');
});

server.listen(port ,() => {
    console.log(`Server running at ${port}`);
});


const NAE_IP = '192.168.0.127';
const MODBUS_IP = '192.168.0.222';
const MODBUS_PORT = 502;

const bacnet = require('bacstack');
const bacnetClient = new bacnet();

var ModbusRTU = require("modbus-serial");
var modbusClient = new ModbusRTU();

var bufferMeter = {
    I1: 0, //I1: phase 1 current
    I2: 0, //I2: phase 2 current
    I3: 0, //I3: phase 3 current
    I_Avg: 0,

    L1N: 0, //Voltage L1–N
    L2N: 0,
    L3N: 0,
    LN_Avg: 0,

    Pwr1: 0,
    Pwr2: 0,
    Pwr3: 0,

    PwrActiveTotal: 0,
    PwrReactiveTotal: 0,

    Frq: 0,

    EnergyTotal: 0, //Total Active Energy Import
    EnergyDayTotal: 0, //Rate A Active Energy Import
    EnergyNightTotal: 0, //Rate B Active Energy Import
};



//MODBUS FUNCTIONS
function getReadModbusFunction(registerAddress, pointName) {
    return function() {
        return modbusClient.readHoldingRegisters(registerAddress, 2)
            .then(function (d) {
                console.log('data', d);
                return {
                    name:pointName,
                    value: d.data[0]/10 };
            })
    }
}

const readI1 = getReadModbusFunction(0, 'I1');
const readI2 = getReadModbusFunction(1, 'I2');



//END MODBUS FUNCTIONS

function isChangedByDecimal(value, pointName){
    //console.log('value', value);
    //console.log('pointName', pointName);
    //console.log('IS: ', (Math.abs(bufferMeter[pointName] - value)  > 0.1));
    return (Math.abs(bufferMeter[pointName] - value)  > 0.1);
}


//BACNET FUNCTION
const writeToNaeI1 = getWriteToNaeFunction(3000131);
const writeToNaeI2 = getWriteToNaeFunction(3000132);



function getWriteToNaeFunction(bacnetInstance) {


    return function (data) {
        //console.log(' bufferMeter',  bufferMeter);
        var av = data.value;
        var name = data.name;

        if(!isChangedByDecimal(av, name)) {
            return;
        }

        bufferMeter[name] = av;

        return new Promise((resolve, reject) => {

            //bufferMeter[name] = value;
            bacnetClient.writeProperty(NAE_IP, 2, bacnetInstance, 85, 16,
                [{
                    type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                    value: av
                }],
                function(err, value) {
                    if(err) {
                        console.log('writePropertyError: ', err);
                        reject({message: 'bacnet_error'});
                    } else {
                        console.log('writeProperty: ', av);
                        resolve(true);
                    }
                });
        });
    }
}
// END BACNET FUNCTION




function connect() {
    console.log("Connecting..............");
    if (modbusClient.isOpen) {
        run();
    }

    modbusClient.connectTCP(MODBUS_IP, { port: MODBUS_PORT })
        .then(setClient)
        .then(function() {
            console.log("Connected"); })
        .catch(function(e) {
            console.log('Error Connect: ',e.message);
            checkError(e);
        });
}


function setClient() {
    modbusClient.setID(51);
    //client.setTimeout(1000);

    run();
}

function run() {
    var stop = setInterval(() => {

        Promise.resolve()
            .then(readI1)
            .then(writeToNaeI1)
            .then(readI2)
            .then(writeToNaeI2)

            .catch((e) => {
                console.log('Error read Holding Registers: ', e.message);
                if(e.message !== 'bacnet_error') {
                    clearInterval(stop);
                    close();
                    var time = setTimeout(() => {
                        console.log('Reconnect...');
                        clearTimeout(time);
                        connect();
                    }, 5000);
                }


            })
    }, 500);
}


function close() {
    modbusClient.close();
}

function checkError(e) {
    console.log("we have to reconnect");
    close();

    modbusClient = new ModbusRTU();
    timeoutConnectRef = setTimeout(connect, 1000);
}


////////
/*function readI1(){
    return modbusClient.readHoldingRegisters(0, 2)
        .then(function (d) {
            console.log('data', d);
            return d.data[0]/10;
        })
}*/

/*const writeToNaeI1 = (av) => {
    return new Promise((resolve, reject) => {
        bacnetClient.writeProperty(NAE_IP, 2, 3000131, 85, 16,
            [{
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av
            }],
            function(err, value) {
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject({message: 'bacnet_error'});
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);
                }
            });
    });
};*/


/*function readI2(){
    return modbusClient.readHoldingRegisters(1, 2)
        .then(function (d) {
            console.log('data', d);
            return d.data[0]/10;
        })
}*/

/*const writeToNaeI2 = (av) => {
    return new Promise((resolve, reject) => {
        bacnetClient.writeProperty(NAE_IP, 2, 3000132, 85, 16,
            [{
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av
            }],
            function(err, value) {
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject({message: 'bacnet_error'});
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);
                }
            });
    });
};*/



connect();
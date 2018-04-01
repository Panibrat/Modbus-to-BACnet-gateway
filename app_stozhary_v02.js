const NAE_IP = '192.168.1.207';
const MODBUS_IP = '192.168.1.155';
const MODBUS_ID = 2;
const MODBUS_PORT = 502;
const POLING_TIME = 1000;
const RECONNECT_TIME = 5000;

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
function getReadIntBEModbusFunction(registerAddress, pointName) {
    return function() {
        return modbusClient.readHoldingRegisters(registerAddress, 8)
            .then(function (d) {
                return {
                    name: pointName,
                    value: d.buffer.readIntBE(0, 8)
                };
            })
    }

}

function getReadFloatBEModbusFunction(registerAddress, pointName) {
    return function() {
        return modbusClient.readHoldingRegisters(registerAddress, 2)
            .then(function (d) {
                return {
                    name: pointName,
                    value: d.buffer.readFloatBE()
                };
            })
    }

}

const readEnergyTotal = getReadIntBEModbusFunction(3203, 'EnergyTotal');
const readEnergyDayTotal = getReadIntBEModbusFunction(4195, 'EnergyDayTotal');
const readEnergyNightTotal = getReadIntBEModbusFunction(4199, 'EnergyNightTotal');

const readI1 = getReadFloatBEModbusFunction(2999, 'I1');
const readI2 = getReadFloatBEModbusFunction(3001, 'I2');
const readI3 = getReadFloatBEModbusFunction(3003, 'I3');
const readI_Avg = getReadFloatBEModbusFunction(3009, 'I_Avg');

const readL1N = getReadFloatBEModbusFunction(3027, 'L1N');
const readL2N = getReadFloatBEModbusFunction(3029, 'L2N');
const readL3N = getReadFloatBEModbusFunction(3031, 'L3N');
const readLN_Avg = getReadFloatBEModbusFunction(3035, 'LN_Avg');

const readPwr1 = getReadFloatBEModbusFunction(3053, 'Pwr1');
const readPwr2 = getReadFloatBEModbusFunction(3055, 'Pwr2');
const readPwr3 = getReadFloatBEModbusFunction(3057, 'Pwr3');
const readPwrActiveTotal = getReadFloatBEModbusFunction(3059, 'PwrActiveTotal');

const readPwrReactiveTotal = getReadFloatBEModbusFunction(3067, 'PwrReactiveTotal');
const readFrq = getReadFloatBEModbusFunction(3109, 'Frq');

//END MODBUS FUNCTIONS

function isChangedByDecimal(value, pointName){
    return (Math.abs(bufferMeter[pointName] - value)  > 0.1);
}

//BACNET FUNCTION

function getWriteToNaeFunction(bacnetInstance) {
    return function (data) {
        var av = data.value;
        var name = data.name;

        if(!isChangedByDecimal(av, name)) {
            return;
        }
        bufferMeter[name] = av;

        return new Promise((resolve, reject) => {
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
                        //console.log('writeProperty: ', av);
                        resolve(true);
                    }
                });
        });
    }
}

const writeToNaeI1 = getWriteToNaeFunction(3000715);
const writeToNaeI2 = getWriteToNaeFunction(3000716);
const writeToNaeI3 = getWriteToNaeFunction(3000717);
const writeToNaeI_Avg = getWriteToNaeFunction(3000718);

const writeToNaeL1N = getWriteToNaeFunction(3000719);
const writeToNaeL2N = getWriteToNaeFunction(3000720);
const writeToNaeL3N = getWriteToNaeFunction(3000721);
const writeToNaeLN_Avg = getWriteToNaeFunction(3000722);

const writeToNaePwr1 = getWriteToNaeFunction(3000723);
const writeToNaePwr2 = getWriteToNaeFunction(3000724);
const writeToNaePwr3 = getWriteToNaeFunction(3000725);
const writeToNaePwrActiveTotal = getWriteToNaeFunction(3000726);
const writeToNaePwrReactiveTotal = getWriteToNaeFunction(3000727);

const writeToNaeFrq = getWriteToNaeFunction(3000728);

const writeToNaeEnergyTotal = getWriteToNaeFunction(3000729);
const writeToNaeEnergyDayTotal = getWriteToNaeFunction(3000730);
const writeToNaeEnergyNightTotal = getWriteToNaeFunction(3000731);

// END BACNET FUNCTION


function connect() {
    console.log("Connecting..............");
    if (modbusClient.isOpen) {
        run();
    }

    modbusClient.connectTelnet(MODBUS_IP, { port: MODBUS_PORT })
        .then(setClient)
        .then(function() {
            console.log("Connected"); })
        .catch(function(e) {
            console.log('Error Connect: ',e.message);
            checkError(e);
        });
}


function setClient() {
    modbusClient.setID(MODBUS_ID);
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
            .then(readI3)
            .then(writeToNaeI3)
            .then(readI_Avg)
            .then(writeToNaeI_Avg)

            .then(readL1N)
            .then(writeToNaeL1N)
            .then(readL2N)
            .then(writeToNaeL2N)
            .then(readL3N)
            .then(writeToNaeL3N)
            .then(readLN_Avg)
            .then(writeToNaeLN_Avg)

            .then(readPwr1)
            .then(writeToNaePwr1)
            .then(readPwr2)
            .then(writeToNaePwr2)
            .then(readPwr3)
            .then(writeToNaePwr3)
            .then(readPwrActiveTotal)
            .then(writeToNaePwrActiveTotal)
            .then(readPwrReactiveTotal)
            .then(writeToNaePwrReactiveTotal)

            .then(readFrq)
            .then(writeToNaeFrq)

            .then(readEnergyTotal)
            .then(writeToNaeEnergyTotal)
            .then(readEnergyDayTotal)
            .then(writeToNaeEnergyDayTotal)
            .then(readEnergyNightTotal)
            .then(writeToNaeEnergyNightTotal)

            .catch((e) => {
                console.log('Error read Holding Registers: ', e.message);
                if(e.message !== 'bacnet_error') {
                    clearInterval(stop);
                    close();
                    var time = setTimeout(() => {
                        console.log('Reconnect...');
                        clearTimeout(time);
                        connect();
                    }, RECONNECT_TIME);
                }


            })
    }, POLING_TIME);
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


connect();
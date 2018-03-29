const NAE_IP = '192.168.0.127';

const bacnet = require('bacstack');
const bacnetClient = new bacnet();

var ModbusRTU = require("modbus-serial");
var modbusClient = new ModbusRTU();

function connect() {
    console.log("Connecting.............."); 
    if (modbusClient.isOpen) {
        run();
    }

    modbusClient.connectTCP("192.168.0.222", { port: 502 })
        .then(setClient)
        .then(function() {
            console.log("Connected"); })
        .catch(function(e) {
            console.log('Error Connect: ',e.message);
            checkError(e);
            });
};


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
function readI1(){
    return modbusClient.readHoldingRegisters(0, 2)
        .then(function (d) {
            console.log('data', d);
            return d.data[0]/10;
        })
};

const writeToNaeI1 = (av) => {
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
};


function readI2(){
    return modbusClient.readHoldingRegisters(1, 2)
        .then(function (d) {
            console.log('data', d);
            return d.data[0]/10;
        })
};

const writeToNaeI2 = (av) => {
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
};



connect();
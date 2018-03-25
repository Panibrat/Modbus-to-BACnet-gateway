//Meter address minus 1

//CONST
const IP = "192.168.1.155";
const PORT = 502;
const ID = 2;
const POLING_TIME = 1000;
const NAE_IP = '192.168.1.207';

var reconnection = false;


// Initialize BACStack
//BACnet
const bacnet = require('bacstack');
const client = new bacnet();

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var modbusClient;

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



// open connection to a tcp line
function connect(ip, port, id) {
    modbusClient = new ModbusRTU();
    modbusClient.connectTelnet(ip, {port: port})
        .then(() => {
            modbusClient.setID(id);
            modbusClient.setTimeout(2000);
            setTimeout(() => {
                reconnection = false;
            }, 2000);
            return "Connected";
        })
        .then(console.log)
        .then(read)
        .catch(function (e) {
            console.log("Exception: CONNECT " + e.message);            
            //reConnect();
        });
}

function reConnect() {

    if(!reconnection){
        reconnection = true;
        close();
        console.log('reconnecting...');
        setTimeout(() => {
            connect(IP, PORT, ID);
        }, 5000)  
    };
};

function read() {
    setInterval(() => {
        if(!reconnection) {
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


            .then(() => {
                console.log('bufferMeter', bufferMeter)
            })


            .catch(function (e) {
                console.log("Exception READ " + e.message);
               //reConnect();
        });
        };
        
    }, POLING_TIME);
    
}



function readEnergyTotal(){
    return modbusClient.readHoldingRegisters(3203, 8)
        .then(function (d) {
            //console.log("Receive:", d.data);
            //console.log("Buffer:", d.buffer);
            const powerCount = d.buffer.readIntBE(0, 8);
            //console.log(powerCount);  
            return powerCount;
         })
};

function writeEnergyTotal(value){
    bufferMeter.EnergyTotal = value;
};

function readEnergyDayTotal(){
    return modbusClient.readHoldingRegisters(4195, 8)
        .then(function (d) {
            const powerCount = d.buffer.readIntBE(0, 8);
            //console.log(powerCount);  
            return powerCount;
         })
};

function writeEnergyDayTotal(value){
    bufferMeter.EnergyDayTotal = value;
};

function readEnergyNightTotal(){
    return modbusClient.readHoldingRegisters(4199, 8)
        .then(function (d) {
            const powerCount = d.buffer.readIntBE(0, 8);
            //console.log(powerCount);  
            return powerCount;
         })
};

function writeEnergyNightTotal(value){
    bufferMeter.EnergyNightTotal = value;
};


function readL1N(){
    return modbusClient.readHoldingRegisters(3027, 2)
        .then(function (d) {
            //console.log("Receive:", d.data);
            //console.log("Buffer:", d.buffer);
            const valueL1N = d.buffer.readFloatBE();
            //console.log(valueL1N);  
            return valueL1N;
         })
};

function writeL1N(value){
    bufferMeter.L1N = value;
};


function readL2N(){
    return modbusClient.readHoldingRegisters(3029, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeL2N(value){
    bufferMeter.L2N = value;
};



function readL3N(){
    return modbusClient.readHoldingRegisters(3031, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeL3N(value){
    bufferMeter.L3N = value;
};


function readLN_Avg(){
    return modbusClient.readHoldingRegisters(3035, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeLN_Avg(value){
    bufferMeter.LN_Avg = value;
};



function readI1(){
    return modbusClient.readHoldingRegisters(2999, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeI1(value){
    bufferMeter.I1 = value;
};

function readI2(){
    return modbusClient.readHoldingRegisters(3001, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeI2(value){
    bufferMeter.I2 = value;
};

function readI3(){
    return modbusClient.readHoldingRegisters(3003, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeI3(value){
    bufferMeter.I3 = value;
};

function readI_Avg(){
    return modbusClient.readHoldingRegisters(3009, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeI_Avg(value){
    bufferMeter.I_Avg = value;
};


function readPwr1(){
    return modbusClient.readHoldingRegisters(3053, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writePwr1(value){
    bufferMeter.Pwr1 = value;
};


function readPwr2(){
    return modbusClient.readHoldingRegisters(3055, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writePwr2(value){
    bufferMeter.Pwr2 = value;
};


function readPwr3(){
    return modbusClient.readHoldingRegisters(3057, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writePwr3(value){
    bufferMeter.Pwr3 = value;
};


function readPwrActiveTotal(){
    return modbusClient.readHoldingRegisters(3059, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writePwrActiveTotal(value){
    bufferMeter.PwrActiveTotal = value;
};

function readPwrReactiveTotal(){
    return modbusClient.readHoldingRegisters(3067, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writePwrReactiveTotal(value){
    bufferMeter.PwrReactiveTotal = value;
};


function readFrq(){
    return modbusClient.readHoldingRegisters(3109, 2)
        .then(function (d) {
            return d.buffer.readFloatBE();
        })
};

function writeFrq(value){
    bufferMeter.Frq = value;
};




//BACNET function



const writeToNaeI1 = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000715, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeI2 = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000716, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeI3 = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000717, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeI_Avg = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000718, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeL1N = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000719, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeL2N = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000720, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeL3N = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000721, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeLN_Avg = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000722, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};


const writeToNaePwr1 = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000723, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaePwr2 = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000724, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaePwr3 = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000725, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaePwrActiveTotal = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000726, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaePwrReactiveTotal = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000727, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeFrq = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000728, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeEnergyTotal = (av) => {
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000729, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};


const writeToNaeEnergyDayTotal = (av) => {
    bufferMeter.EnergyDayTotal = av;
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000730, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

const writeToNaeEnergyNightTotal = (av) => {
    bufferMeter.EnergyNightTotal = av;
    return new Promise((resolve, reject) => {    
        client.writeProperty(NAE_IP, 2, 3000731, 85, 16, 
            [{                  
                type: bacnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_REAL,
                value: av 
            }], 
            function(err, value) { 
                if(err) {
                    console.log('writePropertyError: ', err);
                    reject(true);                      
                } else {
                    console.log('writeProperty: ', av);
                    resolve(true);                                    
                }
            });
    });
};

//END BACnet function




function close() {
    client.close();
}



connect(IP, PORT, ID);
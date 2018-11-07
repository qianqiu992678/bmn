/**
 * Created by Administrator on 2018-7-31.
 */
let Modbus = require("./modbus");
let modbus = new Modbus();
//
exports.measureResStatus = async function(ip,strNo){
    return new Promise(async(resolve,reject)=>{
        for(let i = 0;i<valable.stationIPArr.length;i++){
            let item = valable.stationIPArr[i];
            if(ip == item.ip){
                connect = item.socket;
                connect.index();
                //00 00 00 00 00 09 01 10 00 06 00 01 02 00 00  电池串序号
                modbus.frameLen = 0x9;
                let strData = modbus.createWrite10Frame(0x6,1);
                strData = Buffer.concat([strData,Buffer.from([0x0,strNo-1])]);
                await connect.writeBack(strData);

                //00 00 00 00 00 06 01 03 02 FD 00 01   测内阻状态
                modbus.frameLen = 6;
                let measureData = modbus.createRequest03Frame(0x2FD,1);
                let backData = await connect.writeBack(measureData);

                let resData = backData.slice(9,11).readUInt16BE(0).toString(10);

                resolve(resData);
            }else{
                resolve('请检查该集中器状态');
            }
        }
    })


}

exports.measureRes = async function(ip,strNo){
    return new Promise(async(resolve,reject)=>{
        for(let i = 0;i<valable.stationIPArr.length;i++){
            let item = valable.stationIPArr[i];
            if(ip == item.ip){
                connect = item.socket;
                connect.index();
                //00 00 00 00 00 09 01 10 00 06 00 01 02 00 00  电池串序号
                modbus.frameLen = 0x9;
                let strData = modbus.createWrite10Frame(0x6,1);
                strData = Buffer.concat([strData,Buffer.from([0x0,strNo-1])]);
                await connect.writeBack(strData);

                //00 00 00 00 00 09 01 10 02 FC 00 01 02 55 AA   //手工启动内阻测量
                modbus.frameLen = 6;
                let measureData = modbus.createWrite10Frame(0x2FC,1);
                let backData = await connect.writeBack(measureData);
                resolve('手动测量内阻开始');
            }else{
                resolve('请检查该集中器状态');
            }
        }
    })


}
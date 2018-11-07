/**
 * Created by Administrator on 2018-7-31.
 */
let Modbus = require("./modbus");
let modbus = new Modbus();
exports.reStart = async function(ip){
    return new Promise(async(resolve,reject)=>{
        for(let i = 0;i<valable.stationIPArr.length;i++){
            let item = valable.stationIPArr[i];
            if(ip == item.ip){
                connect = item.socket;
                connect.index();
                //00 00 00 00 00 09 01 10 00 00 00 01 02 AA 55 打开写保护
                modbus.frameLen = 9;
                let startData = modbus.createWrite10Frame(0,1);
                startData = Buffer.concat([startData,Buffer.from([0xAA,0x55])]);
                await connect.writeBack(startData);
                let endData = modbus.createWrite10Frame(1,1);
                endData = Buffer.concat([endData,Buffer.from([0x55,0xAA])]);
                await connect.writeBack(endData);
                resolve('重启成功');
            }
        }
    })


}
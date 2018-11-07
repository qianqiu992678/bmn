/**
 * Created by Administrator on 2018-7-31.
 */
let Modbus = require("./modbus");
let modbus = new Modbus();
exports.removeReport = async function(ip){
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

                //00 00 00 00 00 09 01 10 02 FE 00 01 02 55 AA  擦除报告
                modbus.frameLen = 9;
                let removeData = modbus.createWrite10Frame(0x2FE,1);
                removeData = Buffer.concat([removeData,Buffer.from([0x55,0xAA])]);
                await connect.writeBack(removeData);

                //00 00 00 00 00 09 01 10 00 00 00 01 02 00 00  写保护  不允许修改定值
                modbus.frameLen = 9;
                let endData = modbus.createWrite10Frame(0,1);
                endData = Buffer.concat([endData,Buffer.from([0,0])]);
                await connect.writeBack(endData);
                resolve('擦除报告成功');
            }
        }
    })


}
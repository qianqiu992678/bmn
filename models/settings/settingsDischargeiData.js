/**
 * Created by Administrator on 2018-7-11.
 */
let logger = require("../log4")
let valable = require("../valable");
let Socket = require("../socketConn");
let config = require("../config");
let Modbus = require("../Modbus");
let iconv = require("iconv-lite");
let modbus = new Modbus();
//建立连接
let connect;
//连接成功之后的回调函数
exports.setDischargeData = function (ip,{DeviceName,SerialPort,Address,StopDischargeV,dischargeTime,dischargeI}) {
    var $this = this;
    return new Promise( async(resolve,reject)=>{

        for(let i = 0;i<valable.stationIPArr.length;i++){
            let item = valable.stationIPArr[i];
            if(ip == item.ip){
                connect = item.socket;
                //connect.index();
                let timerId = setTimeout(timeout, 6000 * 20 + 4);
                function timeout() {
                    //console.log('超时，尝试重连');
                    //connect.index()
                }
                //00 00 00 00 00 09 01 10 00 00 00 01 02 AA 55
                modbus.frameLen = 0x9;
                let data1 = modbus.createWrite10Frame(0x0,1);
                data1 = Buffer.concat([data1,Buffer.from([0xAA,0x55])]);


                //00 00 00 00 00 09 01 10 00 0B 00 01 02 00 00
                let data2 = modbus.createWrite10Frame(0xB00,1);
                data2 = Buffer.concat([data2,Buffer.from([0,0])]);
                let StationID = item.StationID;

                let data3 = setValue({DeviceName,SerialPort,Address,StopDischargeV,dischargeTime,dischargeI});

                //00 00 00 00 00 09 01 10 40 00 00 01 02 AA 55
                modbus.frameLen = 0x9;
                let data4 = modbus.createWrite10Frame(0x4000,1);
                data4 = Buffer.concat([data4,Buffer.from([0xAA,0x55])])

                //00 00 00 00 00 09 01 10 00 00 00 01 02 00 00
                modbus.frameLen = 0x9;
                let data5 = modbus.createWrite10Frame(0x0,1);
                data5 = Buffer.concat([data5,Buffer.from([0,0])])
                let modbusArr = [data1,data2,data3,data4,data5];
                for(let i= 0;i<modbusArr.length;i++){
                    await connect.writeBack(modbusArr[i]);
                }
                resolve({status:200,msg:'success',data:{StationID:StationID}});

            }

        }



    })

}

//设置modbus总定值
let setValue = function(
        {DeviceName,SerialPort,Address,StopDischargeV,dischargeTime,dischargeI}

) {
    let $this = this;
    DeviceName = iconvEncode(DeviceName);
    StopDischargeV = StopDischargeV*10;
    dischargeTime = dischargeTime;
    dischargeI = dischargeI*10;
    modbus.frameLen = 0x2F;

    let arrData = modbus.createWrite10Frame(0x4001,0x14);
    let data = Buffer.concat([arrData,DeviceName,SerialPort, Address,StopDischargeV,dischargeTime,dischargeI]);
    return data;

}

function  iconvEncode(DI1Name){
    if(!DI1Name){
        DI1Name = iconv.encode(DI1Name,"GBK");
        if(DI1Name.length<8){
            let len = 8-DI1Name.length;
            let arr0 = [];
            for (let i =0;i<len;i++){
                arr0.push(0);
            }
            DI1Name = Buffer.concat([DI1Name,Buffer.from(arr0)]);
        }
    }else{
        DI1Name = Buffer.from([0,0,0,0,0,0,0,0]);
    }

    return DI1Name;
}
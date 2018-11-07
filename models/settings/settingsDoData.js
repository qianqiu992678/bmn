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
exports.setDoData = function (ip,{DeviceName,SerialPort,Address,
    DO1Level,DO2Level,DO3Level,DO4Level,DO5Level,DO6Level,DO7Level,DO8Level,DO9Level,DO10Level,DO11Level,DO1Level,DO12Level,DO13Level,
    DO14Level,DO15Level,DO16Level, DO1Name,DO2Name,DO3Name,DO4Name,DO5Name,DO6Name,DO7Name,DO8Name,DO9Name,DO10Name,DO11Name,DO12Name,DO13Name,DO14Name,DO15Name,DO16Name}) {
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

                let data2 = modbus.createWrite10Frame(0x8,1);
                data2 = Buffer.concat([data2,Buffer.from([0,0])]);
                let StationID = item.StationID;

                let data3 = setValue({StationID,DeviceName,SerialPort,Address,
                    DO1Level,DO2Level,DO3Level,DO4Level,DO5Level,DO6Level,DO7Level,DO8Level,DO9Level,DO10Level,DO11Level,DO1Level,DO12Level,DO13Level,DO14Level,DO15Level,DO16Level, DO1Name,DO2Name,DO3Name,DO4Name,DO5Name,DO6Name,DO7Name,DO8Name,DO9Name,DO10Name,DO11Name,DO12Name,DO13Name,DO14Name,DO15Name,DO16Name});

                //00 00 00 00 00 09 01 10 30 00 00 01 02 AA 55
                modbus.frameLen = 0x9;
                let data4 = modbus.createWrite10Frame(0x3000,1);
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
    {StationID,DONo,DeviceName,SerialPort,Address,
        DO1Level,DO2Level,DO3Level,DO4Level,DO5Level,DO6Level,DO7Level,DO8Level,DO9Level,DO10Level,DO11Level,DO1Level,DO12Level,DO13Level,DO14Level,DO15Level,DO16Level,DO1Name,DO2Name,DO3Name,DO4Name,DO5Name,DO6Name,DO7Name,DO8Name,DO9Name,DO10Name,DO11Name,DO12Name,DO13Name,DO14Name,DO15Name,DO16Name}

) {
    DeviceName = iconvEncode(DeviceName);
    DO1Name = iconvEncode(DO1Name);
    DO2Name = iconvEncode(DO2Name);
    DO3Name = iconvEncode(DO3Name);
    DO4Name = iconvEncode(DO4Name);
    DO5Name = iconvEncode(DO5Name);
    DO6Name = iconvEncode(DO6Name);
    DO7Name = iconvEncode(DO7Name);
    DO8Name = iconvEncode(DO8Name);
    DO9Name = iconvEncode(DO9Name);
    DO10Name = iconvEncode(DO10Name);
    DO11Name = iconvEncode(DO11Name);
    DO12Name = iconvEncode(DO12Name);
    DO13Name = iconvEncode(DO13Name);
    DO14Name = iconvEncode(DO14Name);
    DO15Name = iconvEncode(DO15Name);
    DO16Name = iconvEncode(DO16Name);


    modbus.frameLen = 0xB1;
    //StationID,DONo,
    let arrData = modbus.createWrite10Frame(0x3001,0x55);
    let data = Buffer.concat([arrData,DeviceName,SerialPort, Address,DO1Level,DO2Level,DO3Level,DO4Level,DO5Level,DO6Level,DO7Level,DO8Level,DO9Level,DO10Level,DO11Level,DO1Level,DO12Level,DO13Level,DO14Level,DO15Level,DO16Level,DO1Name, DO2Name, DO3Name, DO4Name, DO5Name, DO6Name, DO7Name, DO8Name, DO9Name, DO10Name, DO11Name, DO12Name, DO13Name, DO14Name,DO15Name,DO16Name]);
    return data;

}

function  iconvEncode(DO1Name){
    if(!DO1Name){
        DO1Name = iconv.encode(DO1Name,"GBK");
        if(DO1Name.length<8){
            let len = 8-DO1Name.length;
            let arr0 = [];
            for (let i =0;i<len;i++){
                arr0.push(0);
            }
            DO1Name = Buffer.concat([DO1Name,Buffer.from(arr0)]);
        }
    }else{
        DO1Name = Buffer.from([0,0,0,0,0,0,0,0]);
    }

    return DO1Name;
}
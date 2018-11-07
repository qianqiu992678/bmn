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
exports.setDiData = function (ip,{DeviceName,SerialPort,Address,DI1Name,DI2Name,DI3Name,DI4Name,DI5Name,DI6Name,DI7Name,DI8Name,DI9Name,DI10Name,DI11Name,DI12Name,DI13Name,DI14Name,DI15Name,DI16Name}) {
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

                let data3 = setValue({DeviceName,SerialPort,Address,DI1Name,DI2Name,DI3Name,DI4Name,DI5Name,DI6Name,DI7Name,DI8Name,DI9Name,DI10Name,DI11Name,DI12Name,DI13Name,DI14Name,DI15Name,DI16Name});

                //00 00 00 00 00 09 01 10 28 00 00 01 02 AA 55
                modbus.frameLen = 0x9;
                let data4 = modbus.createWrite10Frame(0x2800,1);
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
        {DeviceName,SerialPort,Address,DI1Name,DI2Name,DI3Name,DI4Name,DI5Name,DI6Name,DI7Name,DI8Name,DI9Name,DI10Name,DI11Name,DI12Name,DI13Name,DI14Name,DI15Name,DI16Name}

) {
    let $this = this;
    DeviceName = iconvEncode(DeviceName);
    DI1Name = iconvEncode(DI1Name);
    DI2Name = iconvEncode(DI2Name);
    DI3Name = iconvEncode(DI3Name);
    DI4Name = iconvEncode(DI4Name);
    DI5Name = iconvEncode(DI5Name);
    DI6Name = iconvEncode(DI6Name);
    DI7Name = iconvEncode(DI7Name);
    DI8Name = iconvEncode(DI8Name);
    DI9Name = iconvEncode(DI9Name);
    DI10Name = iconvEncode(DI10Name);
    DI11Name = iconvEncode(DI11Name);
    DI12Name = iconvEncode(DI12Name);
    DI13Name = iconvEncode(DI13Name);
    DI14Name = iconvEncode(DI14Name);
    DI15Name = iconvEncode(DI15Name);
    DI16Name = iconvEncode(DI16Name);


    modbus.frameLen = 0xA9;

    let arrData = modbus.createWrite10Frame(0x2801,0x51);
    let data = Buffer.concat([arrData,DeviceName,SerialPort, Address, DI1Name, DI2Name, DI3Name, DI4Name, DI5Name, DI6Name, DI7Name, DI8Name, DI9Name, DI10Name, DI11Name, DI12Name, DI13Name, DI14Name,DI15Name,DI16Name]);
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
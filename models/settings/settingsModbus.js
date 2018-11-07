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
let SettingModbus = function() {
};
//连接成功之后的回调函数
SettingModbus.prototype.setModbus = function (ip,{StationName,IPAddress,IPMask,Gateway,MacAddress,Port,SmsFlag,Telenumber1,Telenumber2,Telenumber3,SmsCenterNumber,ModbusAddress,StringNum,UpsNum,DINum,DONum,DischargeNum,InsulationNum}) {
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


                let data2 = $this.setModbusValue({StationName,IPAddress,IPMask,Gateway,MacAddress,Port,SmsFlag,Telenumber1,Telenumber2,Telenumber3,SmsCenterNumber,ModbusAddress,StringNum,UpsNum,DINum,DONum,DischargeNum,InsulationNum});

                //00 00 00 00 00 09 01 10 00 02 00 01 02 AA 55
                modbus.frameLen = 0x9;
                let data3 = modbus.createWrite10Frame(0x2,1);
                data3 = Buffer.concat([data3,Buffer.from([0xAA,0x55])])

                //00 00 00 00 00 09 01 10 00 00 00 01 02 00 00
                modbus.frameLen = 0x9;
                let data4 = modbus.createWrite10Frame(0x0,1);
                data4 = Buffer.concat([data4,Buffer.from([0,0])])
                let modbusArr = [data1,data2,data3,data4];
                function iter(i){
                    return new Promise(async(resolve,reject)=>{
                        if(i== modbusArr.length){
                            return resolve({status:200,msg:'success'});
                        }

                        await connect.writeBack(modbusArr[i]);
                        if(timerId){
                            clearTimeout(timerId);
                            timerId = null;
                        }
                        i++;
                        return resolve(iter(i));

                    })
                }
                resolve(await iter(0));


            }

        }



    })

}

//设置modbus总定值
SettingModbus.prototype.setModbusValue = function(
    {StationName,IPAddress,IPMask,Gateway,MacAddress,Port,SmsFlag,Telenumber1,Telenumber2,Telenumber3,SmsCenterNumber,ModbusAddress,StringNum,UpsNum,DINum,DONum,DischargeNum,InsulationNum}

) {
    let $this = this;
    StationName = StationName?StationName:config.allValueData.jzqName; //集中器名称
    IPAddress = IPAddress ? IPAddress: config.allValueData.ip_address; //IP地址
    IPMask = IPMask ? IPMask: config.allValueData.zwym; //子网掩码
    Gateway= Gateway ? Gateway: config.allValueData.wg; //网关
    MacAddress = MacAddress ? MacAddress: config.allValueData.mac_address; //MAC地址
    Port = Port ? Port: config.allValueData.connect_port; //通讯端口
    SmsFlag = SmsFlag? SmsFlag: config.allValueData.isMessage; //是否发送短信
    Telenumber1 = Telenumber1 ? Telenumber1: config.allValueData.tel1; //手机号码1
    Telenumber2= Telenumber2 ?Telenumber2 : config.allValueData.tel2; //手机号码2
    Telenumber3 =Telenumber3 ? Telenumber3: config.allValueData.tel3; //手机号码3
    SmsCenterNumber= SmsCenterNumber ? SmsCenterNumber: config.allValueData.message_center; //短信中心号码
    ModbusAddress =ModbusAddress ?ModbusAddress : config.allValueData.mod_address; //Modbus地址


    let DestIP = config.allValueData.target_ip; //目标IP
    let DestPort = config.allValueData.target_port; //目标端口号
    let DestDomain = config.allValueData.target_name; //目标域名（后台）
    let StationType = config.allValueData.station_type; //站点类型：1：环网柜；2：柱上开关
    let connect_fs = config.allValueData.connect_fs; //连接方式：1：有线网络；2：无线GPRS网络

    StringNum = StringNum ? StringNum: config.allValueData.cellNum; //电池串数量
    UpsNum =UpsNum ? UpsNum: config.allValueData.cdjNum; //充电机数目
    DINum =DINum ? DINum: config.allValueData.kairu; //开入
    DONum =DONum ? DONum:config.allValueData.kaichu; //开出
    DischargeNum =DischargeNum ? DischargeNum: config.allValueData.jueyuan; //绝缘数量
    InsulationNum = InsulationNum ? InsulationNum: config.allValueData.fangdian; //放电数量





    StationName = iconv.encode(StationName,"GBK");
    if(StationName.length<32){
        let len = 32-StationName.length;
        let arr0 = [];
        for (let i =0;i<len;i++){
            arr0.push(0);
        }
        StationName = Buffer.concat([StationName,Buffer.from(arr0)]);
    }
    IPAddress = valable.splitIp(IPAddress);
    IPMask = valable.splitIp(IPMask);
    Gateway = valable.splitIp(Gateway);
    let macArr = MacAddress.split('-');
    for(let i = 0; i < macArr.length; i++) {
        macArr[i] = eval('0x' + macArr[i]);
    }
    let macBuf = Buffer.from(macArr);
    Port = (valable.createBuf(Port));
    SmsFlag = valable.createBuf(SmsFlag);
    Telenumber1 = valable.getTelBuf(Telenumber1);
    Telenumber2 = valable.getTelBuf(Telenumber2);
    Telenumber3 = valable.getTelBuf(Telenumber3);
    SmsCenterNumber = valable.getTelBuf(SmsCenterNumber);
    ModbusAddress = valable.createBuf(ModbusAddress);

    DestIP = valable.splitIp(DestIP);
    DestPort = (valable.createBuf(DestPort));
    DestDomain = valable.splitIp(DestDomain);
    StationType = valable.createBuf(StationType);
    connect_fs = valable.createBuf(connect_fs);


    StringNum = valable.createBuf(StringNum);
    UpsNum = valable.createBuf(UpsNum);
    DINum = valable.createBuf(DINum);
    DONum = valable.createBuf(DONum);
    DischargeNum = valable.createBuf(DischargeNum);
    InsulationNum = valable.createBuf(InsulationNum);

    modbus.frameLen = 0x8b;
    let arrData = modbus.createWrite10Frame(0x20,0x42);
    let data = Buffer.concat([arrData,StationName,IPAddress, IPMask, Gateway, macBuf, Port, SmsFlag, Telenumber1, Telenumber2, Telenumber3, SmsCenterNumber, ModbusAddress, StringNum, UpsNum, DINum, DONum, DischargeNum,InsulationNum]);
    return data;

}
var setModbus = new SettingModbus();
module.exports = setModbus;
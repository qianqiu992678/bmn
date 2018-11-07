/**
 * Created by Administrator on 2018-7-11.
 */
let logger = require("../log4")
let valable = require("../valable");
let config = require("../config");
let Socket = require("../socketConn");
let Modbus = require("../Modbus");
let iconv = require("iconv-lite");
let modbus = new Modbus();
//建立连接
var SettingsData = function() {
    this.canNext = false;
    this.stringNum = {};
    this.first = true;
    this.callbacks=[];
    this.then= function (fun) {
        this.callbacks.push(fun);
        return this;
    };
};

let connect;
//连接成功之后的回调函数
SettingsData.prototype.setCellData = function (ip,stringNum,{StringName,SerialPort,Address,CellNumber,CellType,ModuleType,CellCapacity,RatedImpedance,MaxCellVol1,MaxCellVol2,MinCellVol1,MinCellVol2,MaxCellTemp,MinCellTemp,MaxCellRes,MinCellCap,MaxDeltaVol,MaxResRate,MaxDischargeCur,MaxChargeCur,MinChargeCur,MaxFloatCur,MaxTotalVol,MinTotalVol,MaxRipple,ResSpan,NormalSpan,ChargeSpan,StopTotalVol,StopCellVol,StopTimeSpan,StopTemperature,JhCtrl}) {
    var $this = this;
    return new Promise( async(resolve,reject)=>{
        for(let i = 0;i<valable.stationIPArr.length;i++){
            let item = valable.stationIPArr[i];
            if(ip == item.ip){
                connect = item.socket;
                //connect.index();
                let timerId = setTimeout(timeout, 6000 * 20 + 4);
                $this.stringNum = stringNum;
                function timeout() {
                    //console.log('超时，尝试重连');
                    //connect.index()
                }
                //00 00 00 00 00 09 01 10 00 00 00 01 02 AA 55
                modbus.frameLen = 0x9;
                let data1 = modbus.createWrite10Frame(0x0,1);
                data1 = Buffer.concat([data1,Buffer.from([0xAA,0x55])]);

                //00 00 00 00 00 09 01 10 00 06 00 01 02 00 00
                modbus.frameLen = 0x9;
                let data2 = modbus.createWrite10Frame(0x6,1);
                data2 = Buffer.concat([data2,Buffer.from([0x0,$this.stringNum])]);

                let data3 = $this.setBatteryValue({StringName,SerialPort,Address,CellNumber,CellType,ModuleType,CellCapacity,RatedImpedance,MaxCellVol1,MaxCellVol2,MinCellVol1,MinCellVol2,MaxCellTemp,MinCellTemp,MaxCellRes,MinCellCap,MaxDeltaVol,MaxResRate,MaxDischargeCur,MaxChargeCur,MinChargeCur,MaxFloatCur,MaxTotalVol,MinTotalVol,MaxRipple,ResSpan,NormalSpan,ChargeSpan,StopTotalVol,StopCellVol,StopTimeSpan,StopTemperature,JhCtrl});
                //00 00 00 00 00 09 01 10 02 00 00 01 02 AA 55
                modbus.frameLen = 0x9;
                let data4 = modbus.createWrite10Frame(0x200,1);
                data4 = Buffer.concat([data4,Buffer.from([0xAA,0x55])])
                //00 00 00 00 00 09 01 10 00 00 00 01 02 00 00
                modbus.frameLen = 0x9;
                let data5 = modbus.createWrite10Frame(0x0,1);
                data5 = Buffer.concat([data5,Buffer.from([0,0])])
                let modbusArr = [data1,data2,data3,data4,data5];
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

//电池串定值
SettingsData.prototype.setBatteryValue = function(
    {StringName,SerialPort,Address,CellNumber,CellType,ModuleType,CellCapacity,RatedImpedance,MaxCellVol1,MaxCellVol2,MinCellVol1,MinCellVol2,MaxCellTemp,MinCellTemp,MaxCellRes,MinCellCap,MaxDeltaVol,MaxResRate,MaxDischargeCur,MaxChargeCur,MinChargeCur,MaxFloatCur,MaxTotalVol,MinTotalVol,MaxRipple,ResSpan,NormalSpan,ChargeSpan,StopTotalVol,StopCellVol,StopTimeSpan,StopTemperature,JhCtrl}
) {
    let $this = this;
    var StringName = StringName || config.batteryStringValue.strName; //电池串名称
    StringName = iconv.encode(StringName,"GBK");
    if(StringName.length<30){
        let len = 30-StringName.length;
        let arr0 = [];
        for (let i =0;i<len;i++){
            arr0.push(0);
        }
        StringName = Buffer.concat([StringName,Buffer.from(arr0)]);
    }
    var SerialPort = SerialPort||config.batteryStringValue.cport; //串口号
    var Address =Address ||config.batteryStringValue.txAddress; //通讯地址
    var CellNumber = CellNumber||config.batteryStringValue.dccount; //电池个数
    var CellType = CellType||config.batteryStringValue.dctype; //电池类型
    var ModuleType = ModuleType||config.batteryStringValue.mktype; //模块类型
    var CellCapacity = CellCapacity||config.batteryStringValue.edc ; //额定电容
    var RatedImpedance = RatedImpedance* 1000||config.batteryStringValue.bcdz * 1000; //标称内阻
    var MaxCellVol1 =MaxCellVol1 * 1000||config.batteryStringValue.vshang1 * 1000; //电压上限值1
    var MaxCellVol2 = MaxCellVol2* 1000||config.batteryStringValue.vshang2 * 1000; //电压上限值2


    var MinCellVol1 = MinCellVol1* 1000||config.batteryStringValue.vxia1 * 1000; //电压下限值1
    var MinCellVol2 =MinCellVol2 * 1000||config.batteryStringValue.vxia2 * 1000; //电压下限值2
    var MaxCellTemp = MaxCellTemp* 100||config.batteryStringValue.wendushang * 100; //温度上限值
    var MinCellTemp = MinCellTemp* 100||config.batteryStringValue.wenduxia * 100; //温度下限值
    var MaxCellRes = MaxCellRes||config.batteryStringValue.neizushang ; //内阻上限值
    var MinCellCap = MinCellCap* 10||config.batteryStringValue.cxia * 10; //容量下限值
    var MaxDeltaVol = MaxDeltaVol* 1000||config.batteryStringValue.vcshang * 1000; //电压差上限值
    var MaxResRate = MaxResRate||config.batteryStringValue.nzbhshang; //内阻变化率上限值
    var MaxDischargeCur = MaxDischargeCur* 100||config.batteryStringValue.fddlshang * 100; //放电电流上限值
    var MaxChargeCur =MaxChargeCur * 100||config.batteryStringValue.cddlshang * 100; //充电电流上限值
    var MinChargeCur = MinChargeCur* 100||config.batteryStringValue.cddlxia * 100; //充电电流下限值
    var MaxFloatCur = MaxFloatCur* 100||config.batteryStringValue.fcdls * 100; //浮充电流上限值

    var MaxTotalVol = MaxTotalVol* 10||config.batteryStringValue.zvshang * 10; //总电压上限值
    var MinTotalVol = MinTotalVol* 10||config.batteryStringValue.zvxia * 10; //总电压下限值
    var MaxRipple = MaxRipple* 100||config.batteryStringValue.wenboshang * 100; //纹波系数上限值
    var ResSpan =ResSpan ||config.batteryStringValue.nzcyjg; //内阻采样间隔
    var NormalSpan = NormalSpan||config.batteryStringValue.cyjg; //正常电压采样间隔
    var ChargeSpan = ChargeSpan||config.batteryStringValue.cdcyjg; //充放电电压采样间隔
    var StopTotalVol = StopTotalVol* 10||config.batteryStringValue.zzfdallV * 10; //终止放电总电压值
    var StopCellVol = StopCellVol* 1000||config.batteryStringValue.zzfdoneV * 1000; //终止放电单体电压值
    var StopTimeSpan = StopTimeSpan||config.batteryStringValue.zzfdsj; //终止放电时间
    var StopTemperature = StopTemperature* 100||config.batteryStringValue.zzfdwd * 100; //终止放电温度
    var JhCtrl = JhCtrl||config.batteryStringValue.jh; //均衡功能是否自动开启;

    modbus.frameLen = 101;
    var arrData = modbus.createWrite10Frame(0x0201,47);
    var data = Buffer.concat([arrData, StringName,valable.createBuf(SerialPort),valable.createBuf(Address),valable.createBuf(CellNumber),
        valable.createBuf(CellType), valable.createBuf(ModuleType), valable.createBuf(CellCapacity), valable.createBuf(RatedImpedance),
        valable.createBuf(MaxCellVol1), valable.createBuf(MaxCellVol2), valable.createBuf(MinCellVol1), valable.createBuf(MinCellVol2),
        valable.createBuf(MaxCellTemp), valable.createBuf(MinCellTemp), valable.createBuf(MaxCellRes), valable.createBuf(MinCellCap), valable.createBuf(MaxDeltaVol), valable.createBuf(MaxResRate), valable.createBuf(MaxDischargeCur), valable.createBuf(MaxChargeCur), valable.createBuf(MinChargeCur), valable.createBuf(MaxFloatCur), valable.createBuf(MaxTotalVol), valable.createBuf(MinTotalVol), valable.createBuf(MaxRipple),
        valable.createBuf(ResSpan),valable.createBuf(NormalSpan), valable.createBuf(ChargeSpan), valable.createBuf(StopTotalVol), valable.createBuf(StopCellVol), valable.createBuf(StopTimeSpan), valable.createBuf(StopTemperature), valable.createBuf(JhCtrl)]);
    //console.log(data);
    return data;
}


let settingData = new SettingsData();
module.exports = settingData;

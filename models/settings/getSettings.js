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

let modObj = {mbData:{},strData:[]};
let StringNum = 1;
let UpsNum =   0;  //充电机数目
let DINum =  0;  //开入
let DONum =   0;  //开出
let DischargeNum =   0;  //绝缘数量
let InsulationNum =   0;  //放电数量
var connect;
//获得modbus定值
function getModbusValue(){
    return new Promise(async(resolve,reject)=>{
        //询问modbus定值  00 00 00 00 00 06 01 03 00 20 00 42
        modbus.frameLen = 6;
        let modbusBuf = modbus.createRequest03Frame(0x20,0x42);

        let modbusBackData = await connect.writeBack(modbusBuf);
        console.log('getModbusValue')
        //let modbusBackData = await connect.onData();
        let length =   modbusBackData.toString("hex").length;
        let str = '';
        for(let i=0;i<length;i++){
            if(i%2==0){
                str+=' '+ modbusBackData.toString("hex")[i];
            }else{
                str+= modbusBackData.toString("hex")[i];
            }
        }
        //c0 a8 01 eb
        //logger.info(str)
        let StationName = iconv.decode(valable.dropBuf00( modbusBackData.slice(9,41)),"GBK"); //集中器名称
        let ip192 = Buffer.concat( [ modbusBackData.slice(41,42),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let ip168 = Buffer.concat( [ modbusBackData.slice(42,43),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let ip1 = Buffer.concat( [ modbusBackData.slice(43,44),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let ip2 = Buffer.concat( [ modbusBackData.slice(44,45),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let IPAddress =ip192+'.'+ip168+'.'+ip1+"."+ip2; //IP地址
        let zw1 = Buffer.concat( [ modbusBackData.slice(45,46),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let zw2 = Buffer.concat( [ modbusBackData.slice(46,47),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let zw3 = Buffer.concat( [ modbusBackData.slice(47,48),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let zw4 = Buffer.concat( [ modbusBackData.slice(48,49),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let IPMask = zw1+'.'+zw2+'.'+zw3+"."+zw4;  //子网掩码
        let wg1 = Buffer.concat( [ modbusBackData.slice(49,50),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let wg2 = Buffer.concat( [ modbusBackData.slice(50,51),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let wg3 = Buffer.concat( [ modbusBackData.slice(51,52),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let wg4 = Buffer.concat( [ modbusBackData.slice(52,53),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let Gateway = wg1+'.'+wg2+'.'+wg3+"."+wg4; //网关
        let macLen =   modbusBackData.slice(53,59).toString("hex").length;
        let MacAddress = ''; //MAC地址
        for(let i=0;i<macLen;i++){
            if(i%2==0&&i!=0){
                MacAddress+='-'+ modbusBackData.slice(53,59).toString("hex")[i];
            }else{
                MacAddress+= modbusBackData.slice(53,59).toString("hex")[i];
            }
        }
        let Port =  modbusBackData.slice(59,61).readUInt16BE(0).toString(10); //通讯端口
        let SmsFlag =  modbusBackData.slice(61,63).readUInt16BE(0).toString(10); //是否发送短信
        let Telenumber1 = iconv.decode(valable.dropBuf00( modbusBackData.slice(63,79)),"GBK"); //手机号码1
        let Telenumber2 = iconv.decode(valable.dropBuf00( modbusBackData.slice(79,95)),"GBK"); //手机号码2
        let Telenumber3 = iconv.decode(valable.dropBuf00( modbusBackData.slice(95,111)),"GBK"); //手机号码3
        let SmsCenterNumber = iconv.decode(valable.dropBuf00( modbusBackData.slice(111,127)),"GBK"); //短信中心号码
        let ModbusAddress =   modbusBackData.slice(127,129).readUInt16BE(0).toString(10);  //Modbus地址
        StringNum =   Number(modbusBackData.slice(129,131).readUInt16BE(0).toString(10));  //电池串数量
        UpsNum =   Number(modbusBackData.slice(131,133).readUInt16BE(0).toString(10));  //充电机数目
        DINum =   Number(modbusBackData.slice(133,135).readUInt16BE(0).toString(10));  //开入
        DONum =   Number(modbusBackData.slice(135,137).readUInt16BE(0).toString(10));  //开出
        DischargeNum =   Number(modbusBackData.slice(137,139).readUInt16BE(0).toString(10));  //绝缘数量
        InsulationNum =   Number(modbusBackData.slice(139,141).readUInt16BE(0).toString(10));  //放电数量
        modObj.mbData.StationName = StationName;
        modObj.mbData.IPAddress = IPAddress;
        modObj.mbData.IPMask = IPMask;
        modObj.mbData.Gateway = Gateway;
        modObj.mbData.MacAddress = MacAddress;
        modObj.mbData.Port = Port;
        modObj.mbData.SmsFlag = SmsFlag;
        modObj.mbData.Telenumber1 = Telenumber1;
        modObj.mbData.Telenumber2 = Telenumber2;
        modObj.mbData.Telenumber3 = Telenumber3;
        modObj.mbData.SmsCenterNumber = SmsCenterNumber;
        modObj.mbData.ModbusAddress = ModbusAddress;
        modObj.mbData.StringNum = StringNum;
        modObj.mbData.UpsNum = UpsNum;
        modObj.mbData.DINum = DINum;
        modObj.mbData.DONum = DONum;
        modObj.mbData.DischargeNum = DischargeNum;
        modObj.mbData.InsulationNum = InsulationNum;
        resolve();
    })


}
//获得电池串定值getStrSettings
async function getStrSettings(){
    return new Promise(async(resolve,reject)=>{
        for(var i=0;i<StringNum;i++){
            //00 00 00 00 00 09 01 10 00 06 00 01 02 00 00 写入第几串电池
            modbus.frameLen = 9;
            let cellNumHeadData = modbus.createWrite10Frame(6,1);
            cellNumData = Buffer.concat([cellNumHeadData,Buffer.from([0,i])]);
            await connect.writeBack(cellNumData);
            //await connect.onData()
            modbus.frameLen = 6;
            let cellBody = modbus.createRequest03Frame(0x201,0x2F);
            let reback = await connect.writeBack(cellBody);
            //let reback = await connect.onData();
            let length =  reback.toString("hex").length;
            let str = '';
            for(let i=0;i<length;i++){
                if(i%2==0){
                    str+=' '+reback.toString("hex")[i];
                }else{
                    str+=reback.toString("hex")[i];
                }
            }
            //logger.info(str)
            let StringName = iconv.decode(valable.dropBuf00(reback.slice(9,39)),"GBK"); //电池串名称
            let SerialPort = reback.slice(39,41).readUInt16BE(0).toString(10); //串口号
            let Address = reback.slice(41,43).readUInt16BE(0).toString(10); //通讯地址
            let CellNumber = reback.slice(43,45).readUInt16BE(0).toString(10); //电池个数
            let CellType = reback.slice(45,47).readUInt16BE(0).toString(10); //电池类型
            let ModuleType = reback.slice(47,49).readUInt16BE(0).toString(10); //模块类型
            let CellCapacity = reback.slice(49,51).readUInt16BE(0).toString(10); //额定电容
            let RatedImpedance = reback.slice(51,53).readUInt16BE(0).toString(10); //标称内阻
            let MaxCellVol1 = reback.slice(53,55).readUInt16BE(0).toString(10)/1000; //电压上限值1
            let MaxCellVol2 = reback.slice(55,57).readUInt16BE(0).toString(10)/1000; //电压上限值2
            let MinCellVol1 = reback.slice(57,59).readUInt16BE(0).toString(10)/1000; //电压下限值1
            let MinCellVol2 = reback.slice(59,61).readUInt16BE(0).toString(10)/1000; //电压下限值2


            let MaxCellTemp =reback.slice(61,63).readUInt16BE(0).toString(10) / 100; //温度上限值
            let MinCellTemp = reback.slice(63,65).readUInt16BE(0).toString(10) /100; //温度下限值
            let MaxCellRes = reback.slice(65,67).readUInt16BE(0).toString(10) ; //内阻上限值
            let MinCellCap = reback.slice(67,69).readUInt16BE(0).toString(10) / 10; //容量下限值
            let MaxDeltaVol = reback.slice(69,71).readUInt16BE(0).toString(10) / 1000; //电压差上限值
            let MaxResRate = reback.slice(71,73).readUInt16BE(0).toString(10); //内阻变化率上限值
            let MaxDischargeCur = reback.slice(73,75).readUInt16BE(0).toString(10)/ 100; //放电电流上限值
            let MaxChargeCur = reback.slice(75,77).readUInt16BE(0).toString(10)/ 100; //充电电流上限值
            let MinChargeCur = reback.slice(77,79).readUInt16BE(0).toString(10)/  100; //充电电流下限值
            let MaxFloatCur = reback.slice(79,81).readUInt16BE(0).toString(10)/  100; //浮充电流上限值



            let MaxTotalVol = reback.slice(81,83).readUInt16BE(0).toString(10)/  10; //总电压上限值
            let MinTotalVol = reback.slice(83,85).readUInt16BE(0).toString(10)/  10; //总电压下限值
            let MaxRipple =reback.slice(85,87).readUInt16BE(0).toString(10)/  100; //纹波系数上限值
            let ResSpan = reback.slice(87,89).readUInt16BE(0).toString(10); //内阻采样间隔
            let NormalSpan = reback.slice(89,91).readUInt16BE(0).toString(10) ; //正常电压采样间隔
            let ChargeSpan = reback.slice(91,93).readUInt16BE(0).toString(10) ; //充放电电压采样间隔
            let StopTotalVol = reback.slice(93,95).readUInt16BE(0).toString(10)/  10; //终止放电总电压值
            let StopCellVol = reback.slice(95,97).readUInt16BE(0).toString(10)/  1000; //终止放电单体电压值
            let StopTimeSpan = reback.slice(97,99).readUInt16BE(0).toString(10); //终止放电时间
            let StopTemperature = reback.slice(99,101).readUInt16BE(0).toString(10)/  100; //终止放电温度
            let JhCtrl = reback.slice(101,103).readUInt16BE(0).toString(10); //均衡功能是否自动开启;



            let obj = {};
            obj.StringNo = i;
            obj.StringName = StringName;
            obj.SerialPort = SerialPort;
            obj.Address = Address;
            obj.CellNumber = CellNumber;
            obj.CellType = CellType;
            obj.ModuleType = ModuleType;
            obj.CellCapacity = CellCapacity;
            obj.RatedImpedance = RatedImpedance;
            obj.MaxCellVol1 = MaxCellVol1;
            obj.MaxCellVol2 = MaxCellVol2;
            obj.MinCellVol1 = MinCellVol1;
            obj.MinCellVol2 = MinCellVol2;
            obj.MaxCellTemp = MaxCellTemp;
            obj.MinCellTemp = MinCellTemp;
            obj.MaxCellRes = MaxCellRes;
            obj.MinCellCap = MinCellCap;
            obj.MaxDeltaVol = MaxDeltaVol;
            obj.MaxResRate = MaxResRate;
            obj.MaxDischargeCur = MaxDischargeCur;
            obj.MaxChargeCur = MaxChargeCur;
            obj.MinChargeCur = MinChargeCur;
            obj.MaxFloatCur = MaxFloatCur
            obj.MaxTotalVol = MaxTotalVol;
            obj.MinTotalVol = MinTotalVol;
            obj.MaxRipple = MaxRipple;
            obj.ResSpan = ResSpan;
            obj.NormalSpan = NormalSpan;
            obj.ChargeSpan = ChargeSpan;
            obj.StopTotalVol = StopTotalVol;
            obj.StopCellVol = StopCellVol;
            obj.StopTimeSpan = StopTimeSpan;
            obj.StopTemperature = StopTemperature;
            obj.JhCtrl = JhCtrl;
            modObj.strData.push(obj);


        }
        resolve()

    })

}

//获得开入装置定值getDiData
async function getDiData(){
    return new Promise(async(resolve,reject)=>{

        //let UpsNum =   0;  //充电机数目
        //let DINum =  0;  //开入
        //let DONum =   0;  //开出
        //let DischargeNum =   0;  //绝缘数量
        //let InsulationNum =   0;  //放电数量

        for(let i=0;i<DINum;i++){
            //00 00 00 00 00 09 01 10 00 08 00 01 02 00 00  写入开入装置序号
            modbus.frameLen = 9;
            let diBuf = modbus.createWrite10Frame(8,1);
            diBuf = Buffer.concat([diBuf,Buffer.from([0,i])]);
            await connect.writeBack(diBuf);

            //00 00 00 00 00 06 01 03 28 01 00 51   读取该开入装置的数据
            modbus.frameLen = 6;
            let diDataBuf = modbus.createRequest03Frame(0x2801,0x51);
            let diData = await connect.writeBack(diDataBuf);
            let diClassName = iconv.decode(valable.dropBuf00(diData.slice(9,39)),"GBK"); //开入装置模块名称
            let sPort = diData.slice(39,41).readUInt16BE(0).toString(10) ; //串口号
            let tAddress = diData.slice(41,43).readUInt16BE(0).toString(10) ; //通讯地址
            let name1 = iconv.decode(valable.dropBuf00(diData.slice(43,51)),"GBK") ; //开入量1名称
            let name2 = iconv.decode(valable.dropBuf00(diData.slice(51,59)),"GBK") ; //开入量1名称
            let name3 = iconv.decode(valable.dropBuf00(diData.slice(59,67)),"GBK") ; //开入量1名称
            let name4 = iconv.decode(valable.dropBuf00(diData.slice(67,75)),"GBK") ; //开入量1名称
            let name5 = iconv.decode(valable.dropBuf00(diData.slice(75,83)),"GBK") ; //开入量1名称
            let name6 = iconv.decode(valable.dropBuf00(diData.slice(83,91)),"GBK") ; //开入量1名称
            let name7 = iconv.decode(valable.dropBuf00(diData.slice(91,99)),"GBK") ; //开入量1名称
            let name8 = iconv.decode(valable.dropBuf00(diData.slice(99,107)),"GBK") ; //开入量1名称
            let name9 = iconv.decode(valable.dropBuf00(diData.slice(107,115)),"GBK") ; //开入量1名称
            let name10 = iconv.decode(valable.dropBuf00(diData.slice(115,123)),"GBK") ; //开入量1名称
            let name11 = iconv.decode(valable.dropBuf00(diData.slice(123,131)),"GBK") ; //开入量1名称
            let name12 = iconv.decode(valable.dropBuf00(diData.slice(131,139)),"GBK") ; //开入量1名称
            let name13 = iconv.decode(valable.dropBuf00(diData.slice(139,147)),"GBK") ; //开入量1名称
            let name14 = iconv.decode(valable.dropBuf00(diData.slice(147,155)),"GBK") ; //开入量1名称
            let name15 = iconv.decode(valable.dropBuf00(diData.slice(155,163)),"GBK") ; //开入量1名称
            let name16 = iconv.decode(valable.dropBuf00(diData.slice(163,171)),"GBK") ; //开入量1名称
            modObj.diData = {
                diClassName:diClassName,
                sPort:sPort,
                tAddress:tAddress,
                name1:name1,
                name2:name2,
                name3:name3,
                name4:name4,
                name5:name5,
                name6:name6,
                name7:name7,
                name8:name8,
                name9:name9,
                name10:name10,
                name11:name11,
                name12:name12,
                name13:name13,
                name14:name14,
                name15:name15,
                name16:name16
            }
        }

        resolve()

    })

}

//获得开出装置定值getDoData
async function getDoData(){
    return new Promise(async(resolve,reject)=>{
        //let UpsNum =   0;  //充电机数目
        //let DINum =  0;  //开入
        //let DONum =   0;  //开出
        //let DischargeNum =   0;  //绝缘数量
        //let InsulationNum =   0;  //放电数量

        for(let i=0;i<DONum;i++){
            //00 00 00 00 00 09 01 10 00 09 00 01 02 00 00  写入开入装置序号
            modbus.frameLen = 9;
            let diBuf = modbus.createWrite10Frame(9,1);
            diBuf = Buffer.concat([diBuf,Buffer.from([0,i])]);
            await connect.writeBack(diBuf);

            //00 00 00 00 00 06 01 03 30 01 00 55   读取该开入装置的数据
            modbus.frameLen = 6;
            let diDataBuf = modbus.createRequest03Frame(0x3001,0x55);
            let diData = await connect.writeBack(diDataBuf);
            let diClassName = iconv.decode(valable.dropBuf00(diData.slice(9,39)),"GBK"); //开入装置模块名称
            let sPort = diData.slice(39,41).readUInt16BE(0).toString(10) ; //串口号
            let tAddress = diData.slice(41,43).readUInt16BE(0).toString(10) ; //通讯地址
            let level1 = diData.slice(43,45).readUInt16BE(0).toString(10) ; //通讯地址
            let level2 = diData.slice(45,47).readUInt16BE(0).toString(10) ; //通讯地址
            let level3 = diData.slice(47,49).readUInt16BE(0).toString(10) ; //通讯地址
            let level4 = diData.slice(49,51).readUInt16BE(0).toString(10) ; //通讯地址
            let level5 = diData.slice(51,53).readUInt16BE(0).toString(10) ; //通讯地址
            let level6 = diData.slice(53,55).readUInt16BE(0).toString(10) ; //通讯地址
            let level7 = diData.slice(55,57).readUInt16BE(0).toString(10) ; //通讯地址
            let level8 = diData.slice(57,59).readUInt16BE(0).toString(10) ; //通讯地址
            let level9 = diData.slice(59,61).readUInt16BE(0).toString(10) ; //通讯地址
            let level10 = diData.slice(61,63).readUInt16BE(0).toString(10) ; //通讯地址
            let level11 = diData.slice(63,65).readUInt16BE(0).toString(10) ; //通讯地址
            let level12 = diData.slice(65,67).readUInt16BE(0).toString(10) ; //通讯地址
            let level13 = diData.slice(67,69).readUInt16BE(0).toString(10) ; //通讯地址
            let level14 = diData.slice(69,71).readUInt16BE(0).toString(10) ; //通讯地址
            let level15 = diData.slice(71,73).readUInt16BE(0).toString(10) ; //通讯地址
            let level16 = diData.slice(73,75).readUInt16BE(0).toString(10) ; //通讯地址

            let name1 = iconv.decode(valable.dropBuf00(diData.slice(75,83)),"GBK") ; //开入量1名称
            let name2 = iconv.decode(valable.dropBuf00(diData.slice(83,91)),"GBK") ; //开入量1名称
            let name3 = iconv.decode(valable.dropBuf00(diData.slice(91,99)),"GBK") ; //开入量1名称
            let name4 = iconv.decode(valable.dropBuf00(diData.slice(99,107)),"GBK") ; //开入量1名称
            let name5 = iconv.decode(valable.dropBuf00(diData.slice(107,115)),"GBK") ; //开入量1名称
            let name6 = iconv.decode(valable.dropBuf00(diData.slice(115,123)),"GBK") ; //开入量1名称
            let name7 = iconv.decode(valable.dropBuf00(diData.slice(123,131)),"GBK") ; //开入量1名称
            let name8 = iconv.decode(valable.dropBuf00(diData.slice(131,139)),"GBK") ; //开入量1名称
            let name9 = iconv.decode(valable.dropBuf00(diData.slice(139,147)),"GBK") ; //开入量1名称
            let name10 = iconv.decode(valable.dropBuf00(diData.slice(147,155)),"GBK") ; //开入量1名称
            let name11 = iconv.decode(valable.dropBuf00(diData.slice(155,163)),"GBK") ; //开入量1名称
            let name12 = iconv.decode(valable.dropBuf00(diData.slice(163,171)),"GBK") ; //开入量1名称
            let name13 = iconv.decode(valable.dropBuf00(diData.slice(171,179)),"GBK") ; //开入量1名称
            let name14 = iconv.decode(valable.dropBuf00(diData.slice(179,187)),"GBK") ; //开入量1名称
            let name15 = iconv.decode(valable.dropBuf00(diData.slice(187,195)),"GBK") ; //开入量1名称
            let name16 = iconv.decode(valable.dropBuf00(diData.slice(195,203)),"GBK") ; //开入量1名称
            modObj.doData = {
                doClassName:diClassName,
                sPort:sPort,
                tAddress:tAddress,
                level1:level1,
                level2:level2,
                level3:level3,
                level4:level4,
                level5:level5,
                level6:level6,
                level7:level7,
                level8:level8,
                level9:level9,
                level10:level10,
                level11:level11,
                level12:level12,
                level13:level13,
                level14:level14,
                level15:level15,
                level16:level16,
                name1:name1,
                name2:name2,
                name3:name3,
                name4:name4,
                name5:name5,
                name6:name6,
                name7:name7,
                name8:name8,
                name9:name9,
                name10:name10,
                name11:name11,
                name12:name12,
                name13:name13,
                name14:name14,
                name15:name15,
                name16:name16
            }
        }
        resolve()

    })

}

//获得放电装置定值getDischargeData
async function getDischargeData(){
    return new Promise(async(resolve,reject)=>{
        //let UpsNum =   0;  //充电机数目
        //let DINum =  0;  //开入
        //let DONum =   0;  //开出
        //let DischargeNum =   0;  //绝缘数量
        //let InsulationNum =   0;  //放电数量
        for(let i=0;i<InsulationNum;i++){
            //00 00 00 00 00 09 01 10 00 0B 00 01 02 00 00  写入开入装置序号
            modbus.frameLen = 9;
            let diBuf = modbus.createWrite10Frame(0xB,1);
            diBuf = Buffer.concat([diBuf,Buffer.from([0,i])]);
            await connect.writeBack(diBuf);

            //00 00 00 00 00 06 01 03 40 01 00 14   读取该开入装置的数据
            modbus.frameLen = 6;
            let diDataBuf = modbus.createRequest03Frame(0x4001,0x14);
            let diData = await connect.writeBack(diDataBuf);
            let diClassName = iconv.decode(valable.dropBuf00(diData.slice(9,39)),"GBK"); //开入装置模块名称
            let sPort = diData.slice(39,41).readUInt16BE(0).toString(10) ; //串口号
            let tAddress = diData.slice(41,43).readUInt16BE(0).toString(10) ; //通讯地址
            let stopDischargeV = diData.slice(43,45).readUInt16BE(0).toString(10)/10 ; //终止放电电压
            let dischargeTime = diData.slice(45,47).readUInt16BE(0).toString(10) ; //放电时间
            let dischargeI = diData.slice(47,49).readUInt16BE(0).toString(10)/10 ; //放电电流
            modObj.dischargeData = {
                dischargeName:diClassName,
                sPort:sPort,
                tAddress:tAddress,
                stopDischargeV:stopDischargeV,
                dischargeTime:dischargeTime,
                dischargeI:dischargeI
            }
        }
        resolve()

    })

}

//获得充电机装置装置定值getChargerData
async function getChargerData(){
    return new Promise(async(resolve,reject)=>{
        resolve()
    })

}
//获得绝缘监察装置装置定值getJYJCData

async function getJYJCData(){
    return new Promise(async(resolve,reject)=>{
        resolve()

    })

}


exports.getSettings = async function(ip){
    return new Promise(async(resolve,reject)=>{
        console.log(442)
        StringNum = 1;
        UpsNum =   0;  //充电机数目
        DINum =  0;  //开入
        DONum =   0;  //开出
        DischargeNum =   0;  //绝缘数量
        InsulationNum =   0;  //放电数量
        modObj.strData = [];
        for(let i = 0;i<valable.stationIPArr.length;i++){
            let item = valable.stationIPArr[i];
            if(ip == item.ip){
                connect = item.socket;
                //connect.index();
                await getModbusValue();
                await getStrSettings();
                console.log(455)
                if(DINum){
                    await getDiData()
                    console.log(462)
                }


                if(DONum)await getDoData()
                if(InsulationNum)await getDischargeData()
                if(UpsNum)await getChargerData()
                if(DischargeNum)await getJYJCData()
            }
        }
        resolve({status:200,msg:"success",data:modObj})
    })


}
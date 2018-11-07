/**
 * Created by Administrator on 2018-7-11.
 */
//电池串数量
exports.StringNum = 2;
//电池块数量
exports.dcCount = 5;
//历史数据采集次序
exports.hisSelectCount = 1;

//告警数据采集次序
exports.alarmSelectCount = 1;
//集中器ip的集合
exports.stationIPArr = [
    //{ ip: '192.168.1.180', destroy: true, socket: '' },
    { ip: '192.168.1.235', destroy: true, socket: '' ,StationID:1},
    { ip: '192.168.1.234', destroy: true, socket: '',StationID:2 },
    //{ ip: '192.168.1.236', destroy: true, socket: '' }
];
//ip和id对应的对象
exports.idAndIpObj = {'1029':'192.168.1.235'};
//id和ip对应的对象
exports.ipAndIdObj = {'192.168.1.235':'1029'};

exports.socked_clocked = 0;
exports.timer = null;
exports.timerCount = 0;
exports.isCallback = 0;





//根据输入地址和长度生成报文
//功能码actionNum, 寄存器数量 deviceCount
exports.createModbus = (actionNum,deviceCount)=>{
    var actionNum = actionNum;
    var allNum = deviceCount*2;
    var h16 = allNum+3;
    var modbusArr = [0x00,0x00,0x00,0x00,0x00,h16,0x01,actionNum,allNum];
    for(var i=0;i<allNum;i++){
        var value = 1;
        modbusArr.push(value)
    }
    return Buffer.from(modbusArr);
}

//返回一个缓存区
exports.createBuf = (a)=>{
    var buf = Buffer.alloc(2);
    buf.writeInt16BE(a);
    return buf;
}
//拆分ip成数组
/*
* return buf
* params buf,buf类，start切割的开始位置，end buf类最后的位置
*
* */
exports.dropBuf00 = (buf)=>{
    var position0 = (buf.indexOf(Buffer.from([0,0])));
    if(position0 !=-1){
        buf = buf.slice(0,position0)
    }
    return buf;
}
//拆分ip成数组
exports.splitIp = (ip)=>{
    if(!ip){
        var modbusArr = [];
        for(var i=0;i<46;i++){
            var value = 0;
            modbusArr.push(value)
        }
        return Buffer.from(modbusArr);
    }
    var arrBuf = Buffer.from(ip.split('.'));
//	console.log(arrBuf);
    return arrBuf;
}

//获得手机号的buf
exports.getTelBuf = (tel)=>{
    if(!tel){
        var modbusArr = [];
        for(var i=0;i<16;i++){
            var value = 0;
            modbusArr.push(value)
        }
        return Buffer.from(modbusArr);
    }
    var arr = (tel.split(''));
    for (let i = 0;i<arr.length;i++) {
        arr[i] = parseInt(arr[i])+48;
    }
    for(var i=0;i<(16-tel.length);i++){
        arr.push(0)
    }
    var arrBuf = Buffer.from(arr);
    return arrBuf;
}

exports.isIncrease = 0;



//电池状态数组
exports.dcStatusArr = ['通信失败','','','','','电池内阻变化率越上限','电池电压差越上限','电池容量越下限','电池电阻越下限','电池电阻越上限'
    ,'电池温度越下限','电池温度越上限','电池电压越下限2','电池电压越下限1','电池电压越上限2','电池电压越上限1'];

//电池串状态，电压电流数组
exports.allStatusArr = ['通信失败','','','','','正在测量内阻0X0400','电池故障','浮充状态','正在放电','正在充电','纹波系数越上限',
    '放电电流越上限','充电电流越下限','充电电流越上限','总电压越下限','总电压越上限'];

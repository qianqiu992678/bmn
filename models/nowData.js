/**
 * Created by Administrator on 2018-7-11.
 */
let valable = require("./valable");
let Modbus = require("./Modbus");
let logger = require("./log4");
let modbus = new Modbus();
let NowData = function(){
    this.ip = '';//ip地址
    this.cellNum = 1;//电池串序号
    this.dataObj = {headData:{},bodyData:[]};
    this.arr = [];
};
let connect;
NowData.prototype.getData = function(ip,cellNum){
    let $this = this;
    return new Promise( async (resolve,reject)=>{
        $this.ip = ip;
        $this.cellNum = cellNum;
        //$this.dataObj = {};

        for(let i = 0;i<valable.stationIPArr.length;i++){
            let item = valable.stationIPArr[i];
            if(ip == item.ip){
                connect = item.socket;
                //connect.index();
                //写入第几串电池
                modbus.frameLen = 9;
                let data = modbus.createWrite10Frame(0x6,1);
                data = Buffer.concat([data,Buffer.from([0x0,cellNum])]);
                await connect.writeBack(data);
                await $this.getHeadData();
                await $this.getEveryData( 3,'dianya',1000,9)
                await $this.getEveryData( 4,'wendu',100,9)
                await $this.getEveryData( 5,'status',1,8);
                await $this.getEveryData( 6,'neizu',1000,9)
                await $this.getEveryData( 7,'nzbhl',1000,9)
                await $this.getEveryData( 8,'rl',10,9);
                await $this.getDeviceDi();//开入装置
                await $this.getDeviceDo();//开出装置
                await $this.getDischarge();//放电装置
                await $this.getCharger();//充电装置
                await $this.getJYJCData();//绝缘监察装置
            }
        }
        resolve($this.dataObj)
    })
}

// 获得头部的数据
NowData.prototype.getHeadData = function(){
    var $this = this;
    return new Promise(async (resolve,reject)=>{
        modbus.frameLen = 6;
        let data = modbus.createRequest03Frame(0x300,9);
        let reback =await connect.writeBack(data);
        //处理报文
        //clearTimeout(timerId);
        if(reback.length>6&&reback.slice(1,3).readUInt16BE(0).toString(10)==0&&reback.slice(3,5).readUInt16BE(0).toString(10)==0){
            clearInterval(valable.timer);
            //接收数据结束后，拼接所有收到的Buffer对象
            let year = Buffer.concat( [reback.slice(9,10),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let month = Buffer.concat( [reback.slice(10,11),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let date = Buffer.concat( [reback.slice(11,12),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let hour = Buffer.concat( [reback.slice(12,13),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let min = Buffer.concat( [reback.slice(13,14),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let sen = Buffer.concat( [reback.slice(14,15),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let disCount =reback.slice(15,17).readUInt16BE(0).toString(10);
            let dcczt = reback.slice(17,19).readUInt16BE(0).toString(2);
            let oBefore = '';
            for(let i=0;i<16-dcczt.length;i++){
                oBefore+='0'
            };
            let dccztTo10 = reback.slice(17,19).readUInt16BE(0).toString(10);
            let lastDcczt = oBefore+dcczt;
            let dccVal = '';
            for(let i=lastDcczt.length;i>=0;i--){
                let item = lastDcczt[i];
                if(item ==1){
                    dccVal+=valable.allStatusArr[i]+';';
                }
            }
            let allV = reback.slice(19,21).readUInt16BE(0).toString(10)/100;
            let allI = reback.slice(21,23).readUInt16BE(0).toString(10)/100;
            let wbxs = reback.slice(23,25).readUInt16LE(0).toString(10)/100;
            //let wendu = reback.slice(25,27).readUInt16BE(0).toString(10)/10;
            let dcCount = reback.slice(25,27).readUInt16BE(0).toString(10);
            valable.dcCount = dcCount;
            $this.dataObj.headData = {
                time:year+'-'+month+'-'+date+' '+hour+':'+min+":"+sen,
                disCount:disCount,
                dcStatus:dccztTo10+dccVal,
                allV:allV,
                allI:allI,
                wbxs:wbxs,
                wendu:'',
                dcCount:dcCount
            }
        }else{
            logger.info('返回的报文有错');

        }
        resolve();
    })


}

//封装各个的方法
NowData.prototype.getEveryData =  function(address,val,num,a){
    let $this = this;
    return new Promise( async(resolve,reject)=>{
        let data = Buffer.from([0x00, 0x00, 0x00 ,0x00 ,0x00 ,0x06 ,0x01 ,0x03 ,0x0+address ,0x0+a ,0x00 ,valable.dcCount]);
        let reback = await connect.writeBack(data);
        if(reback.length>6&&reback.slice(1,3).readUInt16BE(0).toString(10)==0&&reback.slice(3,5).readUInt16BE(0).toString(10)==0){
            // 接收数据结束后，拼接所有收到的Buffer对象
            for(let i = 0;i<valable.dcCount;i++){
                let  dcV = reback.slice(i*2+9,i*2+11).readUInt16BE(0).toString(10)/num;
                //logger.info('电池序号为'+(i+1)+'的'+val+'为'+dcV)
                if($this.arr[i]){
                    $this.arr[i][val]=dcV;
                    $this.arr[i].cellId=i;
                }else{
                    $this.arr[i]={};
                    $this.arr[i][val]=dcV;
                    $this.arr[i].cellId=i;
                }
                $this.dataObj.bodyData=$this.arr;
                //如果为测量各个电池的内阻，则
                if(i==(valable.dcCount-1)){
                    resolve();
                }
            }

        }else{
            logger.info('返回的报文有错1')

        }
    })


}
                    //获得放电装置的数据

                    //获得绝缘监察的数据
//获得开入装置的数据
NowData.prototype.getDeviceDi = function(){
    let $this = this;
	//00 00 00 00 00 06 01 03 29 00 00 06    00 00 00 00 00 09 01 10 00 08 00 01 02 00 00
    return new Promise(async(resolve,reject)=>{
        let data = modbus.createRequest03Frame(0x2900,6);
        let reback =await connect.writeBack(data);
        //console.log('开入data',data);
        //console.log('开入',reback);
        let year = Buffer.concat( [reback.slice(9,10),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let month = Buffer.concat( [reback.slice(10,11),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let date = Buffer.concat( [reback.slice(11,12),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let hour = Buffer.concat( [reback.slice(12,13),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let min = Buffer.concat( [reback.slice(13,14),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let sen = Buffer.concat( [reback.slice(14,15),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let time = '20'+year+'-'+month+'-'+date+' '+hour+':'+min+':'+sen;


        let recordNo =reback.slice(15,17).readUInt16BE(0).toString(10);
        let diStatus = reback.slice(17,19).readUInt16BE(0).toString(2).split("").reverse().join("");
        var len = diStatus.length;
        if(len != 16) {
            for(let n = 0; n < 16 - len; n++) {
                diStatus += '0'
            }
        }


        $this.dataObj.deviceDiData = {
            time:time,
            recordNo:recordNo,
            diStatus:diStatus
        }
        resolve();

    })


}
//获得开出的数据
NowData.prototype.getDeviceDo = async function(){
    let $this = this;
	//00 00 00 00 00 06 01 03 29 00 00 06


    //00 00 00 00 00 09 01 10 00 09 00 01 02 00 00
    //9:33:15  recv: 00 00 00 00 00 06 01 10 00 09 00 01
    //9:33:15  send: 00 00 00 00 00 06 01 03 31 00 00 06
    //9:33:15  recv: 00 00 00 00 00 0F 01 03 0C 01 01 01 01 01 01 00 01 00 00 00 00
    return new Promise(async(resolve,reject)=>{
        let data = modbus.createRequest03Frame(0x3100,6);
        let reback =await connect.writeBack(data);
        let year = Buffer.concat( [reback.slice(9,10),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let month = Buffer.concat( [reback.slice(10,11),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let date = Buffer.concat( [reback.slice(11,12),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let hour = Buffer.concat( [reback.slice(12,13),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let min = Buffer.concat( [reback.slice(13,14),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let sen = Buffer.concat( [reback.slice(14,15),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let time = '20'+year+'-'+month+'-'+date+' '+hour+':'+min+':'+sen;


        let recordNo =reback.slice(15,17).readUInt16BE(0).toString(10);
        let diStatus = reback.slice(17,19).readUInt16BE(0).toString(2).split("").reverse().join("");
        var len = diStatus.length;
        if(len != 16) {
            for(let n = 0; n < 16 - len; n++) {
                diStatus += '0'
            }
        }
        $this.dataObj.deviceDoData = {
            time:time,
            recordNo:recordNo,
            diStatus:diStatus
        }
        resolve();
    })


}
//获得放电的数据
NowData.prototype.getDischarge = async function(){
    let $this = this;
    //00 00 00 00 00 09 01 10 00 0B 00 01 02 00 00
    //9:44:30  recv: 00 00 00 00 00 06 01 10 00 0B 00 01
    //9:44:30  send: 00 00 00 00 00 06 01 03 40 FD 00 01
    //9:44:30  recv: 00 00 00 00 00 05 01 03 02 00 00
    return new Promise(async(resolve,reject)=>{
        let data = modbus.createRequest03Frame(0x40FD,1);
        let reback =await connect.writeBack(data);
        let dischargeStatus = Buffer.concat( [reback.slice(9,11),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let arr = ['没放电','正在放电'];
        $this.dataObj.dischargeData = {
            dischargeStatus:dischargeStatus,
            dischargeText:arr[dischargeStatus]
        }
        resolve();
    })


}
//获得充电机的数据
NowData.prototype.getCharger = async function(){
    let $this = this;
    //9:57:47  send: 00 00 00 00 00 09 01 10 00 07 00 01 02 00 00
    //9:57:47  recv: 00 00 00 00 00 06 01 10 00 07 00 01
    //9:57:47  send: 00 00 00 00 00 06 01 03 21 00 00 0A
    //9:57:47  recv: 00 00 00 00 00 17 01 03 14 10 03 19 08 08 10 00 01 00 00 00 DC 00 0F 00 05 00 05 00 02
    return new Promise(async(resolve,reject)=>{
        let data = modbus.createRequest03Frame(0x2100,0xA);
        let reback =await connect.writeBack(data);
        let year = Buffer.concat( [reback.slice(9,10),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let month = Buffer.concat( [reback.slice(10,11),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let date = Buffer.concat( [reback.slice(11,12),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let hour = Buffer.concat( [reback.slice(12,13),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let min = Buffer.concat( [reback.slice(13,14),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let sen = Buffer.concat( [reback.slice(14,15),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let time = '20'+year+'-'+month+'-'+date+' '+hour+':'+min+':'+sen;
        let arr = ['没充电','正在充电'];

        let recordNo =reback.slice(15,17).readUInt16BE(0).toString(10);
        let curStatus = reback.slice(17,19).readUInt16BE(0).toString(10);
        let dianya = reback.slice(19,21).readUInt16BE(0).toString(10);
        let dianliu = reback.slice(21,23).readUInt16BE(0).toString(10);
        let jingduV = reback.slice(23,25).readUInt16BE(0).toString(10);
        let jingduI = reback.slice(25,27).readUInt16BE(0).toString(10);
        let wbxs = reback.slice(27,29).readUInt16BE(0).toString(10);
        $this.dataObj.chargerData = {
            time:time,
            recordNo:recordNo,
            curStatus:curStatus,
            curStatusText:arr[curStatus],
            dianya:dianya,
            dianliu:dianliu,
            jingduV:jingduV,
            jingduI:jingduI,
            wbxs:wbxs
        }
        resolve();
    })


}
//获得绝缘监察的数据
NowData.prototype.getJYJCData = async function(){
    let $this = this;
    //10:12:29 send: 00 00 00 00 00 09 01 10 00 0A 00 01 02 00 00
    //10:12:29 recv: 00 00 00 00 00 06 01 10 00 0A 00 01
    //10:12:29 send: 00 00 00 00 00 06 01 03 39 00 00 09
    //10:12:29 recv: 00 00 00 00 00 15 01 03 12 0D 0C 02 0B 25 2D 00 01 13 ED 0F B5 00 70 00 71 00 E1
    return new Promise(async(resolve,reject)=>{
        let data = modbus.createRequest03Frame(0x3900,9);
        let reback =await connect.writeBack(data);
        let year = Buffer.concat( [reback.slice(9,10),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let month = Buffer.concat( [reback.slice(10,11),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let date = Buffer.concat( [reback.slice(11,12),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let hour = Buffer.concat( [reback.slice(12,13),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let min = Buffer.concat( [reback.slice(13,14),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let sen = Buffer.concat( [reback.slice(14,15),Buffer.alloc(1)]).readUInt16LE(0).toString(10);
        let time = '20'+year+'-'+month+'-'+date+' '+hour+':'+min+':'+sen;
        let recordNo =reback.slice(15,17).readUInt16BE(0).toString(10);

        let res = reback.slice(17,19).readUInt16BE(0).toString(10);
        let res_ = reback.slice(19,21).readUInt16BE(0).toString(10);
        let dianya = reback.slice(21,23).readUInt16BE(0).toString(10);
        let dianya_ = reback.slice(23,25).readUInt16BE(0).toString(10);
        let dianyaAll = reback.slice(25,27).readUInt16BE(0).toString(10);
        $this.dataObj.JYJCData = {
            time:time,
            recordNo:recordNo,
            res:res,
            res_:res_,
            dianya:dianya,
            dianya_:dianya_,
            dianyaAll:dianyaAll
        }
        resolve();
    })


}
var nowData = new NowData();
module.exports = nowData;
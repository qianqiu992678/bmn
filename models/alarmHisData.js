/**
 * Created by Administrator on 2018-7-11.
 */
let logger = require("./log4");
let db=require('./db');
let valable = require("./valable");
let comment=require('./comment');
let Socket = require("./socketConn");
let config = require("./config");
let Modbus = require("./Modbus");
let iconv = require("iconv-lite");
let modbus = new Modbus();
let CircularJSON = require('circular-json');
//建立连接
let AlarmData = function() {
    this.selectNum = 1;
    this.alarmSelectCount = 1;//历史告警记录条数
    this.isHasTem = 0;//是否含有温度电压
    this.isHasR = 0;//是否含有内阻
    this.arr = [];//临时接收数组
    this.dataObj = {contentData:{},headData:{},bodyData:[]};//每一条告警记录
    this.stringNum = 2;//电池串数目
};
let obj;
//连接多个集中器
AlarmData.prototype.connectCenter = async function(idTimeObj){
    let $this = this;
    obj = valable.ipAndIdObj;
    let len = valable.stationIPArr.length;
    for(let i = 0;i<len;i++){
        let item = valable.stationIPArr[i];
        if(!item.destroy){
            let startTime = idTimeObj[item.StationID];

            let connect = item.socket;
            //获得集中器自身的告警数据
            await $this.getJZQAlarmData(connect,item,idTimeObj[item.StationID]);



            //获得电池串的告警数据
            for(let k = 0;k<$this.stringNum;k++){
                //写入电池串序号
                modbus.frameLen = 9;
                let cellNumHeadData = modbus.createWrite10Frame(6,1);
                cellNumData = Buffer.concat([cellNumHeadData,Buffer.from([0,k])]);
                await connect.writeBack(cellNumData);
                //let a = await connect.onData();
                //写入查询时间
                await $this.writeTime(connect,0x1000,startTime);
                //00 00 00 00 00 06 01 03 10 06 00 01  写入采样次数
                modbus.frameLen = 6;
                let selectNumData = modbus.createRequest03Frame(0x1006,1);

                let selectNumBackData = await connect.writeBack(selectNumData);
                //let selectNumBackData = (await connect.onData());
                $this.alarmSelectCount = Number(selectNumBackData.slice(selectNumBackData.length - 2, selectNumBackData.length).readUInt16BE(0).toString(10));//该段时间历史记录条数
                if(!$this.alarmSelectCount){
                    console.log(item.ip+'集中器'+(k+1)+'号电池串没有新的告警记录');
                    await $this.saveToDataBase({contentData:{},headData:{},bodyData:[]});
                }
                for(let m=0;m<$this.alarmSelectCount;m++){
                    //写入第几条历史告警记录  比如0,1,2。。。
                    $this.dataObj = {contentData:{},headData:{},bodyData:[]};//每一条告警记录
                    $this.arr = [];
                    modbus.frameLen = 9;
                    let alarmNumData = modbus.createWrite10Frame(0x1007,1);
                    alarmNumData = Buffer.concat([alarmNumData,Buffer.from([0,m])]);
                    await connect.writeBack(alarmNumData);
                    //console.log(alarmNumData)
                    //获得 本次告警时间     代码 标识  告警内容
                    modbus.frameLen = 0x6;
                    //00 00 00 00 00 06 01 03 0A 00 00 09
                    let alarmSomeData = modbus.createRequest03Frame(0x1008,0x4C);
                    let alarmContentData = await connect.writeBack(alarmSomeData);
                    //let alarmContentData = await connect.onData()

                    //告警头文件  00 00 00 00 00 06 01 03 11 00 00 09  告警电压头文件
                    //拿电池的数据  3表示电压温度内阻三个字段
                    let oneData = await $this.getAlarmContent(alarmContentData,item.ip,connect,k,1);
                    console.log(81,oneData)
                    await $this.saveToDataBase(oneData);
                }
            }


            //获得充电机的告警数据

            //获得开入装置的告警数据

            //获得开出装置的告警数据

            //获得放电装置的告警数据

            //获得绝缘监察的告警数据
            //await $this.saveHisData(item,idTimeObj[item.StationID]);

        }
        else{
            this.dataObj = {contentData:{},headData:{},bodyData:[]}
        }
    }
                    //return resolve({status:200,msg:'success',data:$this.alarmHisArr});
}

//获得集中器自身的告警数据
AlarmData.prototype.getJZQAlarmData = async function (connect,item,startTime) {
    let $this = this;
    //return new Promise( async(resolve,reject)=>{


        //写入查询时间
        await $this.writeTime(connect,0x0100,startTime);
        //00 00 00 00 00 06 01 03 10 06 00 01  写入采样次数
        modbus.frameLen = 6;
        let selectNumData = modbus.createRequest03Frame(0x0106,1);

        let selectNumBackData = await connect.writeBack(selectNumData);
        //let selectNumBackData = (await connect.onData());
        $this.alarmSelectCount = Number(selectNumBackData.slice(selectNumBackData.length - 2, selectNumBackData.length).readUInt16BE(0).toString(10));//该段时间历史记录条数
    if(!$this.alarmSelectCount){
        console.log(item.ip+'集中器自身没有新的告警记录');
        await $this.saveToDataBase({contentData:{},headData:{},bodyData:[]});
    }
        for(let m=0;m<$this.alarmSelectCount;m++){
            //写入第几条历史告警记录  比如0,1,2。。。
            modbus.frameLen = 9;
            let alarmNumData = modbus.createWrite10Frame(0x0107,1);
            alarmNumData = Buffer.concat([alarmNumData,Buffer.from([0,m])]);
            await connect.writeBack(alarmNumData);
            //console.log(alarmNumData)
            //let t = await connect.onData();
            ////console.log(t);
            //获得 本次告警时间     代码 标识  告警内容
            modbus.frameLen = 0x6;
            //00 00 00 00 00 06 01 03 0A 00 00 09
            let alarmSomeData = modbus.createRequest03Frame(0x0108,0x4C);
            let alarmContentData = await connect.writeBack(alarmSomeData);
            //let alarmContentData = await connect.onData()
            //console.log(alarmContentData)
            let oneData = await $this.getAlarmContent(alarmContentData,item.ip,connect,0,0)
            console.log(131,oneData)
            await $this.saveToDataBase(oneData);
        }
        //resolve();
    //})

}


AlarmData.prototype.writeTime = async function(connect,startAdr,StartTime){
    let $this = this;
    return new Promise(async(resolve,reject)=>{
        modbus.frameLen = 0x13;
        let data = modbus.createWrite10Frame(startAdr,6);
        let now = new Date();
        let startYear = Number(StartTime.slice(2,4));
        let startMonth = Number(StartTime.slice(5,7));
        let startDate = Number(StartTime.slice(8,10));
        let startHour = Number(StartTime.slice(11,13));
        let startMin = Number(StartTime.slice(14,16));
        let startSen = Number(StartTime.slice(17,19))+1;
        let endYear = now.getFullYear()-2000;
        let endMonth = now.getMonth()+1;
        let endDate = now.getDate();
        let endHour = now.getHours();
        let endMin = now.getMinutes();
        let endSen = now.getSeconds();
        data = Buffer.concat([data,Buffer.from([startYear,startMonth,startDate,startHour,startMin,startSen,endYear,endMonth,endDate,endHour,endMin,endSen])]);
        let dataa = await connect.writeBack(data);
        //let b = await connect.onData();
        ////console.log(b)
        resolve()
    })

}

// 获得告警代码  含有电压温度信息标志  含有内阻信息标志  内容
AlarmData.prototype.getAlarmContent = function(reback,staionId,connect,StrNo,DevType){
    let $this = this;
    return new Promise(async(resolve, reject)=>{
        if(reback.length>6&&reback.slice(1,3).readUInt16BE(0).toString(10)==0&&reback.slice(3,5).readUInt16BE(0).toString(10)==0) {
            let year = Buffer.concat([reback.slice(9, 10), Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let month = Buffer.concat([reback.slice(10, 11), Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let date = Buffer.concat([reback.slice(11, 12), Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let hour = Buffer.concat([reback.slice(12, 13), Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let min = Buffer.concat([reback.slice(13, 14), Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let sen = Buffer.concat([reback.slice(14, 15), Buffer.alloc(1)]).readUInt16LE(0).toString(10);
            let alarmCode = reback.slice(15, 17).readUInt16BE(0).toString(10);//告警代码
            let isHasTem = reback.slice(17, 19).readUInt16BE(0).toString(10);//含有电压温度信息标志
            let isHasR = reback.slice(19, 21).readUInt16BE(0).toString(10);//含有内阻信息标志
            let alarmContent = iconv.decode(valable.dropBuf00(reback.slice(21, reback.length)), "GBK");//告警内容
            $this.isHasTem = Number(isHasTem);
            $this.isHasR = Number(isHasR);
            //console.log("isHasTem",$this.isHasTem)
            //console.log("isHasR",$this.isHasR)
            $this.dataObj.contentData = {
                DevNo:StrNo,
                DevType:DevType,
                StationID: staionId,
                WarnTime: '20' + year + '-' + month + '-' + date + " " + hour + ":" + min + ":" + sen,
                VolFlag: isHasTem,
                ResFlag: isHasR,
                Content: alarmContent,
                WarnCode: alarmCode
            };
            if($this.isHasTem ||  $this.isHasR){
                if($this.isHasTem){
                    $this.isHasTem = 0;
                    modbus.frameLen = 0x6;
                    let headData = modbus.createRequest03Frame(0x1100,9);
                    //console.log("head",headData)
                    let headBackData = await connect.writeBack(headData);
                    //let headBackData = await connect.onData();
                    //console.log("headBackData",headBackData)
                    await $this.getHeadData(headBackData);
                    await $this.getEveryData(0x11,'dianya',1000,9,connect);
                    await $this.getEveryData(0x12,'wendu',100,9,connect);

                    if($this.isHasR){
                        $this.isHasR = 0;
                        let headData = modbus.createRequest03Frame(0x1300,9);
                        let headBackData = await connect.writeBack(headData);
                        //let headBackData = (await connect.onData())
                        await $this.getHeadData(headBackData);
                        await $this.getEveryData(0x13,'neizu',1000,9,connect)
                    }

                }else{
                    $this.isHasR = 0;
                    let headData = modbus.createRequest03Frame(0x1300,9);
                    let headBackData = await connect.writeBack(headData);
                    //let headBackData = (await connect.onData());
                    await $this.getHeadData(headBackData);
                    await $this.getEveryData(0x13,'neizu',1000,9,connect)
                }

            }
            else{
                //$this.alarmHisArr.push(JSON.parse(CircularJSON.stringify($this.dataObj)));
                //$this.dataObj.headData = {};
                //$this.dataObj.bodyData = [];
                //$this.dataObj = {contentData:{},headData:{},bodyData:[]};//每一条告警记录
            }
        }else{
            reject('返回的报文有错')
            logger.info('返回的报文有错')
        }
        resolve($this.dataObj);

    })
}

// 获得头部的告警数据
AlarmData.prototype.getHeadData = function (reback) {
    let $this = this;
    return new Promise((resolve, reject)=>{
        //处理报文
        //console.log("reback",reback)
        if(reback.length>6&&reback.slice(1,3).readUInt16BE(0).toString(10)==0&&reback.slice(3,5).readUInt16BE(0).toString(10)==0){
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
            }
            let dccztTo10 = reback.slice(17,19).readUInt16BE(0).toString(10);
            let lastDcczt = oBefore+dcczt;
            let dccVal = '';
            for(let i=lastDcczt.length;i>0;i--){
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
            //console.log("dataObj:",valable.dcCount);
            $this.dataObj.headData = {
                time:'20'+year+'-'+month+'-'+date+' '+hour+':'+min+":"+sen,
                disCount:disCount,
                dcStatus:dccztTo10+dccVal,
                allV:allV,
                allI:allI,
                wbxs:wbxs,
                wendu:'',
                dcCount:dcCount
            }
            resolve()
            //logger.info('日期为20'+year+'-'+month+'-'+date);
            //logger.info('记录序号为'+disCount);
            //logger.info('电池串状态为'+dccztTo10+dccVal );
            //logger.info('总电压为'+allV+'V')
            //logger.info('总电流为'+allI+'A' )
            //logger.info('纹波系数为'+wbxs )
            ////logger.info('温度为'+wendu +'度')
            //logger.info('电池数为'+dcCount+'个' )

            ////console.log('callback后');
        }else{
            reject('返回的报文有错')
            logger.info('返回的报文有错')
        }
    })
}

//获得电压温度内阻
AlarmData.prototype.getEveryData = async function(address,val,num,a,connect){
    let $this = this;
    return new Promise( async(resolve,reject)=>{
        let data = Buffer.from([0x00, 0x00, 0x00 ,0x00 ,0x00 ,0x06 ,0x01 ,0x03 ,0x0+address ,0x0+a ,0x00 ,valable.dcCount]);
        //console.log("dataObj:",valable.dcCount);
        let reback = await connect.writeBack(data);
        //let reback = (await connect.onData());
        if(reback.length>6&&reback.slice(1,3).readUInt16BE(0).toString(10)==0&&reback.slice(3,5).readUInt16BE(0).toString(10)==0){
            // 接收数据结束后，拼接所有收到的Buffer对象

            for(let i = 0;i<valable.dcCount;i++){
                let  dcV = reback.slice(i*2+9,i*2+11).readUInt16BE(0).toString(10)/num;
                //logger.info('电池序号为'+(i+1)+'的'+val+'为'+dcV);
                if($this.arr[i]){
                    $this.arr[i][val]=dcV;
                    $this.arr[i].cellId=i;
                }else{
                    $this.arr[i]={};
                    $this.arr[i][val]=dcV;
                    $this.arr[i].cellId=i;
                }
                $this.dataObj.bodyData=$this.arr;
                ////如果为测量各个电池的内阻并且是最后一节电池，则
                //if(data.slice(8,10).equals(Buffer.from([0x12,9]))&&i==(valable.dcCount-1)){
                //
                //    $this.arr = [];
                //    //$this.alarmHisArr.push(JSON.parse(CircularJSON.stringify($this.dataObj)));
                //    $this.dataObj.headData = {};
                //    $this.dataObj.bodyData = [];
                //
                //    resolve();
                //}else if(data.slice(8,10).equals(Buffer.from([0x13,9]))&&i==(valable.dcCount-1)){
                //
                //    $this.arr = [];
                //    //$this.alarmHisArr.push(JSON.parse(CircularJSON.stringify($this.dataObj)));
                //    $this.dataObj.headData = {};
                //    $this.dataObj.bodyData = [];
                //
                //    resolve();
                //}else if(i==(valable.dcCount-1)){
                //    resolve();
                //}
            }
            resolve($this.dataObj);
        }else{
            reject('返回的报文有错')
            logger.info('返回的报文有错')

        }
    });
}




//获得历史数据
AlarmData.prototype.getHisData = async function (item,startTime){
    let $this = this;
    return new Promise( async(resolve,reject)=>{

})

}

//获得历史数据
AlarmData.prototype.saveToDataBase = async function (item){
    if(!obj[item.contentData.StationID]){
        console.log(379,'StationIP',item.StationIP);
        return
    };


    if(obj[item.contentData.StationID]){
        let sql="INSERT INTO t_info_warning(StationID,DevType,DevNo,WarnTime,VolFlag,ResFlag,Content,WarnTypeID) VALUES(?,?,?,?,?,?,?,?)";
        let ins=[obj[item.contentData.StationID],item.contentData.DevType,item.contentData.DevNo,item.contentData.WarnTime,item.contentData.VolFlag,item.contentData.ResFlag,item.contentData.Content,item.contentData.WarnTypeID];
        db.query({sql,ins,callback:function(err,result){
            if(item.contentData.VolFlag==1){//reslut.insertId
                let sql="INSERT INTO t_info_warn_string_vol " +
                    "(WarnID,StationID,StringNo,RecordTime,StringStatus,TotalVol,Current,Ripple,CellNum,TempEnv) " +
                    "VALUES(?,?,?,?,?,?,?,?,?,?)";
                let ins=[result.insertId,obj[item.contentData.StationID],item.contentData.DevNo,
                    item.headData.time,item.headData.dcStatus,item.headData.allV,
                    item.headData.allI,item.headData.wbxs,item.headData.dcCount,null
                ];
                db.query({sql,ins,callback: function (err,result) {
                    if(err){
                        console.log('insert into t_info_warn_string_vol err!')
                    }else{
                        console.log('insert into t_info_warn_string_vol succ!')
                    }
                }});
                item.bodyData.forEach(function (cell) {
                    let sql="INSERT INTO t_info_warn_cell_vol(WarnID,CellNo,CellVol,CellTemp,CellCap) VALUES(?,?,?,?,?);";
                    let ins=[result.insertId,cell.cellId,cell.dianya,cell.wendu,cell.rl||0];
                    db.query({sql,ins,callback: function (err,result) {
                        if(err){
                            console.log('insert into t_info_warn_cell_vol err!')
                        }else{
                            console.log('insert into t_info_warn_cell_vol succ!')
                        }
                    }})
                })
            }
            else if(item.contentData.ResFlag==1){
                let sql="INSERT INTO t_info_warn_string_res " +
                    "(WarnID,StationID,StringNo,RecordTime,RecordNo,StringStatus,TotalVol,Current,Ripple,CellNum,TempEnv) " +
                    "VALUES(?,?,?,?,?,?,?,?,?,?,?)";
                let ins=[result.insertId,obj[item.contentData.StationID],item.contentData.DevNo,
                    item.headData.time,item.headData.disCount,item.headData.dcStatus,item.headData.allV,
                    item.headData.allI,item.headData.wbxs,item.headData.dcCount,null
                ];
                db.query({sql,ins,callback: function (err,result) {
                    if(err){
                        console.log('insert into t_info_warn_string_res err!')
                    }else{
                        console.log('insert into t_info_warn_string_res succ!')
                    }
                }});
                item.bodyData.forEach(function (cell) {
                    let sql="INSERT INTO t_info_warn_cell_res(WarnID,CellNo,CellRes,CellResRate) VALUES(?,?,?,?);";
                    let ins=[result.insertId,cell.cellId,cell.neizu,cell.nzbhl||0]
                    db.query({sql,ins,callback: function (err,result) {
                        if(err){
                            console.log('insert into t_info_warn_cell_res err!')
                        }else{
                            console.log('insert into t_info_warn_cell_res succ!')
                        }
                    }})
                })
            }
            console.log('t_info_warning电池串告警插入数据成功')
        }})
    }else{
        console.log('442:没有stationId：',item.contentData.StationID)
    }
}


//定时器开始
AlarmData.prototype.startAlarmHisDataInterval = async function (){
    let $this = this;
    let alarmHistoryTimer;
    if(alarmHistoryTimer){
        clearInterval(alarmHistoryTimer);
        alarmHistoryTimer=null;
    }

    alarmHistoryTimer=setInterval(function(){
        let sql="SELECT StationID,max(WarnTime) FROM t_info_warning GROUP BY StationID ";
        db.query({sql,callback: function (err,result) {
            if(err){
                console.log('getDateForDatabase--45',err)
            }else{
                let lastDate;
                let timeObj={};
                console.log(474,result);
                valable.stationIPArr.forEach(function(v){
                    timeObj[v.StationID] = comment.formatTime(new Date('2012-10-10'))
                })

                for(let i = 0;i<result.length;i++){
                    let item = result[i];
                    if(!item['max(WarnTime)']){
                        lastDate = comment.formatTime(new Date(new Date()-1000*60*60*24));
                    }else{
                        lastDate = comment.formatTime(new Date(item['max(WarnTime)']));
                    }
                    timeObj[item.StationID] = lastDate;
                }
                console.log(480,timeObj)
                $this.connectCenter(timeObj);
            }
        }})
    },6000);


}





let alarmHisData = new AlarmData();
module.exports = alarmHisData;
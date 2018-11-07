/**
 * Created by Administrator on 2018-7-11.
 */
let logger = require("./log4")
let db = require('./db');
let alarmHisData = require('./alarmHisData');
let valable = require("./valable");
let comment=require('./comment');
let Socket = require("./socketConn");
let config = require("./config");
let Modbus = require("./Modbus");
let iconv = require("iconv-lite");
let CircularJSON = require('circular-json');
let modbus = new Modbus();


//建立连接
let HisData = function() {
    this.stringNum = 2;//电池串数目
    this.hisSelectCount = 2;//每串的历史条数
    this.dataObj = {headData:{},bodyData:[]};
    this.arr=[];
};
let obj;
//连接多个集中器
HisData.prototype.connectCenter = async function(idTimeObj){
    let $this = this;
    obj=valable.ipAndIdObj;
    let len = valable.stationIPArr.length;
    //return resolve({status:200,msg:'success',data:$this.hisDataArr});
    for(let i = 0;i<len;i++){
        let item = valable.stationIPArr[i];
        if(!item.destroy){
            let startTime = idTimeObj[item.StationID];
            //await $this.getHisData(item,startTime);

            //保存历史数据
            let connect = item.socket;
            for(let k = 0;k<$this.stringNum;k++){
                //写入电池串序号  00 00 00 00 00 09 01 10 00 06 00 01 02 00 00
                modbus.frameLen = 9;
                let cellNumHeadData = modbus.createWrite10Frame(6,1);
                cellNumData = Buffer.concat([cellNumHeadData,Buffer.from([0,k])]);
                let ddd = await connect.writeBack(cellNumData);
                //写入查询时间
                await $this.writeTime(connect,startTime);
                //00 00 00 00 00 06 01 03 09 06 00 01  写入采样次数
                modbus.frameLen = 6;
                let selectNumData = modbus.createRequest03Frame(0x906,1);
                let selectNumBackData = await connect.writeBack(selectNumData);
                $this.hisSelectCount = Number(selectNumBackData.slice(selectNumBackData.length - 2, selectNumBackData.length).readUInt16BE(0).toString(10));//该段时间历史记录条数
                if(!$this.hisSelectCount){
                    //console.log(item.ip+'集中器'+(k+1)+'号电池串没有新的记录');
                    await $this.saveToDataBase({headData:{},bodyData:[]});
                }else{
                    for(let m=0;m<$this.hisSelectCount;m++){
                        $this.dataObj = {headData:{},bodyData:[]};
                        //写入第几条历史记录  比如0,1,2。。。
                        modbus.frameLen = 9;
                        let hisNumData = modbus.createWrite10Frame(0x907,1);
                        hisNumData = Buffer.concat([hisNumData,Buffer.from([0,m])]);
                        await connect.writeBack(hisNumData);
                        //await connect.onData()
                        //头文件  00 00 00 00 00 06 01 03 0A 00 00 09
                        modbus.frameLen = 0x6;
                        let headData = modbus.createRequest03Frame(0x0A00,9);

                        let headBackData = await connect.writeBack(headData);
                        await $this.getHeadData(headBackData,item.ip,k);
                        //拿电池的数据  3表示电压温度内阻三个字段
                        await $this.getEveryData(0xA,'dianya',1000,9,connect);
                        await $this.getEveryData(0xb,'wendu',100,9,connect);
                        let item1 = await $this.getEveryData(0xc,'neizu',1000,9,connect);
                        await $this.saveToDataBase(item1);
                    }
                }

            }
        }
        else{
            this.dataObj = {headData:{},bodyData:[]};
        }
    }


}

HisData.prototype.writeTime = async function(connect,StartTime){
    let $this = this;
    return new Promise(async(resolve,reject)=>{
        modbus.frameLen = 0x13;
        let timeData = modbus.createWrite10Frame(0x900,6);
        let startYear = Number(StartTime.slice(2,4));
        let startMonth = Number(StartTime.slice(5,7));
        let startDate = Number(StartTime.slice(8,10));
        let startHour = Number(StartTime.slice(11,13));
        let startMin = Number(StartTime.slice(14,16));
        let startSen = Number(StartTime.slice(17,19))+1;
        let now = new Date();
        let endYear = now.getFullYear()-2000;
        let endMonth = now.getMonth()+1;
        let endDate = now.getDate();
        let endHour = now.getHours();
        let endMin = now.getMinutes();
        let endSen = now.getSeconds()-1;
        timeData = Buffer.concat([timeData,Buffer.from([startYear,startMonth,startDate,startHour,startMin,startSen,endYear,endMonth,endDate,endHour,endMin,endSen])]);
        await connect.writeBack(timeData);
        //await connect.onData();
        resolve()
    })

}

// 获得头部的历史数据
HisData.prototype.getHeadData = function(reback,stationId,strNo){
    let $this = this;
    return new Promise((resolve, reject)=>{
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
            $this.dataObj.headData = {
                StationIP:stationId,
                strNo:strNo,
                time:'20'+year+'-'+month+'-'+date+' '+hour+':'+min+":"+sen,
                disCount:disCount,
                dcStatus:dccztTo10+dccVal,
                allV:allV,
                allI:allI,
                wbxs:wbxs,
                wendu:'',
                dcCount:dcCount
            }
            resolve();
        }else{
            reject('返回的报文有错')
            logger.info('返回的报文有错')
        }
})}

//获得电压温度内阻
HisData.prototype.getEveryData = async function(address,val,num,a,connect){
    let $this = this;
    return new Promise( async(resolve,reject)=>{
        let data = Buffer.from([0x00, 0x00, 0x00 ,0x00 ,0x00 ,0x06 ,0x01 ,0x03 ,0x0+address ,0x0+a ,0x00 ,0x0+valable.dcCount]);
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
                //如果为测量各个电池的内阻，则
                if(data.slice(8,10).equals(Buffer.from([0xc,9]))&&i==(valable.dcCount-1)){
                    $this.arr = [];
                    //$this.hisDataArr.push(JSON.parse(CircularJSON.stringify($this.dataObj)));
                    //console.log(189,$this.dataObj)
                    resolve($this.dataObj);
                }else if(i==(valable.dcCount-1)){
                    resolve();
                }
            }
        }else{
            logger.info('返回的报文有错')

        }
    });


}

//获得历史数据
HisData.prototype.getHisData = async function (item,startTime){
    let $this = this;
    return new Promise( async(resolve,reject)=>{
        let connect = item.socket;
        for(let k = 0;k<$this.stringNum;k++){
            //写入电池串序号  00 00 00 00 00 09 01 10 00 06 00 01 02 00 00
            modbus.frameLen = 9;
            let cellNumHeadData = modbus.createWrite10Frame(6,1);
            cellNumData = Buffer.concat([cellNumHeadData,Buffer.from([0,k])]);
            await connect.writeBack(cellNumData);
            //写入查询时间
            await $this.writeTime(connect,startTime);
            //00 00 00 00 00 06 01 03 09 06 00 01  写入采样次数
            modbus.frameLen = 6;
            let selectNumData = modbus.createRequest03Frame(0x906,1);
            let selectNumBackData = await connect.writeBack(selectNumData);
            $this.hisSelectCount = Number(selectNumBackData.slice(selectNumBackData.length - 2, selectNumBackData.length).readUInt16BE(0).toString(10));//该段时间历史记录条数
            if(!$this.hisSelectCount){
                resolve({headData:{},bodyData:[]});
            }
            for(let m=0;m<$this.hisSelectCount;m++){
                //写入第几条历史记录  比如0,1,2。。。
                modbus.frameLen = 9;
                let hisNumData = modbus.createWrite10Frame(0x907,1);
                hisNumData = Buffer.concat([hisNumData,Buffer.from([0,m])]);
                await connect.writeBack(hisNumData);
                //await connect.onData()
                //头文件  00 00 00 00 00 06 01 03 0A 00 00 09
                modbus.frameLen = 0x6;
                let headData = modbus.createRequest03Frame(0x0A00,9);

                let headBackData = await connect.writeBack(headData);
                await $this.getHeadData(headBackData,item.ip,k);
                //拿电池的数据  3表示电压温度内阻三个字段
                await $this.getEveryData(0xA,'dianya',1000,9,connect);
                await $this.getEveryData(0xb,'wendu',100,9,connect);
                await $this.getEveryData(0xc,'neizu',1000,9,connect);
                let item1 = await $this.getEveryData(0xc,'neizu',1000,9,connect);
                await $this.saveToDataBase(item1)
            }
        }
    })

}

//存储到数据库
HisData.prototype.saveToDataBase = async function (item){
    if(!obj[item.headData.StationIP]){
        //console.log(256,'item.headData.StationIP',item.headData.StationIP);
        return
    };
        let volSum=0;
        let resSum=0;
        item.bodyData.forEach(function(cell){
            volSum+=cell.dianya;
            resSum+=cell.neizu;
        })
        let SumVarianceVol=0,SumVarianceRes=0;
        item.bodyData.forEach(function(cell){
            SumVarianceVol+=Math.pow(cell.dianya-volSum/item.bodyData.length,2)
            SumVarianceRes+=Math.pow(cell.neizu-resSum/item.bodyData.length,2);
        })
        let VarianceVol=SumVarianceVol/item.bodyData.length;
        let VarianceRes=SumVarianceRes/item.bodyData.length;
        let sql="INSERT INTO t_history_string(StationID,StringNo,RecordTime,RecordNo,StringStatus,TotalVol,Current,Ripple,CellNum,TempEnv," +
            "VarianceVol,VarianceRes,ZHXN_STR) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";

        let ins=[obj[item.headData.StationIP],item.headData.strNo,item.headData.time,item.headData.disCount,parseInt(item.headData.dcStatus), item.headData.allV,item.headData.allI, item.headData.wbxs, item.headData.dcCount, 0,
            VarianceVol,VarianceRes,100];
        db.query({sql,ins,callback: function (err,result) {
            if(err){
                console.log(121,err)
            }else{
                let sql="INSERT INTO t_history_cell(ID,CellNo,CellVol,CellTemp,CellRes,CellStatus,CellCap,JKCD_BAT,ZHXN_BAT,HisType)VALUES";
                let ins=[];
                item.bodyData.forEach(function(cell){
                    sql+="(?,?,?,?,?,?,?,?,?,?),";
                    ins.push(result.insertId,cell.cellId, cell.dianya,cell.wendu,cell.neizu,cell.CellStatus||0,cell.CellCap||0, null,null,
                        cell.HisType||0)
                });
                sql=sql.substring(0,sql.length-1);
                db.query({sql,ins,callback:function(err,result){
                    if(err){
                        console.log(141,err)
                    }else{
                        //console.log(143,result)
                    }
                }})

            }
        }})


}



//定时器开始

let num=0;
HisData.prototype.startHisDataInterval = async function (){
    //alarmHisData

    let $this = this;
    let alarmHistoryTimer;
    if(alarmHistoryTimer){
        clearInterval(alarmHistoryTimer);
        alarmHistoryTimer=null;
    }
    alarmHistoryTimer=setInterval(function(){
        num++;
        if(num%2){
            let dataSql="SELECT StationID,max(RecordTime) FROM t_history_string GROUP BY StationID ";
            db.query({sql:dataSql,callback:function(err,result){
                if(err){

                }else{
                    let lastDate;
                    let timeObj={};
                    valable.stationIPArr.forEach(function(v){
                        timeObj[v.StationID] = comment.formatTime(new Date('2012-10-10'))
                    })
                    for(let i = 0;i<result.length;i++){
                        let item = result[i];
                        if(!item['max(RecordTime)']){
                            lastDate = comment.formatTime(new Date(new Date()-1000*60*60*24));
                        }else{
                            lastDate = comment.formatTime(new Date(item['max(RecordTime)']));
                        }
                        timeObj[item.StationID] = lastDate;
                    }
                    $this.connectCenter(timeObj);
                }
            }})
        }else{
            let sql="SELECT StationID,max(WarnTime) FROM t_info_warning GROUP BY StationID ";
            db.query({sql,callback: function (err,result) {
                if(err){
                    console.log('getDateForDatabase--45',err)
                }else{
                    let lastDate;
                    let timeObj={};
                    //console.log(474,result);
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
                    //console.log(480,timeObj)
                    alarmHisData.connectCenter(timeObj);
                }
            }})
        }

    },6000);


}


let hisData = new HisData();
module.exports = hisData;
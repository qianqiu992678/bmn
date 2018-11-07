/**
 * Created by Administrator on 2018-7-26.
 */
let net = require("net");
let valable = require('./valable')
let hisData = require('./hisData');
let alarmData = require('./alarmHisData');
let Socket = require('./socketConn')
var db=require('./db');
var EventEmitter = require('events').EventEmitter;
EventEmitter.defaultMaxListeners = 10;
//get all stationip
var getIPList=async function(){
    return new Promise(async (resolve,reject)=>{
        let sql="SELECT IPAddress,StationID from t_cfg_station_modbus";
        let list=(await db.query({sql})).rows;
        let stationIPAddressList=[];
        let ipAndIdObj = {};
        let idAndIpObj = {};
        for(let key = 0;key<list.length;key++){
            stationIPAddressList.push({ip:list[key].IPAddress,destroy:true,socket:'',StationID:list[key].StationID});
            idAndIpObj[list[key].StationID] = list[key].IPAddress;
            ipAndIdObj[list[key].IPAddress] = list[key].StationID;
        }
        valable.stationIPArr = stationIPAddressList;
        valable.ipAndIdObj = ipAndIdObj;
        valable.idAndIpObj = idAndIpObj;
        resolve();
    })

}
//function connect(item){
//    let socket = new Socket();
//    socket.index(item);
//    if(item.destroy){
//        socket.socket.connect({port:502,host:item.ip},()=>{
//            item.destroy = socket.socket.destroyed;
//            item.socket = socket;
//            console.log('success',item.ip,item.destroy);
//        });
//    }
//    socket.socket.on("error",()=>{
//
//        //console.log('error start');
//
//        item.destroy = socket.socket.destroyed;
//        socket.socket.destroy();
//        socket = null;
//        //console.log(valable.stationIPArr)
//        connect(item)
//    });
//}

exports.appStart = async function(){
    await getIPList();
    for(let i = 0;i<valable.stationIPArr.length;i++){
        let item = valable.stationIPArr[i];
        //connect(item);
        let socket = new Socket();
        socket.index(item);
    }
    //开启历史数据的定时器
    hisData.startHisDataInterval();

    //开启告警数据的定时器
    //alarmData.startAlarmHisDataInterval()
}

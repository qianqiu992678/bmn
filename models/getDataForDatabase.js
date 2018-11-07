/**
 * Created by Administrator on 2018/7/27 0027.
 */
var db=require('./db');
var comment=require('./comment');
var alarmData = require("./alarmHisData");
var hisData=require("./hisData");
//get all stationip
var obj={};
var getStationIDIPAddress=function(){
   let sql="SELECT StationID,IPAddress from t_cfg_station_modbus";
    db.query({sql,callback:function(err,result){
        if(err){
            console.log(13,err)
        }else{
            result.forEach(function(station){
                obj[station.IPAddress]=station.StationID;
            })
        }
    }})
}
getStationIDIPAddress();

var getAlarmHistoryData=async function (startTime) {
    var result  = await alarmData.connectCenter(startTime);
    //console.log('alarmHistoryData:',startTime,result)
    result.data.forEach(function(item){
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
                }else if(item.contentData.ResFlag==1){
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
            }})
        }else{
            console.log('35:',item.contentData.StationID)
        }

    })
};
var alarmHistoryTimer;
if(alarmHistoryTimer){
    clearInterval(alarmHistoryTimer);
    alarmHistoryTimer=null;
}
var getHistoryData=async function(startTimeArr){
    var result  = await hisData.connectCenter(startTimeArr);
    //console.log('historyData:',result)
    //�浽���ݿ�
    result.data.forEach(function(item){
        if(!obj[item.headData.StationIP]){
            console.log(103,item.headData.StationIP);
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
    })


}
let num=0;
alarmHistoryTimer=setInterval(function(){
    num++;
    if(num%2){
        let sql="SELECT StationID,max(WarnTime) FROM t_info_warning GROUP BY StationID ";
        db.query({sql,callback: function (err,result) {
            if(err){
                console.log('getDateForDatabase--45',err)
            }else{
                let lastDate;
                let stationMaxTimeList=[];
                for(let i = 0;i<result.length;i++){
                    let item = result[i];
                    if(!item['MAX(RecordTime)']){
                        lastDate = comment.formatTime(new Date(new Date()-1000*60*60*24));
                    }else{
                        lastDate = comment.formatTime(new Date(result[0]['MAX(WarnTime)']));
                    }
                    stationMaxTimeList.push({StationID:result[i].StationID,maxTime:lastDate})
                }
                let obj={};
                for (var key in stationMaxTimeList){
                    obj[stationMaxTimeList[key].StationID] = stationMaxTimeList[key].maxTime;
                };
                getAlarmHistoryData(obj);
            }
        }})
    }else{
        let dataSql="SELECT StationID,max(RecordTime) FROM `t_history_string` GROUP BY StationID ";
        db.query({sql:dataSql,callback:function(err,result){
            if(err){

            }else{
                let lastDate;
                let stationMaxTimeList=[];
                for(let i = 0;i<result.length;i++){
                    let item = result[i];
                    if(!item['MAX(RecordTime)']){
                        lastDate = comment.formatTime(new Date(new Date()-1000*60*60*24));
                    }else{
                        lastDate = comment.formatTime(new Date(item['MAX(RecordTime)']));
                    }
                    stationMaxTimeList.push({StationID:result[i].StationID,maxTime:lastDate})
                }

                let obj={};
                for (var key in stationMaxTimeList){
                    obj[stationMaxTimeList[key].StationID] = stationMaxTimeList[key].maxTime;
                }
                getHistoryData(obj);
            }
        }})
    }
},3000);







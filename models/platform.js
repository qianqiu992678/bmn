/**
 * Created by Administrator on 2018/7/20 0020.
 */
var db=require('./db');
var comment=require('./comment');
var websocketServer=require('./websocketServer')
var fileOption=require('./fileOption');
exports.zoneList=function (req, res, next) {
    let sql='select * from t_cfg_zone';
    db.query({sql:sql,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.currentZone=function(req,res,next){
    if(!req.query.id){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql='select * from t_cfg_zone WHERE id=?';
    let ins=[req.query.id];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
}
exports.zoneAdd=function (req, res, next) {
    if(!req.body.Zone||!req.body.parentid){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql =`INSERT INTO t_cfg_zone(Zone,parentid) VALUES(?,?)`;
    let ins=[req.body.Zone,req.body.parentid];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.zoneEdit=function (req, res, next) {
    if(!req.body.Zone||!req.body.id){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql=`UPDATE t_cfg_zone SET Zone=? WHERE id=?`;
    let ins=[req.body.Zone,req.body.id];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.zoneDelete=function (req, res, next) {
    if(!req.body.id){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql="DELETE FROM t_cfg_zone WHERE id=?";
    let ins=[req.body.id];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.stationTypeList=function (req, res, next) {
    let sql='select * from t_def_station';
    db.query({sql:sql,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.stationList=function (req, res, next) {
    let ins;
    let sql;
    if(req.query.ZoneID){
        ins=[req.query.ZoneID];
        sql='SELECT * FROM t_cfg_station_modbus WHERE ZoneID=?';
    }else{
        ins=[];
        sql='SELECT * FROM t_cfg_station_modbus';
    }
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.currentStation=function(req,res,next){
    if(!req.query.StationID){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql='select * from t_cfg_station_modbus WHERE StationID=?';
    let ins=[req.query.StationID];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
}
exports.stationAdd=function (req, res, next) {
    //let sql=`UPDATE t_cfg_zone SET Zone=? WHERE id=?`;
    if(!req.body.StationName||!req.body.StationType||!req.body.IPAddress||!req.body.Port||!req.body.ModbusAddress||!req.body.IPMask||!req.body.Gateway||!req.body.PowerType||!req.body.Longitude||!req.body.Latitude||!req.body.ZoneID){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql =`INSERT INTO t_cfg_station_modbus
        (StationName,StationType,IPAddress,Port,ModbusAddress,IPMask,Gateway,PowerType,Longitude,Latitude,ZoneID) VALUES(?,?,?,?,?,?,?,?,?,?,?)`;
    let ins=[req.body.StationName,req.body.StationType,
        req.body.IPAddress,req.body.Port,
        req.body.ModbusAddress,req.body.IPMask,
        req.body.Gateway, req.body.PowerType,
        req.body.Longitude, req.body.Latitude,
        req.body.ZoneID
    ];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.stationEdit=function (req, res, next) {

    let sql=`UPDATE t_cfg_station_modbus SET
        StationName=?,StationType=?,
        IPAddress=?,Port=?,
        ModbusAddress=?,IPMask=?,
        Gateway=?,PowerType=?,
        Longitude=?,Latitude=?
        WHERE StationID=?`;
    let ins=[req.body.StationName,req.body.StationType,
        req.body.IPAddress,req.body.Port,
        req.body.ModbusAddress,req.body.IPMask,
        req.body.Gateway, req.body.PowerType,
        req.body.Longitude, req.body.Latitude,req.body.StationID
    ];
    let validate=true
    ins.forEach(function(item){
        if(!item){
            validate=false;
            return;
        }
    })
    if(!validate){
        res.json({status:201,data:'',msg:'参数错误！'})
    }
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.stationDelete=function (req, res, next) {
    if(!req.body.StationID){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql="DELETE FROM t_cfg_station_modbus WHERE StationID=?";
    let ins=[req.body.StationID];
    db.query({sql,ins,callback:function(data){
        res.json({status:200,data:data,msg:''});
    }});
};

exports.getCurrentData=function(req,res,next){
    if(!req.body.StationIP||!req.body.StringNo){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    //websocketServer
    websocketServer.
        getCurrentData(req.body.StationIP,req.body.StringNo,res);

}
exports.getSampleValueNames=function(req,res,next){
    if(!req.body.StationID){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql="SELECT * FROM t_cfg_device_di WHERE StationID=?";
    let ins=[req.body.StationID];
    db.query({sql,ins,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            if(!result.length){
                res.json({status:402,data:result,msg:'查询无结果'})
            }else{
                res.json({status:200,data:result[0],msg:''})
            }
        }
    }})
}
exports.getOutputValueNames=function(req,res,next){
    if(!req.body.StationID){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql="SELECT * FROM t_cfg_device_do WHERE StationID=?";
    let ins=[req.body.StationID];
    db.query({sql,ins,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            if(!result.length){
                res.json({status:402,data:result,msg:'查询无结果'})
            }else{
                res.json({status:200,data:result[0],msg:''})
            }
        }
    }})
}//getOutputValueNames
exports.getHistoryData=function (req, res, next) {
    let sql="SELECT * FROM t_history_string WHERE StationID=? AND StringNo=? AND RecordTime< binary ? AND RecordTime> binary ?";
    let ins=[req.body.StationID,req.body.StringNo,req.body.endTime,req.body.startTime];
    let validate=true
    ins.forEach(function(item){
        if(!item){
            validate=false;
            return;
        }
    })
    if(!validate){
        res.json({status:201,data:'',msg:'参数错误！'})
    }
    db.query({sql,ins,callback:function(err,data){

        let StringData=data;
        let responseData=[];
        let str='';
        StringData.forEach(function(item){
            str+=(item.ID+',');
        });
        str=str.substring(0,str.length-1);
        sql=`SELECT * from t_history_cell WHERE ID IN (${str})`;
        db.query({sql,callback:function(err,data){
            StringData.forEach(function(item){
                let cellArr=[];
                for(let i=0;i<data.length;i++){
                    if(data[i].ID==item.ID){
                        cellArr.push(data[i]);
                        data.splice(i,1);
                        i--;
                    }
                }
                responseData.push({time:comment.formatTime(item.RecordTime),headData:item,cellData:cellArr})
            })
            res.json({status:200,data:responseData,msg:''});
        }})
    }});
};
exports.getAlarmhistory=function(req,res,next){

    if(!req.body.StationID||!req.body.endTime||!req.body.startTime){
        res.json({status:201,data:'',msg:'参数错误！'});
        console.log(111)
        return;
    }
    let pageNum=req.body.pageNum||1;
    let row=req.body.row||10;
    let ins=[req.body.StationID,req.body.endTime,req.body.startTime];
        //[(pageNum-1)*row,row*1];

    let where='StationID=?  AND WarnTime<? AND WarnTime>? ';
    if(req.body.WarnTypeID){
        where+='AND WarnTypeID IN (';
        let leng=req.body.WarnTypeID.split(',').length;
        for(let i=0;i<leng;i++){
            where+='?,'
        }
        where=where.substring(0,where.length-1);
        where+=')';
        console.log(297,where)
        //ins.splice(3,0,req.body.WarnTypeID);
        ins=ins.concat(req.body.WarnTypeID.split(','));

    }
    ins=ins.concat([(pageNum-1)*row,row*1]);

    let sql="SELECT * FROM t_info_warning WHERE "+where+" LIMIT ?,?";
    console.log(287,ins)
    db.query({sql,ins,callback:function(err,result1){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            result1.forEach(function(alarm){
                alarm.WarnTime=comment.formatTime(alarm.WarnTime);
            });

            db.query({sql:"SELECT COUNT(*) FROM t_info_warning WHERE "+where,ins,callback:function(err,result2){
                if(err){
                    console.log(19,err)
                }else{
                    res.json({status:200,data:{total:result2[0]['COUNT(*)'],data:result1,pageNum:pageNum*1,row:row*1,pageCount:Math.ceil(result2[0]['COUNT(*)']/row)},msg:'succ'});
                }
            }})
        }
    }});
};

exports.alarmHistoryExport=function(req,res,next){
    let sql='SELECT * FROM t_info_warning WHERE StationID=? AND WarnTime<? AND WarnTime>?';
    let ins=[req.body.StationID,req.body.endTime,req.body.startTime];

    db.query({sql,ins,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            let conf ={};
            conf.cols=[
                {caption:"设备序号",type:'string',width:28.7109375},
                {caption:"告警装置",type:'string',width:28.7109375},
                {caption:"记录产生时间",type:'string',width:28.7109375},
                {caption:"告警代码",type:'string',width:28.7109375},
                {caption:"告警内容",type:'string',width:28.7109375},
            ];
            let list=[];
            console.log(287,result)
            result.forEach(function(alarm){
                let time=comment.formatTime(new Date(alarm.WarnTime));
                list.push([
                    ''+alarm.DevNo,''+alarm.DevType,
                    time,alarm.WarnTypeID,
                    alarm.Content
                ])
            });
            conf.rows=list;
            let sessionID=comment.randomString(32);
            fileOption.executeExcel(conf,sessionID);
            return res.json({
                status: 200,
                data:{
                    url:"/fileExport/excel_download/"+sessionID+".xlsx",
                    fileName:sessionID+'.xlsx'
                }
            })
        }
    }});
}
exports.getAlarmVol=function(req,res,next){
    if(!req.query.WarnID){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let obj={stringData:{},cellData:[]};
    let sql="SELECT * FROM t_info_warn_string_vol WHERE WarnID=?";
    let ins=[req.query.WarnID];
    db.query({sql,ins,callback:function(err,data){
        obj.stringData=data[0];
        sql="SELECT * FROM t_info_warn_cell_vol WHERE WarnID=?";
            db.query({sql,ins,callback:function(err,data){
                if(err){
                    res.json({status:201,data:err,msg:'数据库操作失败！'});
                }else{
                    obj.cellData=data;
                    res.json({status:200,data:obj,msg:''});
                }
            }})
    }});
};
exports.getAlarmRes=function(req,res,next){
    if(!req.query.WarnID){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let obj={stringData:{},cellData:[]};
    let sql="SELECT * FROM t_info_warn_string_res WHERE WarnID=?";
    let ins=[req.query.WarnID];

    db.query({sql,ins,callback:function(err,data){
        obj.stringData=data[0];
        sql="SELECT * FROM t_info_warn_cell_res WHERE WarnID=?";
        db.query({sql,ins,callback:function(err,data){
            if(err){
                res.json({status:201,data:err,msg:'数据库操作失败！'});
            }else{
                obj.cellData=data;
                res.json({status:200,data:obj,msg:'succ'});
            }
        }})
    }});
};
/**
 * Created by Administrator on 2018/7/23 0023.
 */
var db=require('./db');
var getSettings = require("./settings/getSettings");
var settingsData = require("./settings/settingsData");
var setModbus = require("./settings/settingsModbus");
var comment=require('./comment');

exports.getModbusConstant=function(req,res,next){
    if(!req.query.StationID||!req.query.StringNo){
        res.json({status:201,data:'',msg:'��������'});
        return;
    }
    let sql='select * from t_cfg_station_modbus WHERE StationID=?';
    let ins=[req.query.StationID,req.query.StringNo];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'���ݿ��ѯ����'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }

    }});
};
exports.getStringConstant=function(req,res,next){
    if(!req.query.StationID){
        res.json({status:201,data:'',msg:'缺少参数！'});
        return;
    }
    let sql='SELECT * from t_cfg_device_string WHERE StationID=?';
    let ins=[req.query.StationID];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};//
exports.synchronousData=async function(req,res,next){
    if(!req.query.StationID){
        res.json({status:201,data:'',msg:'缺少参数！'});
        return;
    }
    var data = await getSettings.getSettings(req.query.StationIP);
    console.log(47,data);
    if(data.status==200){
        let sql2="DELETE FROM t_cfg_device_string WHERE StationID=?";
        let ins2=[req.query.StationID];
        db.query({sql:sql2,ins:ins2,callback:function(err,deleteResult){
            if(err){
                res.json({status:201,data:err,msg:'update err!'});
            }else{

                let sql="UPDATE t_cfg_station_modbus SET " +
                    "Gateway=?," +
                    "IPMask=?," +
                    "MacAddress=?," +
                    "ModbusAddress=?," +
                    "Port=?," +
                    "SmsCenterNumber=?," +
                    "SmsFlag=?," +
                    "StationName=?," +
                    "StringNum=?," +
                    "Telenumber1=?,Telenumber2=?,Telenumber3=? " +
                    "WHERE IPAddress=?";
                let ins=[
                    data.data.mbData.Gateway,
                    data.data.mbData.IPMask,
                    data.data.mbData.MacAddress,
                    data.data.mbData.ModbusAddress,
                    data.data.mbData.Port,data.data.mbData.SmsCenterNumber,
                    data.data.mbData.SmsFlag,data.data.mbData.StationName,
                    data.data.mbData.StringNum,data.data.mbData.Telenumber1,
                    data.data.mbData.Telenumber2,data.data.mbData.Telenumber3,
                    data.data.mbData.IPAddress];
                let num=0;
                db.query({sql,ins,callback:function(err,result1){
                    if(err){
                        if(num>=0){
                            num-=10;
                            res.json({status:201,data:err,msg:'insert into database t_cfg_station_modbus err!'});
                        }
                    }else{
                        num++;
                        if(num==2){
                            res.json({status:200,data:err,msg:'succ'});
                        }

                    }
                }});
                data.data.strData.forEach(function(string,key){
                    let ins=[];
                    let sql=`INSERT INTO t_cfg_device_string(
                        StationID,StringNo,StringName,CellNumber,CellType,
                        ModuleType,CellCapacity,RatedImpedance,MaxCellVol1,MinCellVol1,
                        MaxCellTemp,MinCellTemp,MaxCellRes,MinCellCap,MaxDeltaVol,
                        MaxResRate,MaxDischargeCur,MaxChargeCur,MinChargeCur,MaxFloatCur,
                        MaxTotalVol,MinTotalVol,MaxRipple,NormalSpan,ChargeSpan,
                        StopTotalVol,StopCellVol,StopTimeSpan,StopTemperature,JhCtrl,ResSpan,StopCurrent)
                        VALUES(${req.query.StationID},${string.StringNo},
                        '${string.StringName}',${string.CellNumber}, ${string.CellType},
                        ${string.ModuleType},${string.CellCapacity}, ${string.RatedImpedance},
                        ${string.MaxCellVol1},${string.MinCellVol1}, ${string.MaxCellTemp},
                        ${string.MinCellTemp},${string.MaxCellRes}, ${string.MinCellCap},
                        ${string.MaxDeltaVol},${string.MaxResRate}, ${string.MaxDischargeCur},
                        ${string.MaxChargeCur},${string.MinChargeCur}, ${string.MaxFloatCur},
                        ${string.MaxTotalVol},${string.MinTotalVol}, ${string.MaxRipple},
                        ${string.NormalSpan},${string.ChargeSpan}, ${string.StopTotalVol},
                        ${string.StopCellVol},${string.StopTimeSpan}, ${string.StopTemperature},
                        ${string.JhCtrl},${string.ResSpan},0
                        )`;
                    db.query({sql,callback: function (err,result2) {
                        if(err){
                            if(num>=0){
                                num-=10;
                                //console.log('constantManage--',err);
                                res.json({status:201,data:err,msg:'insert into database t_cfg_device_string err!'});
                            }
                        }else{
                            if(key==data.data.strData.length-1){
                                num++;
                                if(num==2){
                                    res.json({status:200,data:data,msg:'succ'});
                                }
                            }
                        }
                    }})
                })
            }
        }})
    }
};

exports.stringConstUpdate=async function(req,res,next){
    //let StopTemperature = 40;

    var data  = await settingsData.setCellData(
        req.body.IPAddress,req.body.StringNo,req.body);

    if(data.status==200){
        let obj=req.body;
        let sql="UPDATE t_cfg_device_string SET " +
            "StringName=?,CellNumber=?,CellType=?," +
            "ModuleType=?,CellCapacity=?,RatedImpedance=?, " +
            "BatCj=?,BatXh=?,BatFcVol=?, " +
            "BatJcVol=?,TyTime=?,RemarkInfo=?, " +
            "MaxCellVol1=?,MinCellVol1=?,MaxCellTemp=?, " +
            "MinCellTemp=?,MaxCellRes=?,MinCellCap=?, " +
            "MaxDeltaVol=?,MaxResRate=?,MaxDischargeCur=?, " +
            "MaxChargeCur=?,MinChargeCur=?,MaxFloatCur=?, " +
            "MaxTotalVol=?,MinTotalVol=?,MaxRipple=?, " +
            "NormalSpan=?,ChargeSpan=?,StopTotalVol=?, " +
            "StopCellVol=?,StopTimeSpan=?,StopTemperature=?, " +
            "StopCurrent=?," +
            "MaxVariVol=?,MaxVariRes=?, " +
            "JhCtrl=?,JhDstVol=?,ClCtrl=?, " +
            "ClMethod=?,ClFre=?,ClQd=? " +
            "WHERE StationID=? AND StringNo=?";
        obj.TyTime=comment.formatTime(new Date(obj.TyTime));
        let ins=[
            obj.StringName,obj.CellNumber,obj.CellType,
            obj.ModuleType,obj.CellCapacity,obj.RatedImpedance,
            obj.BatCj,obj.BatXh,obj.BatFcVol,
            obj.BatJcVol,obj.TyTime,obj.RemarkInfo,
            obj.MaxCellVol1,obj.MinCellVol1,obj.MaxCellTemp,
            obj.MinCellTemp,obj.MaxCellRes,obj.MinCellCap,
            obj.MaxDeltaVol,obj.MaxResRate,obj.MaxDischargeCur,
            obj.MaxChargeCur,obj.MinChargeCur,obj.MaxFloatCur,
            obj.MaxTotalVol,obj.MinTotalVol,obj.MaxRipple,
            obj.NormalSpan,obj.ChargeSpan,obj.StopTotalVol,
            obj.StopCellVol,obj.StopTimeSpan,obj.StopTemperature,
            obj.StopCurrent,
            obj.MaxVariVol,obj.MaxVariRes,
            obj.JhCtrl,obj.JhDstVol,obj.ClCtrl,
            obj.ClMethod,obj.ClFre,obj.ClQd,
            obj.StationID,obj.StringNo
        ];
        db.query({sql,ins,callback:function(err,result){
            if(err){
                res.json({status:201,data:err,msg:'database update failed!'});
            }else{
                res.json({status:200,data:'',msg:'succ'})
            }
        }})
    }
}
exports.modbusConstUpdate=async function(req,res,next){
    console.log('modbusConstUpdate')
    var data  = await setModbus.setModbus(req.body.IPAddress,req.body);
    if(data.status==200){
        let obj=req.body;
        let sql="UPDATE t_cfg_station_modbus SET " +
            "StationName=?,IPAddress=?,IPMask=?," +
            "Gateway=?,MacAddress=?,Port=?," +
            "SmsFlag=?,Telenumber1=?,Telenumber2=?," +
            "Telenumber3=?,SmsCenterNumber=?,ModbusAddress=?," +
            "DestIP=?,DestPort=?,DestDomain=?," +
            "StationType=? " +
            "WHERE StationID=?";
        obj.TyTime=comment.formatTime(new Date(obj.TyTime));
        let ins=[
            obj.StationName,obj.IPAddress,obj.IPMask,
            obj.Gateway,obj.MacAddress,obj.Port,
            obj.SmsFlag,obj.Telenumber1,obj.Telenumber2,
            obj.Telenumber3,obj.SmsCenterNumber,obj.ModbusAddress,
            obj.DestIP,obj.DestPort,obj.DestDomain,
            obj.StationType,obj.StationID
        ];
        db.query({sql,ins,callback:function(err,result){
            if(err){
                res.json({status:201,data:err,msg:'database update failed!'});
            }else{
                res.json({status:200,data:'',msg:'succ'})
            }
        }})
    }
}
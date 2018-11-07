/**
 * Created by Administrator on 2018/7/17 0017.
 */
var db=require('./db');
var comment=require('./comment')
var fileOption=require('./fileOption')
exports.getparameterlist=function (req, res, next) {
    let sql='select * from t_cfg_parameter';
    db.query({sql:sql,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.parameterListExport=function(req,res,next){
    let sql='select * from t_cfg_parameter';
    db.query({sql:sql,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            let conf ={};
            conf.cols=[
                {caption:"参数名称",type:'string',width:28.7109375},
                {caption:"参数值",type:'string',width:28.7109375},
            ];
            let list=[];
            result.forEach(function(user){
                list.push([user.ParaName,user.ParaValue])
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
exports.parameterUpdate=function (req, res, next) {
    if(!req.body.ParaName||!req.body.ParaValue||!req.body.oldName){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql='UPDATE t_cfg_parameter SET ParaName=?,ParaValue=? WHERE ParaName=?';
    let ins=[req.body.ParaName,req.body.ParaValue,req.body.oldName];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.parameterAdd=function (req, res, next) {
    if(!req.body.ParaName||!req.body.ParaValue){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql='INSERT INTO t_cfg_parameter(ParaName,ParaValue) VALUES(?,?)';
    let ins=[req.body.ParaName,req.body.ParaValue];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:data,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.parameterDelete=function (req, res, next) {
    if(!req.body.ParaName||!req.body.ParaValue){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql='DELETE FROM t_cfg_parameter WHERE ParaName=? AND ParaValue=?';
    let ins=[req.body.ParaName,req.body.ParaValue];
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
/**
 * Created by Administrator on 2018/10/12.
 */
var db=require('./db');
var comment=require('./comment');
exports.cmdList=function (req, res, next) {
    let sql='select * from t_name_command_com';
    db.query({sql:sql,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.cmdEdit=function (req, res, next) {
    let sql='update t_name_command_com set CmdNum=?,CmdName=?,' +
        'CmdType=?,CmdStatus=?,LogicDescribe=?,DischargeNum=?,DischargeOption=?,' +
        'ResetNum=?,ResetOption=? where CmdID=?';
    let ins=[
        req.body.CmdNum,req.body.CmdName,req.body.CmdType,
        req.body.CmdStatus,req.body.LogicDescribe,req.body.DischargeNum,req.body.DischargeOption,
        req.body.ResetNum,req.body.ResetOption,req.body.CmdID
    ]
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.cmdAdd=function (req, res, next) {
    let sql='insert into t_name_command_com (CmdNum,CmdName,CmdType,CmdStatus,LogicDescribe,DischargeNum,DischargeOption,ResetNum,ResetOption) values (?,?,?,?,?,?,?,?,?)';
    //'set CmdNum=?,CmdName=?,' +
    //'CmdType=?,CmdStatus=?,LogicDescribe=?,DischargeNum=?,ResetNum=? where CmdID=?';
    let ins=[
        req.body.CmdNum,req.body.CmdName,req.body.CmdType,
        req.body.CmdStatus,req.body.LogicDescribe,req.body.DischargeNum,
        req.body.DischargeOption,req.body.ResetNum,req.body.ResetOption
    ]
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
exports.cmdDelete=function (req, res, next) {
    let sql='DELETE FROM t_name_command_com WHERE CmdID=?';
    //'set CmdNum=?,CmdName=?,' +
    //'CmdType=?,CmdStatus=?,LogicDescribe=?,DischargeNum=?,ResetNum=? where CmdID=?';
    let ins=[req.body.CmdID]
    db.query({sql,ins,callback:function(err,data){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};
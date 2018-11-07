/**
 * Created by Administrator on 2018/7/17 0017.
 */
var db=require('./db');
var comment=require('./comment')
var fileOption=require('./fileOption')
//var path=require('path');
exports.getOptLog= function (req,res,next) {
    if(!req.body.startTime||!req.body.endTime){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    //SQL_CALC_FOUND_ROWS
    let sql=`SELECT * FROM t_cfg_log WHERE time>? AND time<? AND event LIKE ? AND name LIKE ? LIMIT ?,?`;
    let pageNum=req.body.pageNum||1;
    let row=req.body.row||10;
    let ins=[req.body.startTime,req.body.endTime,"%"+(req.body.content||'')+"%","%"+(req.body.username||'')+"%",(pageNum-1)*row,row*1];
    db.query({sql, ins,callback:function(err,result1){
        if(err){
            console.log(23,err);
            res.json({status:202,data:err,msg:'数据库操作失败！'});
        }else{
            result1.forEach(function(item){
                item.time=comment.formatTime(item.time)
            })
            db.query({sql:"SELECT COUNT(*) FROM t_cfg_log WHERE time>? AND time<? AND event LIKE ? AND name LIKE ?",ins,callback:function(err,result2){
                if(err){
                    console.log(19,err)
                }else{
                    res.json({status:200,data:{total:result2[0]['COUNT(*)'],data:result1,pageNum:pageNum*1,row:row*1,pageCount:Math.ceil(result2[0]['COUNT(*)']/row)},msg:'succ'});
                }
            }})
        }
    }});
    //path.parse()
};
exports.operatelogExport=function(req,res,next){
    let sql='SELECT * FROM t_cfg_log WHERE time>? AND time<? AND event LIKE ? AND name LIKE ?';
    let ins=[req.body.startTime,req.body.endTime,"%"+(req.body.content||'')+"%","%"+(req.body.username||'')+"%"];
    db.query({sql,ins,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            let conf ={};
            conf.cols=[
                {caption:"时间",type:'string',width:28.7109375},
                {caption:"操作记录",type:'string',width:28.7109375},
                {caption:"用户名",type:'string',width:28.7109375}
            ];
            let list=[];

            result.forEach(function(log){
                let time=comment.formatTime(log.time);
                list.push([time,log.event,log.name])
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



exports.getCtrlLog= function (req,res,next) {
    if(!req.body.startTime||!req.body.endTime){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }

    let sql=`SELECT * FROM t_info_operate WHERE OperateTime>? AND OperateTime<? AND OperateInfo LIKE ? AND UserName LIKE ? LIMIT ?,?`;
    let pageNum=req.body.pageNum||1;
    let row=req.body.row||10;
    let ins=[req.body.startTime,req.body.endTime,"%"+(req.body.content||'')+"%","%"+(req.body.username||'')+"%",(pageNum-1)*row,row*1];

    db.query({sql, ins,callback:function(err,result1){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            result1.forEach(function(item){
                item.OperateTime=comment.formatTime(item.OperateTime)
            })
            db.query({sql:"SELECT COUNT(*) FROM t_info_operate WHERE OperateTime>? AND OperateTime<? AND OperateInfo LIKE ? AND UserName LIKE ?",ins,callback:function(err,result2){
                if(err){
                    console.log(19,err)
                }else{
                    res.json({status:200,data:{total:result2[0]['COUNT(*)'],data:result1,pageNum:pageNum*1,row:row*1,pageCount:Math.ceil(result2[0]['COUNT(*)']/row)},msg:'succ'});
                }
            }})
        }
    }});
}
exports.ctrllogExport=function(req,res,next){
    let sql='SELECT * FROM t_info_operate WHERE OperateTime>? AND OperateTime<? AND OperateInfo LIKE ? AND UserName LIKE ?';
    let ins=[req.body.startTime,req.body.endTime,"%"+(req.body.content||'')+"%","%"+(req.body.username||'')+"%"];
    db.query({sql,ins,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            let conf ={};
            conf.cols=[
                {caption:"时间",type:'string',width:28.7109375},
                {caption:"操作记录",type:'string',width:28.7109375},
                {caption:"用户名",type:'string',width:28.7109375}
            ];
            let list=[];
            result.forEach(function(log){
                let time=comment.formatTime(log.OperateTime);
                list.push([time,log.OperateInfo,log.UserName])
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
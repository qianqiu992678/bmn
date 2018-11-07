/**
 * Created by Administrator on 2018/7/16 0016.
 */
var db=require('./db');
var comment=require('./comment');
var fileOption=require('./fileOption');
exports.getUserList=function (req, res, next) {

    let sql='select * from t_cfg_user';
    db.query({sql:sql,callback:function(err,data){
        if(err){
            res.json({status:201,data:data,msg:'数据库操作失败！'});
        }else{
            res.json({status:200,data:data,msg:'succ'});
        }
    }});
};

exports.userListExport=function(req,res,next){
    let sql='select * from t_cfg_user';
    db.query({sql:sql,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            let conf ={};
            conf.cols=[
                {caption:"用户名",type:'string',width:28.7109375},
                {caption:"权限",type:'number',width:28.7109375},
                {caption:"手机号码",type:'string',width:28.7109375},
                {caption:"是否接受报警短信",type:'number',width:28.7109375},
                {caption:"密码",type:'string',width:28.7109375},
            ];
            let list=[];

            result.forEach(function(user){
                console.log(36,user.UserLevel);
                let userLevel=user.UserLevel;
                list.push([
                    user.UserName,userLevel,
                    user.PhoneNumber,user.SmsFlag,
                    user.Password]
                )
            });
            console.log(list)
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

exports.insertUser= function (req,res,next) {
    if(!req.body.UserName||!req.body.Password||!req.body.UserLevel||!req.body.PhoneNumber||!req.body.SmsFlag){
        res.json({status:201,data:'',msg:'参数错误'})
        return;
    }
    let sql="SELECT count(*) FROM t_cfg_user WHERE UserName=?";
    let ins=[req.body.UserName];
    db.query({sql,ins,callback:function(err,result){
        if(err){
            console.log(27,err)
        }else{
            if(!result[0]['count(*)']){
                let ins=[req.body.UserName,req.body.Password,req.body.UserLevel,req.body.PhoneNumber,req.body.SmsFlag];
                let sql ="INSERT INTO t_cfg_user(UserName,Password,UserLevel,PhoneNumber,SmsFlag) VALUES(?,?,?,?,?)";
                db.query({sql, ins,callback:function(err,data){
                    if(err){
                        console.log(34,err)
                        res.json({status:201,data:data,msg:'数据格式不对，导致数据库操作失败！'});
                    }else{
                        res.json({status:200,data:data,msg:'succ'});
                    }
                }});
            }else{
                res.json({status:202,data:'',msg:'用户名已存在！'})
            }

        }
    }})

};
exports.userDelete= function (req,res,next) {
    if(!req.body.id){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }
    let sql="DELETE FROM t_cfg_user WHERE id=?";
    let ins=[req.body.id]
    db.query({sql, ins,callback:function(err,data){
        if(err){

            res.json({status:201,data:data,msg:'数据库操作失败！'});
        }else{
            if(data.affectedRows==0){
                res.json({status:201,data:data,msg:'删除失败，用户不存在！'});
            }else{
                res.json({status:200,data:data,msg:'succ'});
            }

        }
    }});
}
exports.userEdit= function (req,res,next) {
    if(!req.body.UserName||!req.body.Password||!req.body.UserLevel||!req.body.PhoneNumber||!req.body.SmsFlag){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }

    let sql="SELECT count(*) FROM t_cfg_user WHERE UserName=? AND id!=?";
    let ins=[req.body.UserName,req.body.id];
    db.query({sql,ins,callback:function(err,result){
        if(err){

        }else{
            if(!result[0]['count(*)']){
                let sql="UPDATE t_cfg_user SET UserName=?,Password=?,UserLevel=?,PhoneNumber=?,SmsFlag=? WHERE id=?";
                let ins=[req.body.UserName,
                    req.body.Password,
                    req.body.UserLevel,
                    req.body.PhoneNumber,
                    req.body.SmsFlag,
                    req.body.id];
                db.query({sql, ins,callback:function(err,data){
                    if(err){
                        res.json({status:201,data:data,msg:'数据库操作失败！'});
                    }else{
                        res.json({status:200,data:data,msg:'succ'});
                    }
                }});
            }else{
                res.json({status:202,data:'',msg:'用户名已存在！'})
            }
        }
    }})


}
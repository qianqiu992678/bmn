/**
 * Created by Administrator on 2018/7/30 0030.
 */
var db=require('../db');
var redis=require('../redis');
var comment=require('../comment');
exports.login=function(req,res,next){
    if(!req.body.username||!req.body.password){
        res.json({status:201,data:'',msg:'参数错误！'});
        return;
    }

    let sql="SELECT COUNT(*),UserName FROM t_cfg_user WHERE UserName=? AND Password=?";
    let ins=[req.body.username,req.body.password];
    db.query({sql,ins,callback:function(err,result){
        if(err){
            res.json({status:201,data:err,msg:'数据库操作失败！'});
        }else{
            let token=comment.randomString(32);
            result[0].token=token;
            if(result[0]['COUNT(*)']==1){
                redis.set(token,JSON.stringify(result[0]),60000);
                res.json({status:200,data:result[0],msg:'succ'});
            }else{
                res.json({status:201,data:'',msg:'username or password err!'});
            }
        }
    }})
};
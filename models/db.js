/**
 * Created by Administrator on 2018/7/16 0016.
 */
var mysql = require('mysql');
var pool=mysql.createPool({
    connectionLimit : 20,
    host:'localhost',
    user:'root',
    //password:'QWEqwe123@'
    //host:'192.168.1.207',
    //user:'root',
    password:'111'
});


exports.query=function({sql, ins, callback}){
    return new Promise((resolve,reject)=>{
        pool.getConnection(function(err,connection){
            connection.query('use battery');
            ins=ins||[];
            connection.query(sql, ins ,function (err,rows) {
                if(err){
                    //throw err;
                    if(typeof callback=='function'){
                        callback(err,rows);

                    }else{
                        resolve({err:err,rows:rows});
                    }
                }else{
                    if(typeof callback=='function'){
                        callback(null,rows);
                        resolve({err:err,rows:rows});
                    }else{
                        resolve({err:err,rows:rows});
                    }
                }
            });
            connection.release();
        })
    })

};

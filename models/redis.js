/**
 * Created by Administrator on 2018/7/31 0031.
 */
// redis.js
const redis = require('redis');
const config=require("./redisConfig");
const redis_timeout = 6000;
const RDS_PORT = config.redis.port,//
    RDS_HOST = config.redis.host,	//IP
    RDS_OPTS = {auth_pass: config.redis.pwd};//
var client;
exports.index = () => {
    if(client) client.quit();
    client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);
    client.on('connect',function(){});
}

exports.set = (key, value, time) => new Promise((resolve, reject) => {
    let timeID = setTimeout(()=>{
        reject("redis���ӳ�ʱ")
    }, redis_timeout);
    client.set(key,value,(err,response)=>{
        clearTimeout(timeID);
        if (err) reject(err);
        else {
            client.expire(key, time);
            resolve();
        }
    });
})
exports.get = (key) => new Promise((resolve, reject) => {
    let timeID = setTimeout(()=>{
        reject("redis���ӳ�ʱ")
    }, redis_timeout);
    client.get(key,(err, reply)=>{
        clearTimeout(timeID);
        err ? reject(err) : resolve(reply);
    });
})

this.index();
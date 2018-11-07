

// redis.js
const redis = require('redis');
const config=require("../conf/config.js");
const redis_timeout = 6000;
const RDS_PORT = config.redis.port,		//端口号
RDS_HOST = config.redis.host,	//服务器IP
RDS_OPTS = {auth_pass: config.redis.pwd};			//设置项
var client;


exports.index = () => {
	if(client) client.quit();
	client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);
	client.on('connect',function(){});
}

exports.set = (key, value, time) => new Promise((resolve, reject) => {
	let timeID = setTimeout(()=>{
		reject("redis连接超时")
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
		reject("redis连接超时")
	}, redis_timeout);
	client.get(key,(err, reply)=>{
		clearTimeout(timeID);
		err ? reject(err) : resolve(reply);
	});
})

this.index();
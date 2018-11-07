

// mysql.js
const net = require('net');
const config=require("../conf/config.js");
const fs = require("fs");
const modbus = require("../conf/modbus.js")
const mysql = require("../conf/mysql.js")
const access = require("../conf/access.js")
const comment = require("../conf/comment.js")

var socket; 
var firest = true;
var socket_timeID;
/*-----------------------------------------------------------------------------------------------------------------------

队列入口send方法接收5个参数 {stat, data, func, callback, jump}
jump 为true 表示该事件需要插队 false或者为空表示不插队安装顺序进入事件队列

this.queue为事件队列
队列里内容为对象
格式为： {stat, data, func, callback}
stat 为事件状态，值为"start","running","end","one"
start 表示该事件为组合事件，且为开始状态
running 表示该事件为正在运行状态
end 表示为该事件的结束状态
one 表示只执行一次的事件
一个事件执行完成后，查看该事件的状态，如果为start，或running，则该事件保留，事件队列处于等待状态，不执行下一个队列中的事件。
如果是end，则删除该事件，并执行下一个队列中的事件
如果此事件的状态为one，删除该事件，并执行下一个队列中的事件
当有事件来后，查看该事件的stat：
	如果为start,则进入队列进行排队；
	如果为running，则把该事件覆盖到事件队列中第一个事件状态为start或者running的事件。并执行该事件。如果第一个事件状态不是start或者running返回错误，该事件不执行。
	如果为end,则把该事件覆盖到事件队列中第一个事件状态为start或者running的事件，并执行该事件。如果第一个事件状态不是start或者running返回错误，该事件不执行。
	如果为one，则进入队列进行排队
异常：
	队列为空时，不接收状态为running和end的事件。

当事件超时后，删除该事件

增加插队功能 进入队列是多一个jump字段

------------------------------------------------------------------------------------------------------------------------------*/
//const callback;

exports.index = () => {
	this.islocked = true;
	//console.log(3333);
	//console.log(this);
	//console.log(client)
	if(firest) firest = false;
	else socket.destroy(1);
	socket = new net.Socket({
	    readable:true,
	    writable:true,
	    allowHalfOpen:true
	});
	socket.connect({
	    host: config.socket.host,
	    port: config.socket.port
	},() => {
	    console.log(" server connected socket");

    	access.log(' server connected socket');
	    config.socketIn = true;
	    clearInterval(socket_timeID);
		this.islocked = false;
		this.queue = [];
		this.now = 0;
		this.timeoutlist = [];
		this.timeout;
	    socket.on("error", this.socket_error);
	    socket.on("close", this.socket_close);
	    socket.on("end", this.socket_close);
	    socket.on("data", this.socket_data);

	    config.websockets.forEach(ws =>{
	        if(ws.readyState == ws.OPEN) 
	            ws.sendText(JSON.stringify({act:"restart", data:1}));
	    });
	    modbus.login(config.socket_login.user, config.socket_login.pwd);
	    comment.getTable();
	});
}

exports.socket_data = (reback) => {
	if(config.socket_log) access.log("back: ", reback);
	if(!this.queue.length) return;
    let error = false;
	let recv_len = reback.length;
	//检查返回报文
	//判断位数不小于6
	if( recv_len < 6 ) 
	{
		error = true;
		console.log("wrong buf length!!!!!!");
    	access.log(this.queue[0].func + 'wrong buf length!!!!!!');
	}
	//判断字节长度
	let recv_codeNum = reback.readUInt8(5);
	if(recv_codeNum != recv_len - 6)
	{
		error = true;
		console.log("wrong reback buf codeNum!!!!!!");
    	access.log(this.queue[0].func + 'wrong reback buf codeNum!!!!!!');
	}
	//判断Modbus与功能码
	if(this.queue[0].data.readUInt8(6) != reback.readUInt8(6) || this.queue[0].data.readUInt8(7) != reback.readUInt8(7)){

		console.log("reback"+this.queue[0].func,reback)
		error = true;
		console.log("Reback buf Modbus Address Or Func Code Wrong!!!!");
    	access.log(this.queue[0].func + "Reback buf Modbus Address Or Func Code Wrong!!!!");
	}
	this._end(error, reback);
	//发生错误，删除事件
}

exports.socket_error = (err) => {
	if(err == 1) return;
    console.log("socket error") 
    access.log("socket error");
    //socket连接失败，每隔一段事件重新连接
    this.locked();
    this.clear();
    config.socketIn = false;
    config.websockets.forEach(ws =>{
        if(ws.readyState == ws.OPEN) 
            ws.sendText(JSON.stringify({act:"error", msg: "录波器连接失败"}));
    })
    clearInterval(socket_timeID);
    socket_timeID = setInterval(()=>{
    	this.index();
    }, 5000);
}
exports.socket_close = (err) => {
	if(err == true) return;
	console.log("close:",err)
    config.socketIn = false;
    console.log("socket closed") 
    access.log("socket closed");
    this.locked();
    this.clear();
    //socket连接关闭，每隔一段事件重新连接
    config.websockets.forEach(ws =>{
        if(ws.readyState == ws.OPEN) 
            ws.sendText(JSON.stringify({act:"error", msg: "录波器连接失败"}));
    })
    clearInterval(socket_timeID);
    socket_timeID = setInterval(()=>{
    	this.index();
    }, 5000);
}


exports.send = async (stat, data, func, callback, jump) => {
	if(this.islocked) return;
	if(!this.queue) return;

	//处理队列
	//errorLogStream.write(JSON.stringify(this.queue));
	jump = jump || false;
	if(jump && stat == "start" && stat == "one" && this.queue.length){//当该事件为插队事件的方法
		//console.log("jump", stat);
		this.queue.splice(1, 0, {stat, data, func, callback, count_id: this.getnow()});
	}
	else if(!this.queue.length && stat != "running" && stat != "end" ) {
		//console.log("0", stat);
		this.queue.push({stat, data, func, callback, count_id: this.getnow()});
		return this._send(data, func, callback);
	}
	else if (this.queue.length > 0 && !jump) {
		if(stat == "start" || stat == "one") {
			this.queue.push({stat, data, func, callback, count_id: this.getnow()});
		}
		else if(stat == "running" || stat == "end") {
			this.queue[0] = {stat, data, func, callback, count_id: this.getnow()};
			return this._send(data, func, callback);
		}
		else callback(0);
	}
	else callback(0);
}
exports._send = (data, func, callback) => {
	//上行报文检验----------------------------------------------------------------//
	let send_len = data.length;
	if( send_len < 6 ) 
	{
		error = "wrong buf length!!!!!!"
    	access.log(func + "wrong buf length!!!!!!");
		console.log(error);
		return this._end(true);
	}
	let send_codeNum = data.readUInt8(5);
	if(send_codeNum != send_len - 6)
	{
		error = "wrong send buf codeNum!!!!!!"
    	access.log(func + "wrong send buf codeNum!!!!!!");
		console.log(error);
		console.log(error);
	    return this._end(true);
	}
	//----------------------------------------------------------------------------//

	//let now = updated_at = Date.now() / 1000 |0;
	this.timeout = setTimeout(this._timeout, config.socketTimeout);
	//console.log("send "+func, data);
	if(config.socket_log) access.log("send "+func+": ", data);
	socket.write(data);
}

exports._timeout = async () => {
	console.log("timeout");
    access.log("timeout");
	let cb = this.queue[0].callback;
	this.insertCount(this.queue[0].count_id);
	this.queue.splice(0,1);
	if(this.queue.length) this._send(this.queue[0].data, this.queue[0].func, this.queue[0].callback);
	return cb(0);
}

exports._end = (err, reback) =>  {
	clearTimeout(this.timeout);
	if(!this.queue.length) return;
	if(err) {
		let cb = this.queue[0].callback;
    	this.queue.splice(0,1);
    	if(this.queue.length) this._send(this.queue[0].data, this.queue[0].func, this.queue[0].callback);
		return cb(0);
	}
    //检查事件状态
    if(this.queue[0].stat == "start" || this.queue[0].stat == "running"){
    	return this.queue[0].callback(reback.slice(8, reback.length));
    }
    else if(this.queue[0].stat == "end" || this.queue[0].stat == "one"){
		let cb = this.queue[0].callback;
    	this.queue.splice(0,1);
    	if(this.queue.length){	//判断队列里还有事件
	    	this._send(this.queue[0].data, this.queue[0].func, this.queue[0].callback);
    	}
    	return cb(reback.slice(8, reback.length));
    }
}
exports.check = () =>  {
	if(this.queue.length) return false;
	return true;
}
exports.locked = () =>  {
	this.islocked = true;
}

exports.unlocked = () =>  {
	this.islocked = false;
}
exports.clear = () =>  {
	clearTimeout(this.timeout);
	this.locked();
	this.queue = [];
}
exports.getnow = () =>  {
	this.now++;
	if(this.now > 1000)
	this.now = 0;
	return this.now;
}
exports.insertCount = (id) => {
	let len = this.timeoutlist.length;
	if(!len){
		this.timeoutlist.push(id);
	}
	else {
		if(this.timeoutlist[len-1] == 1000 && id == 0){
			this.timeoutlist.push(id);
		}
		else if(id - this.timeoutlist[len-1] == 1) {
			this.timeoutlist.push(id);
		}
		else this.timeoutlist = [];
	}
	if(this.timeoutlist.length >= config.socketTimeoutCount){
		this.timeoutlist = [];
		this.clear();
		this.index();
	}
}

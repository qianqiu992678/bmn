/**
 * Created by Administrator on 2018-4-24.
 */
//模块----------------------------------------------------
var valable=require('./valable')
var net = require('net');
var config = require('./config.js');
var Socket = function(){
    this.socket= new net.Socket({
        readable:true,
        writable:true,
        allowHalfOpen:true
    });
    this.cb = null;
    this.timer = null;
    this.lock = false;
};
Socket.prototype.index = function(item){
    let $this = this ;
    try{
        $this.socket.connect({port:502,host:item.ip},()=>{
            item.destroy = $this.socket.destroyed;
            item.socket = $this;
            console.log('success',item.ip,item.destroy);

        });
        $this.socket.on("data",(reback)=>{
            if($this.cb){
                $this.cb(reback)
            }
        });
        $this.socket.on("error",()=>{
            //console.log("error  start",item)
            item.destroy = $this.socket.destroyed;
            $this.socket.destroy();
        });
        $this.socket.on("close",()=>{
            //console.log('close  start');
            item.destroy = $this.socket.destroyed;
            $this.socket.destroy();
        });
    }
    catch(err){
        //console.log(err);
    }
}
Socket.prototype.send = function(data,cb){
    this.cb = cb;
    let $this = this;

    this.timer = setTimeout(()=>{
        $this.socket.write(data);
    },31000)

    if(!this.lock){
        this.socket.write(data,()=>{
            $this.lock = true;

            //console.log('send:',data)
        });
    }else{

    }

}

Socket.prototype.writeBack = function(data){
    let $this = this;
    return new Promise((resolve,reject)=> {
        $this.send(data,(reback)=>{
            //console.log('recv:',reback)
            if($this.timer){
                clearTimeout($this.timer);
                $this.timer = null;
            }
            $this.lock = false;
            resolve(reback)
        })
    })

}
//await xxx.writeBack(Buffer.from(...));






Socket.prototype.onError = function(reback){
    console.log(reback)
};

module .exports = Socket;
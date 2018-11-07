/**
 * Created by Administrator on 2018/7/18 0018.
 */
var ws=require('nodejs-websocket');
var nowData=require('./nowData');
var server;
var wsconn;

var timer=null;
exports.getCurrentData=async function(StationIP,StringNo,res){
    if(timer){
        clearInterval(timer);
        timer=null;
        timer=setInterval(async function(){
            var data=await nowData.getData(StationIP,StringNo);
            let dateTimeArr=data.headData.time.split(' ');
            let date=dateTimeArr[0].split('-');
            let time=dateTimeArr[1].split(':');
            time.forEach(function(item){
                if(item.length==1){
                    item="0"+item
                }
            })
            date.forEach(function(item,key){
                if(key==0){
                    item="20"+item;
                }else{
                    if(item.length==1){
                        item="0"+item;
                    }
                }
            })
            data.headData.time=date.join('-')+' '+time.join(':');
            wsconn.send(JSON.stringify({data:data,act:'currentdata'}))
        },5000);
    }else{
        timer=setInterval(async function(){
            var data=await nowData.getData(StationIP,StringNo);
            let dateTimeArr=data.headData.time.split(' ');
            let date=dateTimeArr[0].split('-');
            let time=dateTimeArr[1].split(':');
            for(let i=0;i<time.length;i++){
                if(time[i].length==1){
                    time[i]='0'+time[i];
                }
            }
            for(let i=0;i<date.length;i++){
                if(i==0){
                    date[i]="20"+date[i];
                }else{
                    if(date[i].length==1){
                        date[i]="0"+date[i];
                    }
                }
            }
            data.headData.time=date.join('-')+' '+time.join(':');
            wsconn.send(JSON.stringify({data:data,act:'currentdata'}))
        },5000);
    }
    res.json({status:200,msg:'',data:''})
};
if(!server){
    server = ws.createServer(function(conn){
        wsconn=conn;
        conn.on("text",function(str){});
        conn.on("close",function(code,reason){
            console.log("connection closed")
        });
        conn.on("error",function(err){

        });
    }).listen(3001);
}
exports.wsSend=function(obj){
    wsconn.send(JSON.stringify(obj))
};


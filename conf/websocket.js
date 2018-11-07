const net = require('net');
const uuid = require('node-uuid');
const vr = require("validator");
const {mysql, fs, comment, modbus, socket}=require("../conf");
const cookie = require('cookie-parser');
const https = require('https');
const config=require("../conf/config");
const path = require('path');  
const mineType = require('mime-types');  
const iconv = require('iconv-lite');
const ws = require("nodejs-websocket");
const getBuf = require("../conf/getBuf");
var get_operate_time = new Date().toLocaleString("zh");;


//1.1登录
exports.index = async () => {
    this.SID = setInterval(function(){
        if(!config.socketIn) return;
        getSOE(1);
        getSOE(2);
        getNow();
        getTime();
    }, config.refresh);
    setInterval(function(){
        get_operate();
    }, config.get_operate);
};
//获取告警启动SOE
async function getSOE(type){
    let alarm_SOE = await modbus.get_SOE(type);
    //console.log(alarm_SOE)
    if(alarm_SOE == 2) return;
    if(alarm_SOE == 0) return;
    let act = "SOE";
    if(type == 2)  act = "lb";
    config.websockets.forEach(ws =>{
        if(ws.readyState == ws.OPEN) 
            ws.sendText(JSON.stringify({act, data: alarm_SOE}));
    })
}
//获取当前采集数据
async function getNow(){
    //if(!config.table) await comment.getTable();
    let table = config.table;
    //let filePath = "./upload/temp/Description.TXT";
    //let table = await fs.readFile(filePath);
    //table = JSON.parse(table);
    if(!table) return;
    let { YaoXin, YaoCe, YaoMai } = table;
    let YaoXin_reback = await modbus.get_Yao(YaoXin, 1);
    if(YaoXin_reback == 0) {

        config.websockets.forEach(ws =>{
            if(ws.readyState == ws.OPEN) 
                ws.sendText(JSON.stringify({act:"error", msg: "您尚未登录，请您登录"}));
        })
        return;
    }
    //let buf = Buffer.from([0xd0, 0x5a, 0x3f, 0xaf]);
    let YaoCe_reback = await modbus.get_Yao(YaoCe, 2);
    if(YaoCe_reback == 0) return;
    //console.log(YaoCe_reback);
    
    let YaoMai_reback = await modbus.get_Yao(YaoMai, 3);
    if(YaoMai_reback == 0) return;
    //console.log(YaoMai_reback);
    let resend = {
        YaoXin: YaoXin_reback,
        YaoCe: YaoCe_reback,
        YaoMai: YaoMai_reback
    }
    //console.log(resend)
    config.websockets.forEach(ws =>{
        if(ws.readyState == ws.OPEN) 
            ws.sendText(JSON.stringify({act: "table", data: resend}));
    })
}
//获取当前系统时间
async function getTime(){
    let time = await modbus.get_time();
    if(time == 0) return ;
    config.websockets.forEach(ws =>{
        if(ws.readyState == ws.OPEN) 
            ws.sendText(JSON.stringify({act: "time", time: time}));
    })

}
//获取操作记录
async function get_operate(){
    let start_time = get_operate_time;
    let end_time = new Date().toLocaleString("zh");
    let sql = "SELECT * FROM t_info_operate WHERE OperateTime >= ? AND OperateTime <= ?";
    let list = await mysql.query(sql, [start_time, end_time]);
    if(!list.length) return;
    get_operate_time = end_time;
    config.websockets.forEach(ws =>{
        if(ws.readyState == ws.OPEN)
            ws.sendText(JSON.stringify({act: "operate", data: list}));
    })
}

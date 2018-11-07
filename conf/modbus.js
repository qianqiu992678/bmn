
const https = require('https');
const iconv = require("iconv-lite");
const config = require("../conf/config");
const getBuf = require("../conf/getBuf");
const fs = require("../conf/fs");
const comment = require("../conf/comment");
const getQuery = require("../conf/getQuery");
const getFiles = require("../conf/getFiles");
const writeFiles = require("../conf/writeFiles");
const getYao = require("../conf/getYao");
const socket = require("../conf/socket");

exports.login = async (username, pwd) => {
  username = Buffer.from(username);
  pwd = Buffer.from(pwd);
  let buf = Buffer.alloc(40);
  username.copy(buf, 0);
  pwd.copy(buf, 20);

  let {modbus_login} = config;
  modbus_login.info = buf;

  let gb = new getBuf(modbus_login);
  let buf2 = gb.getTogether();
  let reback = await getQuery.getQuery(buf2, "login");
  if(reback == 0) return 0;
  if(reback.length == 1){
    if(reback.readUInt8(0) == 5 ) return 5 ; //5为无此用户
    if(reback.readUInt8(0) == 4 ) return 4; //4为密码错误
  }
  else {
    if(reback.length < 4) return 0;
    let readNum = reback.slice(2,4);
    if(readNum.readUInt16BE(0) != buf2.readUInt16BE(10)) return 0;
    return 1;

  }
}
exports.get_table = async () => {
  let gb = new getBuf(config.modbus_table);
  let buf2 = gb.getTogether();
  let reback = await new getFiles(buf2, "get_table");
  if(reback == 0) return 0;
  return reback;
}

exports.record = async () => {
  let gb = new getBuf(config.modbus_record);
  let buf2 = gb.getTogether();
  let reback = await getQuery.getQuery(buf2, "record");
  if(reback == 0) return 0;
  if(reback.length == 1 || reback.length < 4) return 0;

  let readNum = reback.slice(2,4);
  if(readNum.readUInt16BE(0) != buf2.readUInt16BE(10)) return 0;
  return 1;
}
exports.get_dz = async () => {
  let gb = new getBuf(config.modbus_get_dz);
  let buf2 = gb.getTogether();
  //setTimeout(async ()=>{
    //let reback = await getFiles.getFiles(buf2, "get_dz");

  let reback = await new getFiles(buf2, "get_dz");
    //console.log(reback)
    if(reback == 0) return 0;
    return reback;
  //},1000)
}
exports.updata_dz = async (info) => {
  let gb = new getBuf(config.modbus_update_dz);
  let buf = gb.getTogether();
  let reback = await new writeFiles(buf, JSON.stringify(info), "updata_dz");
  if(reback == 0) return 0;

  let gb2 = new getBuf(config.modbus_update_dz_stat);
  let buf2 = gb2.getTogether();
  let reback2 = await getQuery.getQuery(buf2, "updata_dz");
  if(reback2 == 0) return 0;
  if(reback2.length == 1 || reback2.length < 4) return 0;

  let readNum = reback2.slice(2,4);
  if(readNum.readUInt16BE(0) != buf2.readUInt16BE(10)) return 0;

  return 1;
}
exports.get_alarm = async (start_time, end_time) => {
  start_time = comment.DateToBuf(start_time);
  end_time = comment.DateToBuf(end_time);
  //写入查询日期
  
  let buf = Buffer.concat([start_time, end_time], 24);
  let {modbus_write_alarm_time} = config;
  modbus_write_alarm_time.info = buf;
  let gb = new getBuf(modbus_write_alarm_time);
  let buf2 = gb.getTogether();
  let reback = await getQuery.getQuery(buf2, "get_alarm_writeDate");
  if(reback == 0) return 0;
  if(reback.length == 1 || reback.length < 4) return 0;
  let readNum = reback.slice(2,4);
  if(readNum.readUInt16BE(0) != buf2.readUInt16BE(10)) return 0;

  //获取文件
  let gb2 = new getBuf(config.modbus_get_alarm_history);
  let buf3 = gb2.getTogether();
  //let reback2 = await getFiles.getFiles(buf3, "get_alarm_getfile");
  let reback2 = await new getFiles(buf3, "get_alarm_getfile");

  if(reback2 == 0) return 0;

  return reback2;
}
exports.get_record = async (start_time, end_time) => {
  start_time = comment.DateToBuf(start_time);
  end_time = comment.DateToBuf(end_time);
  //写入查询日期
  
  let buf = Buffer.concat([start_time, end_time], 24);
  let {modbus_write_record_time} = config;
  modbus_write_record_time.info = buf;
  let gb = new getBuf(modbus_write_record_time);
  let buf2 = gb.getTogether();
  let reback = await getQuery.getQuery(buf2, "get_record_writeDate");
  if(reback == 0) return 0;
  if(reback.length == 1 || reback.length < 4) return 0;
  let readNum = reback.slice(2,4);
  if(readNum.readUInt16BE(0) != buf2.readUInt16BE(10)) return 0;

  //获取文件
  let gb2 = new getBuf(config.modbus_get_record_history);
  let buf3 = gb2.getTogether();
  let reback2 = await new getFiles(buf3, "get_record_getfile");

  if(reback2 == 0) return 0;
  //console.log(reback2)
  return reback2;
}
exports.get_ce_now = async () => {
  let gb = new getBuf(config.modbus_get_ce_now);
  let buf2 = gb.getTogether();
  //console.log(buf2)
  let reback = await new getFiles(buf2, "get_ce_now");
  if(reback == 0) return 0;
  return reback;
}
exports.get_zl_history = async (start_time, end_time, GroupID) => {
  start_time = comment.DateToBuf(start_time);
  end_time = comment.DateToBuf(end_time);
  //写入查询日期
  
  let buf = Buffer.concat([start_time, end_time], 26);
  buf.writeInt16BE(GroupID, 24);
  let {modbus_get_zl_time} = config;
  modbus_get_zl_time.info = buf;
  let gb = new getBuf(modbus_get_zl_time);
  let buf2 = gb.getTogether();
  let reback = await getQuery.getQuery(buf2, "get_zl_history_writeDate");
  if(reback == 0) return 0;
  if(reback.length == 1 || reback.length < 4) return 0;
  let readNum = reback.slice(2,4);
  if(readNum.readUInt16BE(0) != buf2.readUInt16BE(10)) return 0;

  //获取文件
  let gb2 = new getBuf(config.modbus_get_zl_history);
  let buf3 = gb2.getTogether();
  let reback2 = await new getFiles(buf3, "get_zl_history_getfile");
  if(reback2 == 0) return 0;

  return reback2;
}

exports.get_Yao = async (list, type) => {
  let reback = await new getYao(list, type, "get_Yao");
  if(reback == 0) return 0;
  return reback;
}
exports.get_time = async () => {
  let gb = new getBuf(config.modbus_time);
  let buf = gb.getTogether();
  let reback = await getQuery.getQuery(buf, "get_time");
  if(reback == 0) return 0;
  //console.log(reback);
  if(reback.length == 1 || reback.length < 4) return 0;
  let readNum = reback.slice(0,1);
  if(readNum.readUInt8(0) != reback.length - 1) return 0;

  reback = reback.slice(1, reback.length);
  let year = reback.readUInt16BE(0).toString();
  let month = "00" + reback.readUInt16BE(2);
  month = month.substr(month.length - 2 , 2);
  let day = "00" + reback.readUInt16BE(4);
  day = day.substr(day.length - 2 , 2);
  let hour = "00" + reback.readUInt16BE(6);
  hour = hour.substr(hour.length - 2 , 2);
  let mini = "00" + reback.readUInt16BE(8);
  mini = mini.substr(mini.length - 2 , 2);
  let second = "00" + reback.readUInt16BE(10);
  second = second.substr(second.length - 2 , 2);
  let time = year + "-" + month + "-" + day + " " + hour + ":" + mini + ":" + second;
  return time;
}
exports.get_SOE = async (type, resend) => {
  resend = resend || [];
  let msg;
  type == 1 ? msg = config.modbus_alarm_SOE : msg = config.modbus_start_SOE;
  let gb = new getBuf(msg);
  let buf = gb.getTogether();
  //if(socket.check()){
    let reback = await getQuery.getQuery(buf, "get_SOE");
    if(reback == 0) return 0;
    if(reback.length == 1 || reback.length < 4) return 0;
    let readNum = reback.slice(0,1);
    if(readNum.readUInt8(0) != reback.length - 1) return 0;
    reback = reback.slice(1, reback.length);
    let arr = {};
    if(reback.readUInt16BE(0) == 0) return 2;
    if(reback.readUInt16BE(0) > 0){
      if(type == 1){
        arr.Time = reback.readUInt16BE(2) + "-" + reback.readUInt16BE(4) + "-" + reback.readUInt16BE(6)
                + " " + reback.readUInt16BE(8) + ":" + reback.readUInt16BE(10) + ":" + reback.readUInt16BE(12);
        arr.Address = reback.readUInt16BE(16);
        arr.State = reback.readUInt16BE(18);
        let Duration = reback.slice(20,24);
        Duration = Duration.swap16().swap32();
        arr.Duration = Duration.readFloatBE(0);
        let WarnValue = reback.slice(24,28);
        WarnValue = WarnValue.swap16().swap32();
        arr.WarnValue = WarnValue.readFloatBE(0);
      }
      else {
        let address = reback.slice(2, reback.length);
        arr.address = comment.buftoString(address);
        arr.url = [];
        for (let i = 0; i < config.files.length; i++) {
          let url = "/download" + arr.address + "." + config.files[i];
          arr.url.push(url);
        }
      }
    }
    //console.log(arr)
    resend.push(arr)
    //soe.add(arr);
    //console.log(resend);
    if (reback.readUInt16BE(0) == 1) return resend;
    return this.get_SOE(type, resend);
    
  //}
  //else return 2;
    
  
}
exports.download = async (url) => {
  let arr = config.modbus_download_file;
  arr.info = Buffer.from(url);
  let gb = new getBuf(arr);
  let buf2 = gb.getTogether();
  let reback = await new getFiles(buf2, "download");
  if(reback == 0) return 0;
  return reback;
}
exports.get_history = async (time, msec, length) => {
  let timeBuf = comment.DateToBuf(time);
  //写入查询日期
  let temp = Buffer.alloc(4)

  temp.writeInt16BE( Number(msec), 0);
  temp.writeInt16BE( Number(length), 2);

  let buf = Buffer.concat([timeBuf, temp], 16);
  let {modbus_get_history} = config;
  modbus_get_history.info = buf;
  let gb = new getBuf(modbus_get_history);
  let buf2 = gb.getTogether();
  let reback = await getQuery.getQuery(buf2, "get_history");
  if(reback == 0) return 0;
  if(reback.length == 1 || reback.length < 4) return 0;
  let readNum = reback.slice(2,4);
  if(readNum.readUInt16BE(0) != buf2.readUInt16BE(10)) return 0;

  //获取文件
  let file1 = config.modbus_get_history_file;
  let date = new Date(time);
  let Y = "" + date.getFullYear();
  let M = ("" + (date.getMonth() + 1)).padStart(2, 0);
  let D = ("" + date.getDate()).padStart(2, 0);
  let h = ("" + date.getHours()).padStart(2, 0);
  let i = ("" + date.getMinutes()).padStart(2, 0);
  let s = ("" + date.getSeconds()).padStart(2, 0);
  msec = ("" + msec). padStart(3, 0)
  let filename = Y + "-" + M + "-" + D + "_" + h + "." 
                + i + "." + s + "." + msec;
  //console.log(reback2)
  return {name:filename};
}
exports.control = async (address, type, length) => {

  let startAddress = Buffer.alloc(2);
  startAddress.writeInt16BE(address);
  let info = Buffer.alloc(2);
  if(type == "ON") info = Buffer.from([0xFF, 0x00]);
  if(type == "OFF") info = Buffer.from([0x00, 0x00]);
  let gb = new getBuf({funcCode: Buffer.from([0x05]), startAddress:startAddress, info});
  let buf2 = gb.getTogether();
  let reback = await getQuery.getQuery(buf2, "control");
  if(reback == 0) return 0;
  if(reback.length == 1 || reback.length < 4) return 0;

  if(reback.readUInt16BE(0) != address) return 0;
  return 1;
}
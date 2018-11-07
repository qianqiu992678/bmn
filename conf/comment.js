
const https = require('https');
const iconv = require("iconv-lite");
const {fs}=require("../conf");
const config = require("../conf/config");
const {mysql, socket, comment, modbus}=require("../conf");
const fis = require("fs");
const errorLogStream = fis.createWriteStream('./error.log', {flags: 'a'});
const vr = require("validator");

exports.checkLogin = (session) => new Promise((resolve, reject) => {

	session ? reject(err) : resolve(result);
})

exports.https = (tourl) => new Promise((resolve, reject) => {
	https.get(tourl, (res) => {

		var datas = [];
		var size = 0;
		res.on('data', (d) => {
            datas.push(d);
            size += d.length;

		});
        res.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var result = iconv.decode(buff, "utf8");
            resolve(result);
        });

	}).on('error', (e) => {
	  reject(e);
	});
})
exports.GetDistance = (lat1, lng1, lat2, lng2) =>{
  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;// EARTH_RADIUS;
  //s = Math.round(s * 10000) / 10000; //输出为公里
  s = Math.round(s * 1000) ; //输出为米
  //s=s.toFixed(4);
  return s;
}
function Rad(d){
  return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
}

exports.formatTime = (date) => {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
exports.formatDate = (date) => {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()



  return [year, month, day].map(formatNumber).join('-')
}
exports.formatDateUnix = (date) => {
  date = date + " 00:00:00";
  date = Date.parse(new Date(date)) / 1000;
  return date;
}
exports.formatTimeUnix = (date) => {
  date = Date.parse(new Date(date)) / 1000;
  return date;
}
exports.formatUnixToDate = (date) => {
  date = new Date(date * 1000).toLocaleString("zh");
  date = date.split(" ");
  return date[0];
}
exports.formatUnixToTime = (date) => {
  date = new Date(date * 1000).toLocaleString("zh", { hour12:false});
  date = date.split(" ");
  return date[1];
}
exports.formatUnixToDT = (date) => {
  date = new Date(date * 1000).toLocaleString("zh", { hour12: false });
  return date;
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
exports.sortAsc = (a,b) => {
  return a - b
}
exports.sortDesc = (a,b) => {
  return b - a
}
exports.compareAsc = (property) => {
  return  (a, b) => {
    var value1 = a[property];
    var value2 = b[property];
    return value1 - value2;
  }
}
exports.compareDesc = (property) => {
  return  (a, b) => {
    var value1 = a[property];
    var value2 = b[property];
    return value2 - value1;
  }
}
//对象排序，sortType true为降序；false为升序
exports.keysort = (key,sortType) => {
    return function(a,b){
        return sortType ? (a[key] < b[key]) : (a[key] > b[key]);
    }
}
exports.isNum = (num) => {
  let reg=/^[-\+]?\d+(\.\d+)?$/;
  if(reg.test(num)) return true;
  else return false;
}


exports.getDate = (date) => { 
  date = new Date(date);
  return {
    Y: date.getFullYear(),
    M: date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
    D: date.getDate(), //获取当前日(1-31)
    H: date.getHours(), //获取当前小时数(0-23)
    I: date.getMinutes(), //获取当前分钟数(0-59)
    S: date.getSeconds(), //获取当前秒数(0-59)
  }
}
 
exports.DateToBuf = (date) => { 
  date = new Date(date);
  let info = Buffer.alloc(12);
  info.writeInt16BE( date.getFullYear(), 0);
  info.writeInt16BE( date.getMonth() + 1, 2);
  info.writeInt16BE( date.getDate(), 4);
  info.writeInt16BE( date.getHours(), 6)
  info.writeInt16BE( date.getMinutes(), 8)
  info.writeInt16BE( date.getSeconds(), 10);
  return info;
}
exports.resError = (res, err) => { 
  var meta = '['+new Date()+']';
  errorLogStream.write(meta + err + '\n');
  return res.json({status: 201, msg:"Error!发生错误!"});
}
exports.getTable = async () => { 
  //获取点表信息-------------------------------------------//
  let list = await modbus.get_table();
  if( list == 0) return;
  if(!vr.isJSON(list)) return;
  config.table = JSON.parse(list);
}

exports.binaryChange =  (str) => { 
  if(str.length % 8 != 0) return "";
  let count = str.length / 8;
  let new_str = "";
  for (let i = 0; i < count; i++) {
    let f_str = str.slice(i*8, i*8 + 8);
    let a_str = new Array(8);
    for (let j = 0; j < 8; j++) {
      a_str[7-j] = f_str[j];
    }
    for (var j = 0; j < 8; j++) {
      new_str += a_str[j];
    }
  }
  return new_str;

}
exports.buftoString =  (buf) => { 
  let isZero = false;
  let isI = 0;
  for (let i = 0; i < buf.length; i++) {
    if(buf.readUInt8(i) == 0){
      isZero = true;
      isI = i;
      break;
    }
  }
  if(isZero) buf = buf.slice(0, isI);
  return buf.toString();

}
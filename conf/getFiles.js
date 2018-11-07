const https = require('https');
const iconv = require("iconv-lite");
const {fs}=require("../conf");
const config = require("../conf/config");
const socket = require("../conf/socket");
//获取文件
function getFiles(buf, func){
  return new Promise((resolve, reject) => {
    this.buf = buf;
    this.fileInfoArray = [];
    this.count = 0;//需要请求次数
    this.size = 0;//文件大小
    this.func = func;
    this.now = 1;
    this.Begin = async () => {
      socket.send("start", buf, this.func, (reback) => {
        if(reback == 0) return resolve(0);
        let regNum = this.buf.slice(10,12);
        if(reback.length == 1 || reback.length < 4) return resolve(0);
        let readNum = reback.slice(2,4);
        if(readNum.readUInt16BE(0) != regNum.readUInt16BE(0)) return resolve(0);
        return this.getCount();
      });
    }
    this.getCount = async () => {
      let gc_buf = config.modbus_get_file_size;
      socket.send("running", gc_buf, this.func, (reback) => {
        if(reback == 0) return resolve(0);
        if(reback.readUInt8(0) != reback.length - 1) return resolve(0);
        this.size = reback.slice(1, reback.length).swap32().swap16().readUInt32BE(0);
        this.count =  Math.ceil( this.size / (config.modbus.maxlength *2) );
        return this.getfileInfo();
      });
    }
    this.getfileInfo = async () => {
      if(this.now <= this.count){
        let gi_buf = config.modbus_get_file_info;
        let stat = "running";
        if(this.now == this.count) stat = "end";
        socket.send(stat, gi_buf, this.func, (reFileInfo) => {
          if(reFileInfo == 0) return resolve(0);
          if(reFileInfo.readUInt8(0) != reFileInfo.length - 1) return resolve(0);
          this.fileInfoArray.push(reFileInfo.slice(1, reFileInfo.length));
          this.now ++;
          return this.getfileInfo();
        });
      }
      else {
        let fileInfo = Buffer.concat(this.fileInfoArray, config.modbus.maxlength * 2 * this.count);
        fileInfo = fileInfo.slice(0, this.size);
        if(this.func == "download") return resolve(fileInfo);
        fileInfo = fileInfo.toString("utf8");
        return resolve(fileInfo);
      }
    }
    this.Begin();
  })
}

module.exports = getFiles;
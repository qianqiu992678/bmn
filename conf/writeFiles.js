const https = require('https');
const iconv = require("iconv-lite");
const {fs}=require("../conf");
const config = require("../conf/config");
const socket = require("../conf/socket");
const getBuf = require("../conf/getBuf");
//写入文件
function writeFiles(buf, info, func){

  return new Promise((resolve, reject) => {
    this.buf = buf;
    this.fileInfoArray = [];
    this.count = 0;//需要请求次数
    this.size = 0;//文件大小
    this.func = func;
    this.info = Buffer.from(info);
    this.Begin = async () => {
      socket.send("start", this.buf, this.func, (reback) => {
        if(reback == 0) return resolve(0);
        let regNum = this.buf.slice(10,12);
        if(reback.length == 1 || reback.length < 4) return resolve(0);

        let readNum = reback.slice(2,4);
        if(readNum.readUInt16BE(0) != regNum.readUInt16BE(0)) return resolve(0);
        return this.writeSize();
      });
    }
    
    this.writeSize = async () => {
      this.size = this.info.length;
      this.info = Buffer.from(this.info);
      this.count = Math.ceil( this.size / (config.modbus.maxlength *2) );
      let buf2 = Buffer.alloc(4);
      buf2.writeUInt32LE(this.size,0,2)
      buf2.swap16();
      let { modbus_write_file_size } = config
      modbus_write_file_size.info = buf2;
      let gb = new getBuf(modbus_write_file_size);
      let buf3 = gb.getTogether();
      socket.send("running",buf3, this.func, (reback) => {
        if(reback == 0) return resolve(0);
        if(reback.length == 1 || reback.length < 4) return resolve(0);

        let readNum = reback.slice(2,4);
        if(readNum.readUInt16BE(0) != buf3.readUInt16BE(10)) return resolve(0)

        return this.getfileInfo();
      });
    }
    
    this.getfileInfo = async (i) => {
      i = i || 0;
      let buf4 = this.info.slice(config.modbus.maxlength * 2 * i, config.modbus.maxlength * 2 * ( i + 1))
    
      let {modbus_write_file_info} = config;
      modbus_write_file_info.info = buf4;
      let gb = new getBuf(modbus_write_file_info);
      let buf3 = gb.getTogether();
      let stat = "running";
      if(i == this.count - 1) stat = "end";
      socket.send(stat, buf3, this.func, (reback) => {
        if(reback == 0) return resolve(0);
        let readNum = reback.slice(2,4);
        if(readNum.readUInt16BE(0) != buf3.readUInt16BE(10)){
          return resolve(0);
        }
        if(i == this.count -1 ) return resolve(1);
        else return this.getfileInfo(i+1)
      });
    }
    this.Begin();
  })
}

module.exports = writeFiles;
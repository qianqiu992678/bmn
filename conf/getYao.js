
const https = require('https');
const iconv = require("iconv-lite");
const {fs, comment}=require("../conf");
const config = require("../conf/config");
const getBuf = require("../conf/getBuf");
const socket = require("../conf/socket");

//根据类型获取遥信、遥脉、遥测数据

function getYao(list, type, func){
  return new Promise((resolve, reject) => {
    //type 1 遥信 2 遥测 3 遥脉
    this.type = type;
    this.fileInfoArray = [];
    this.count = 0;//需要请求次数
    this.func = func;
    this.size = list.length;
    this.array = [];
    this.list = list;
    this.now = 1;
    if(type == 1){
     this.funCode = Buffer.from([0x01]);
     this.space = 1;
     this.count = Math.ceil(list.length / config.modbus.maxlength);
    }
    if(type == 2) {
      this.funCode = Buffer.from([0x03]);
      this.space = parseInt(config.modbus.maxlength / 2);
      this.count = Math.ceil(list.length / this.space);
    }
    if(type == 3) {
      this.funCode = Buffer.from([0x03]);
      this.space = parseInt(config.modbus.maxlength / 2);
      this.count = Math.ceil(list.length / this.space);
    }

    this.Begin = async () => {
      if(this.now <= this.count){
        let i = this.now - 1;
        let startAddress = Buffer.alloc(2);
        let regNum = Buffer.alloc(2);
        if(this.type == 1) {
          startAddress.writeInt16BE(this.list[ i * config.modbus.maxlength ].Address, 0);
          regNum.writeInt16BE(config.modbus.maxlength, 0);
        }
        else if(this.type == 2){
          startAddress.writeInt16BE(this.list[ i * this.space ].Address, 0);
          regNum.writeInt16BE(this.space * 2, 0);
        }
        else if(this.type == 3){
          startAddress.writeInt16BE(this.list[ i * this.space ].Address, 0);
          regNum.writeInt16BE(this.space * 2, 0);
        }
        let gb = new getBuf({
            startAddress: startAddress, 
            regNum: regNum,
            funcCode: this.funCode
        });
        let buf2 = gb.getTogether();
        let stat = "start";
        if(this.now > 1 && this.now < this.count) stat = "running"; 
        if(this.now == this.count) stat = "end"; 
        if(this.count == 1) stat = "one"; 
        socket.send(stat, buf2, this.func, reback => {
          if(reback == 0) return resolve(0);
          if(reback.readUInt8(0) != reback.length - 1) return resolve(0);
          reback = reback.slice(1, reback.length)
          this.fileInfoArray.push(reback);
          this.now++;
          this.Begin();
        });
      }
      else {
        return this.parse();
      }

    }
    this.parse = async () => {
      if(this.type == 1) { //解析遥信数据

        let resend = "";
        for (let i = 0; i < this.fileInfoArray.length; i++) {
          let new_str = "";
          let fa = this.fileInfoArray[i]
          for (let j = 0; j < fa.length; j++) {
            let str = fa.readUInt8(j).toString("2");
            new_str += ("00000000" + str).substr( str.length, 8 );
            //console.log(reback[i]+":",("00000000" + str).substr( str.length, 8 ))
          }
          new_str = comment.binaryChange(new_str);
          new_str = new_str.slice(0, config.modbus.maxlength);
          if(i == this.fileInfoArray.length -1 ){
            let end = this.size % config.modbus.maxlength;
            new_str = new_str.slice(0, end);
          }
          resend += new_str;
        }
        return resolve(resend);
        //console.log(resend)
      }
      else if(this.type == 2) { //解析遥测数据
        let resend = [];
        let resend2 = [];

        for (let i = 0; i < this.fileInfoArray.length; i++) {
          let new_str = [];
          let fa = this.fileInfoArray[i];
          let str = fa.toString("hex");
          let str2 = "";
          for (let j = 1 ; j <= str.length; j++) {
             j % 2 ? str2 += " " + str[j-1] : str2 += str[j-1];
          }
          fa.swap16();
          for (let j = 0; j < parseInt(fa.length/4); j++) {
            let str = fa.readFloatLE(j*4);
            new_str.push(str);
          }
          if(i == this.fileInfoArray.length -1 ){
            let end = this.size % this.space;
            new_str = new_str.slice(0, end);
          }
          resend.push.apply(resend,new_str);
        }
        return resolve(resend);
      }
      else if(this.type == 3) { //解析遥脉数据
        let resend = [];
        let resend2 = [];
        for (let i = 0; i < this.fileInfoArray.length; i++) {
          let new_str = [];
          let fa = this.fileInfoArray[i];
          let str = fa.toString("hex");
          let str2 = "";
          for (let j = 1 ; j <= str.length; j++) {
             j % 2 ? str2 += " " + str[j-1] : str2 += str[j-1];
          }
          fa.swap16();
          for (let j = 0; j < parseInt(fa.length/4); j++) {
            let str = fa.readFloatLE(j*4);
            new_str.push(str);
          }
          if(i == this.fileInfoArray.length -1 ){
            let end = this.size % this.space;
            new_str = new_str.slice(0, end);
          }
          resend.push.apply(resend,new_str);
        }
        return resolve(resend);
      }
    }
    this.Begin();
  })
}

module.exports = getYao;
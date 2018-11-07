
const https = require('https');
const iconv = require("iconv-lite");
const {fs}=require("../conf");
const config = require("../conf/config");
//组装buf

//                文件路径  硬件地址  功能码    起始地址  寄存器数量 内容长度
function getBuf ({filePath, hardware, funcCode, startAddress, regNum, byteNum, info}) {
  this.filePath = filePath || "";
  this.length = 0;
  this.header = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]);
  this.count = 0;
  this.hardware = hardware || Buffer.from([0x01]);
  this.funcCode = funcCode || Buffer.from([0x10]);
  this.startAddress = startAddress || "";
  this.regNum = regNum || Buffer.alloc(0);
  this.byteNum = byteNum || Buffer.alloc(0);
  this.info = info || Buffer.alloc(0);
  this.infoCode;

  this.getTogether = () =>{
    let byteBufferLength;
    this.byteNum.length ? byteBufferLength = Number(this.byteNum.readUInt8(0).toString()) : byteBufferLength = 0;
    this.infoCode = Buffer.alloc(byteBufferLength);
    this.info.copy(this.infoCode, 0);
    this.count = this.hardware.length + this.funcCode.length
          + this.startAddress.length + this.regNum.length + this.byteNum.length + byteBufferLength;
    let count = this.count;
    this.count = Buffer.from([this.count]);
    let buf = Buffer.alloc(0)
    //单写入线圈
    if(this.funcCode.equals(Buffer.from([0x05]))){
      let totalLength = 12;
      buf = Buffer.concat([this.header, Buffer.from([0x06]), this.hardware, this.funcCode, this.startAddress, 
      this.info], totalLength);
    }
    else {
      let totalLength = count +　this.header.length + this.count.length;
      buf = Buffer.concat([this.header, this.count, this.hardware, this.funcCode, this.startAddress, 
      this.regNum, this.byteNum, this.infoCode], totalLength);

    }
    //console.log(buf.length);
    return buf;
  }
}   
module.exports = getBuf;

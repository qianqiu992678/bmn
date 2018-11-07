const https = require('https');
const iconv = require("iconv-lite");
const {fs}=require("../conf");
const config = require("../conf/config");
const socket = require("../conf/socket");

//查询或者写入单条数据
exports.getQuery = (buf, func) => new Promise((resolve, reject) => {
    socket.send("one", buf, func, (reback) => {

       if(reback == 0) return resolve(0);
      return resolve(reback);
    });
})
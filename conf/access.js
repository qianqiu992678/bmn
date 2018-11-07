

//记录日志
const path = require('path');
const fs = require("fs");
const config = require('../conf/config');
const log4js = require('log4js');
log4js.configure({
	appenders: { 
		cheese: { 
			type: 'file', 
			filename: './log/access.log',
            maxLogSize: 10 * 1000 * 1000,
            //maxLogSize: 500,
            numBackups: 3,
		}
	},
	categories: { default: { appenders: ['cheese'], level: 'all' } }
});
exports.log = (msg, buf) => {
	let str2 = "";
	if(buf) {
		let str = buf.toString("hex");
		for (var i = 1 ; i <= str.length; i++) {
			 i % 2 ? str2 += " " + str[i-1] : str2 += str[i-1];
		}
	}
    let meta = "";
	let logger = log4js.getLogger('cheese');
	logger.info(meta + msg +":"+ str2 + '\n');
};

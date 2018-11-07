

// mysql.js
const mysql = require('mysql');
const config = require("../conf/config.js");
const access = require("../conf/access.js");
var db;
var timeID;
var isClocked = false;

exports.query = (sql, ins) => new Promise((resolve, reject) => {
	//if(isClocked = true) return reject();
	db.query(sql, ins, (err, result, fields) => {
		if(err) {
			access.log(err);
		}
		err ? reject(err) : resolve(result);
	})
})
exports._query = (db_name,sql, ins) => new Promise((resolve, reject) => {

	let db_other = mysql.createConnection(config[db_name]);
	db_other.query(sql, ins, (err, result, fields) => {
		err ? reject(err) : resolve(result);
	})
})
exports.connect = () => new Promise((resolve, reject) => {
	let pool = mysql.createPool(config.db);
	pool.getConnection(function(err, connection){
		if(err) return reject(err);
		connection._query = connection.query;
		connection.query = (sql, ins) => new Promise((resolve, reject) => {
			pool.query(sql, ins, (err, result, fields) => {
				err ? reject(err) : resolve(result);
			})
		})
		return resolve(connection);
	})
})
exports.restart = () => new Promise((resolve, reject) => {
	if(db){
		db.end();
	}
	setTimeout(()=>{
		db = mysql.createConnection(config.db);
		db.connect((err) => {
			if (err) {
				this.error(err);
		    	return;
			}
			//isClocked = false;
		    config.websockets.forEach(ws =>{
		        if(ws.readyState == ws.OPEN) 
		            ws.sendText(JSON.stringify({act:"restart", data:1}));
		    })
		});
	},5000)

})
exports.error = (err) => {
	//db = mysql.createConnection(config.db);
	//isClocked = true;
	console.log("mysql err22",err);

    config.websockets.forEach(ws =>{
        if(ws.readyState == ws.OPEN) 
            ws.sendText(JSON.stringify({act:"error", msg: "数据库发生错误"}));
    })
	this.restart();
}

this.restart();
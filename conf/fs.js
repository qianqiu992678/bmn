

// mysql.js
const fs = require('fs');
const comment = require("../models/comment.js")

exports.writeFile = (name, str) => new Promise((resolve, reject) => {
	 fs.writeFile(name, str, function (err) {
		err ? reject(err) : resolve(true);
	 }) ;
})
exports.write = (name, str) => new Promise((resolve, reject) => {
	fs.open(name,'wx',function(err,fd){  
		fs.write(fd, str, function (err) {
			err ? reject(err) : resolve(true);
		}) ;
	});
})
exports.readFile = (name, code = "utf8") => new Promise((resolve, reject) => {
	fs.readFile(name, code, function (err,data){
		err ? reject(err) : resolve(data);
	}) ;
})

exports.rename = (uploadedPath,dstPath) => new Promise((resolve, reject) => {
	fs.rename(uploadedPath,dstPath, function (err) {
		err ? reject(err) : resolve();
	}) ;
})
exports.remove = (name) => new Promise((resolve, reject) => {
	fs.unlink(name, function (err) {
		err ? reject(err) : resolve();
	}) ;
})
exports.readFileSync = (name) => {
	return fs.readFileSync(name);
}
exports.existsSync = (name) => {
	return fs.existsSync(name);
}
exports.readdir = (Path) => new Promise((resolve, reject) => {
	fs.readdir(Path, function (err, files) {
		err ? reject(err) : resolve(files);
	}) ;
})
exports.stat = (Path) => new Promise((resolve, reject) => {
	fs.stat(Path,function(err,stat){
		err ? reject(err) : resolve(stat.isDirectory());
	});  
})
exports.dSize = (Path) =>{
	let size = 0;
	let files = fs.readdirSync(Path);//需要用到同步读取
	files.forEach(item =>{
		let states = fs.statSync(Path+'/'+item); 
		size += states.size;
	});
	return size;
}
exports.outMaxSize = (Path) => new Promise((resolve, reject) => {
	let files = fs.readdirSync(Path);//需要用到同步读取
	let len = files.length;
	let data = [];
	files.forEach(item =>{
		let states = fs.statSync(Path+'/'+item);
		data.push({filename:item, size:states.size, birthtimeMs: states.birthtimeMs});
	});
	data = data.sort(comment.compareAsc("birthtimeMs"));
	for (let i = 0; i < Math.ceil(len /2) ; i++) {
		fs.unlinkSync(Path+'/'+ data[i].filename);
	}
	resolve();
})
//检测文件是否允许访问，用来检测文件是否存在
exports.access = (Path) => new Promise((resolve, reject) => {
	fs.access(Path, fs.constants.R_OK | fs.constants.W_OK, (err) => {
		err ? resolve(false) : resolve(true);
	});
})

exports.mkdir = (Path) => new Promise((resolve, reject) => {
	fs.mkdir(Path,function(err){
		err ? reject(err) : resolve();
	});  
})
exports.rmdir = (Path) => new Promise((resolve, reject) => {
	fs.rmdir(Path,function(err){
		err ? reject(err) : resolve();
	});  
})
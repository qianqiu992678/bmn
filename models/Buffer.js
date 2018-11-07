//返回一个缓存区
exports.createBuf = (a)=>{
	var buf = Buffer.alloc(2);
	buf.writeInt16BE(a);
	return buf;
}


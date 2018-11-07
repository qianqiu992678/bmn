exports.session = {
    "secret": '12345',
    "name": 'testapp', //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    "cookie": {
        maxAge: 1800000
    }, //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    "resave": true,
    "rolling": true,
    "saveUninitialized": false, //sess
};
exports.user = {
    session: null
}
exports.db = {
    //"host"     : '192.168.250.167',
    "host": '127.0.0.1',
    "user": "root",
    "port": "3306",
    "password": "QWEqwe123@",
    "database": "dyk-se-01",
    "useConnectionPooling": true
};
exports.redis = {
    "port": '6379',
    "host": "127.0.0.1",
    "pwd": "QWEqwe123@"
};
exports.socket = {
    "host": '127.0.0.1',
    //"port"  : "9000",
    //"host"  : '192.168.1.187',
    //"port"  : "502",
    //"host"  : '192.168.250.167',
    "port": "502",
};
exports.socket_login = {
    "user": "node",
    "pwd" : "QWEqwe123@",
};
exports.notice = {
    "id": "mMfFSv_8HJ96CxkAUUg2NrshwJu6ddkFuw0XBG6s3TQ"
}
exports.modbus = {
    "maxlength": 123,
}
exports.socket_log = 0; //是否记录报文，0不记录1记录
exports.socketTimeout = 20000; //socket请求超时连接
exports.socketTimeoutCount = 3; //socket连续超时次数，如达到该次数，则中断该socket，重新打开新的socket
exports.get_operate = 60 * 1000; //socket请求超时连接
exports.refresh = 5000; //系统默认websocket刷新时间
exports.username = "1";
exports.pwd = "1";
exports.soeMaxSize = 10 * 1024 * 1024 * 1024; //soe文件夹大小的最大限制单位bit
exports.checkSOESize =  1 * 24 * 60 * 60;//1 * 60; //查找文件夹是否超出最大限制的频率单位秒
exports.table = null; //系统保存点表信息
exports.websockets = []; //websocket数组
exports.maxFieldsSize = 10 * 1024 *1024; //文件管理里上传文件的最大限制；
exports.updateTime = 7 * 86400 * 1000;
exports.modbus_login = { //登录
    startAddress: Buffer.from([0xf0, 0x00]),
    regNum: Buffer.from([0x00, 0x14]),
    byteNum: Buffer.from([0x28]),
    info: null
}
exports.modbus_table = { //获取点表
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: Buffer.from("/JSON/Description.TXT")
}
exports.modbus_record = { //启动录波
    startAddress: Buffer.from([0xf1, 0x03]),
    regNum: Buffer.from([0x00, 0x01]),
    byteNum: Buffer.from([0x02]),
    info: Buffer.from([0x01])
}
exports.modbus_get_dz = { //获取定值文件
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: Buffer.from("/JSON/Setting.TXT")
}
exports.modbus_update_dz = { //更新定值文件
    startAddress: Buffer.from([0xf5, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: Buffer.from("/JSON/Setting.TXT")
}
exports.modbus_update_dz_stat = { //启动录波
    startAddress: Buffer.from([0xf1, 0x00]),
    regNum: Buffer.from([0x00, 0x01]),
    byteNum: Buffer.from([0x02]),
    info: Buffer.from([0x00, 0x01])
}
exports.modbus_write_alarm_time = { //写入查询告警日期
    startAddress: Buffer.from([0xf1, 0x20]),
    regNum: Buffer.from([0x00, 0x0c]),
    byteNum: Buffer.from([0x18]),
    info: null
}
exports.modbus_get_alarm_history = { //获取告警历史事件
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: Buffer.from("/JSON/Event.TXT")
}
exports.modbus_write_record_time = { //写入查询告警日期
    startAddress: Buffer.from([0xf1, 0x10]),
    regNum: Buffer.from([0x00, 0x0c]),
    byteNum: Buffer.from([0x18]),
    info: null
}
exports.modbus_get_history = { //写入查询历史数据参数
    startAddress: Buffer.from([0xf1, 0x04]),
    regNum: Buffer.from([0x00, 0x08]),
    byteNum: Buffer.from([0x10]),
    info: null
}
exports.modbus_get_history_file = { //获取查询历史数据文件
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: null
}
exports.modbus_get_record_history = { //获取告警历史事件
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: Buffer.from("/JSON/Filelist.TXT")
}
exports.modbus_get_ce_now = { //获取电能质量当前信息
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: Buffer.from("/JSON/CurrentEnergy.TXT")
}
exports.modbus_get_zl_time = { //写入电能质量历史查询时间
    startAddress: Buffer.from([0xf1, 0x30]),
    regNum: Buffer.from([0x00, 0x0D]),
    byteNum: Buffer.from([0x1A]),
    info: null
}
exports.modbus_get_zl_history = { //获取电能质量历史事件
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
    info: Buffer.from("/JSON/Energy.TXT")
}
exports.modbus_get_file_size = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x03, 0xf4, 0x00, 0x00, 0x02]); //获取文件大小
exports.modbus_get_file_info = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x03, 0xf4, 0x82, 0x00, 0x7b]); //获取文件内容

exports.modbus_write_file_size = { //写入电能质量历史查询时间
    startAddress: Buffer.from([0xf5, 0x00]),
    regNum: Buffer.from([0x00, 0x02]),
    byteNum: Buffer.from([0x04]),
    info: null
}
exports.modbus_write_file_info = { //获取电能质量历史事件
    startAddress: Buffer.from([0xf5, 0x82]),
    regNum: Buffer.from([0x00, 0x7b]),
    byteNum: Buffer.from([0xf6]),
    info: null
}
exports.modbus_time = { //获取电能质量历史事件
    startAddress: Buffer.from([0xF0, 0x20]),
    regNum: Buffer.from([0x00, 0x06]),
    funcCode: Buffer.from([0X03])
}
exports.modbus_alarm_SOE = { //获取电能质量历史事件
    startAddress: Buffer.from([0x80, 0x00]),
    regNum: Buffer.from([0x00, 0x0E]),
    funcCode: Buffer.from([0X03])
}
exports.modbus_start_SOE = { //启动SOE
    startAddress: Buffer.from([0x82, 0x00]),
    regNum: Buffer.from([0x00, 0x20]),
    funcCode: Buffer.from([0X03])
}
exports.modbus_download_file = { //启动SOE
    startAddress: Buffer.from([0xf4, 0x02]),
    regNum: Buffer.from([0x00, 0xc8]),
    byteNum: Buffer.from([0x90]),
}
exports.files = ["CFG", "DAT", "HDR"]; //下载文件格式
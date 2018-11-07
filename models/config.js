/**
 * Created by Administrator on 2018-4-26.
 */

//主机地址
exports.socket_address = {
    port:502,
    host:'127.0.0.1'
    //host:'192.168.1.235'
}

//电池串定值数据
exports.batteryStringValue = {
    strName:"1号电池串",//电池串名称  ++
    cport:0,//串口号++
    txAddress:0,//通讯地址++
    dccount:5,//电池个数
    dctype:12,//电池类型
    mktype:1,//模块类型
    edc:38,//额定电容
    bcdz:10,//标称内阻

    vshang1:14.1,//电压上限值1
    vshang2:15,//电压上限值2   +++
    vxia1:10.8,//电压下限值1
    vxia2:10.2,//电压下限值2  ++
    wendushang:50,//温度上限值
    wenduxia:5,//温度下限值
    neizushang:50,//内阻上限值
    cxia:20,//容量下限值
    vcshang:0.5,//电压差上限值
    nzbhshang:2,//内阻变化率上限值
    fddlshang:100,//放电电流上限值
    cddlshang:100,//充电电流上限值
    cddlxia:2,//充电电流下限值
    fcdls:10,//浮充电流上限值
    zvshang:451.2,//总电压上限值
    zvxia:345.6,//总电压下限值
    wenboshang:100,//纹波系数上限值

    nzcyjg:360,//内阻采样间隔
    cyjg:360,//正常电压采样间隔
    cdcyjg:20,//充放电电压采样间隔
    zzfdallV:345.6,//终止放电总电压值
    zzfdoneV:10.8,//终止放电单体电压值
    zzfdsj:600,//终止放电时间
    zzfdwd:40,//终止放电温度
    jh:0//均衡功能是否自动开启,
}

//总定值数据
exports.allValueData = {
    ip_address:'192.168.1.23',//IP地址
    zwym:'255.255.255.0',//子网掩码
    wg:'192.168.0.1',//网关
    mac_address:'BC-AE-C0-A8-00-CB',//MAC地址
    connect_port:502,//通讯端口
    isMessage:1,//是否发送短信
    tel1:'15100000000',//手机号码1
    tel2:'18311111111',//手机号码2
    tel3:'18888888888',//手机号码3
    message_center:'12345678978',//短信中心号码
    mod_address:1,//Modbus地址
    target_ip:'222.222.141.171',//目标IP
    target_port:1235,//目标端口号
    target_name:'',//目标域名（后台）
    station_type:1,//站点类型：1：环网柜；2：柱上开关
    connect_fs:2,//连接方式：1：有线网络；2：无线GPRS网络
}

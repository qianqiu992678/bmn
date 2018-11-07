/**
 * Created by Administrator on 2018/7/25 0025.
 */
var redis=require('./redis');
var randomstring=require('randomstring');
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}
exports.formatTime = (date) => {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return ([year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':'));
};
exports.randomString=randomstring.generate;
exports.tokenValidate=(req)=>{
    return new Promise(async (resolve,reject)=>{
        let access_token=req.headers.access_token||req.cookies.access_token;
        var usermsg=await redis.get(access_token);
        resolve(usermsg);
    })

}

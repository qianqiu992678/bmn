/**
 * Created by Administrator on 2018/10/16.
 */
var date=new Date('2018-10-05T01:01:01.833Z');
//console.log(date);
function p(num, length) {
    return (Array(length).join('0') + num).slice(-length);
}
function f(d){
    let year=d.getFullYear();
    let date=p(d.getDate(),2);
    let month= p(d.getMonth()+1,2);
    let hour= p(d.getHours(),2);
    let minute= p(d.getMinutes(),2);
    let second= p(d.getSeconds(),2);
    return year+'-'+month+'-'+date+' '+hour+':'+minute+':'+second
}

console.log(f(date))
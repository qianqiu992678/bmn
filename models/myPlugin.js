/**
 * Created by Administrator on 2018/7/17 0017.
 */
Object.prototype.toArray=function(){
    let arr=[];
    for(let key in this){
        arr.push(this[key])
    }
    return arr.splice(0,arr.length-1);
}

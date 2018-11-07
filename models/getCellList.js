/**
 * Created by Administrator on 2018-7-20.
 */
let logger = require("../log4")
let valable = require("../valable");
let connect = require("../connect");
let config = require("../config");
let Modbus = require("../Modbus");
let iconv = require("iconv-lite");
let modbus = new Modbus();
//建立连接
let GetCellList = function() {
    this.canNext = false;
    this.selectNum = 1;
    let $this = this;
    this.cellList = []
    this.timer=null;
    this.callbacks=[];
    this.then= function (fun) {
        $this.callbacks.push(fun);
        return this;
    };

};
//返回写入和返回数据
GetCellList.prototype.reCall =function(reback){
    let $this = this ;
    ////console.log('reback',reback);
    if(reback.length > 6 && reback.slice(1, 3).readUInt16BE(0).toString(10) == 0 && reback.slice(3, 5).readUInt16BE(0)       .toString(10) == 0) {
        if(reback.slice(7, 8).equals(Buffer.from([0x03]))) {
            if(reback.slice(5,6).equals(Buffer.from([0x87]))){
                modbus.frameLen = 9;
                let cellNumHeadData = modbus.createWrite10Frame(6,1);
                cellNumData = Buffer.concat([cellNumHeadData,Buffer.from([0,0])]);
                connect.writeBack(cellNumData,function(reback){
                    $this.reCall(reback)
                })
            }
            else if(reback.slice(5,6).equals(Buffer.from([0x61]))){
                modbus.frameLen = 9;
                let cellNumHeadData = modbus.createWrite10Frame(6,1);

                cellNumData = Buffer.concat([cellNumHeadData,Buffer.from([0,$this.selectNum])]);
                $this.selectNum++;
                if(($this.selectNum)<=valable.StringNum){
                    connect.writeBack(cellNumData,function(reback){
                        $this.reCall(reback)
                    })
                }else{
                    //console.log($this.modObj);//
                    $this.callbacks.forEach(function(cb){
                        cb($this.cellList)
                    })
                }


            }

        } else if(reback.slice(7, 8).equals(Buffer.from([0x10]))) {
            //send(14:10:31):00 00 00 00 00 09 01 10 02 00 00 01 02 AA 55
            let data ;
            if(reback.slice(8, 10).equals(Buffer.from([0x00, 0x20]))){
                modbus.frameLen = 9;
                let data = modbus.createWrite10Frame(0x2,1);
                data = Buffer.concat([data,Buffer.from([0xAA,0x55])])
                ////console.log("data",data);
                connect.writeBack(data, function(reback){
                    $this.reCall(reback);
                })
            }else if(reback.slice(8, 10).equals(Buffer.from([0x0, 0x00]))){

                if(!$this.canNext){
                    $this.canNext = true;
                }


            }else if(reback.slice(8, 10).equals(Buffer.from([0x0, 0x02]))){

                modbus.frameLen = 9;
                //00 00 00 00 00 09 01 10 02 00 00 01 02 AA 55
                let data = modbus.createWrite10Frame(0x0,1);
                data = Buffer.concat([data,Buffer.from([0,0])])
                connect.writeBack(data, function(reback){
                    $this.reCall(reback);
                })
            }else if(reback.slice(8, 10).equals(Buffer.from([0x0, 0x06]))){
                $this.getCellNameObj();
            }
        }

    }
}
//通过modbus获得电池串数目
GetCellList.prototype.getCellName = function(ip) {
    let $this = this;
    //00 00 00 00 00 06 01 03 00 20 00 42
    modbus.frameLen = 6;
    let data = modbus.createRequest03Frame(0x20,0x42);
    connect.index(ip);
    connect.writeBack(data, (reback) => {
        let length =  reback.toString("hex").length;
        let str = '';
        for(let i=0;i<length;i++){
            if(i%2==0){
                str+=' '+reback.toString("hex")[i];
            }else{
                str+=reback.toString("hex")[i];
            }
        }
        //c0 a8 01 eb
        //logger.info(str)
        let StringNum =  reback.slice(129,131).readUInt16BE(0).toString(10);  //电池串数量
        valable.StringNum = StringNum;
        $this.reCall(reback);

    })
}


//获得电池串的名称
GetCellList.prototype.getCellNameObj = function() {
    let $this = this;
    modbus.frameLen = 6;
    var cellBody = modbus.createRequest03Frame(0x201,0x2F);

    connect.writeBack(cellBody,function(reback){
        let length =  reback.toString("hex").length;
        let str = '';
        for(let i=0;i<length;i++){
            if(i%2==0){
                str+=' '+reback.toString("hex")[i];
            }else{
                str+=reback.toString("hex")[i];
            }
        }
        //c0 a8 01 eb
        //logger.info(str)
        let obj = {};
        obj.StringNo = $this.selectNum;
        var StringName = iconv.decode(valable.dropBuf00(reback.slice(8,39)),"GBK"); //电池串名称

        obj.StringNo = $this.selectNum;
        obj.StringName = StringName;
        $this.cellList.push(obj)
        $this.reCall(reback)
    })



}

module.exports = GetCellList;


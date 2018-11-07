var buf = require('./Buffer');
class Modbus {
	constructor() {
  		this.frameLen = 6;//报文长度
		this.hardwareAddress = 1;//单元标识符
		this.functionCode = 3;//功能码
		this.startAddress =768;//起始地址
		this.registerNUmber =7;//寄存器个数
  	}
	/**
	*组装请求03功能码报文
	* @return 返回报文
	* @startAddress, 起始地址
    * @registerNumber，寄存器数量

	 */
	createRequest03Frame(startAddress,registerNumber) {
	   	this.registerNumber = registerNumber|| 6;
	   	this.startAddress = buf.createBuf(startAddress);
	   	this.registerNUmber = buf.createBuf(registerNumber);
	    let modbusArr = [0x00,0x00,0x00,0x00,0x00,6,this.hardwareAddress,0x03];
	    var returnData = Buffer.concat([Buffer.from(modbusArr),this.startAddress,this.registerNUmber])
	    return returnData;
    	
  	}
    /**
     *组装响应03功能码报文
     * @return 返回报文
     * @startAddress, 起始地址
     * @registerNumber，寄存器数量
     */
    createResponse03Frame(frameLen) {
        this.frameLen = frameLen;
        this.registerNumber = registerNumber|| 6;
        this.startAddress = buf.createBuf(startAddress);
        this.registerNUmber = buf.createBuf(registerNumber);
        let modbusArr = [0x00,0x00,0x00,0x00,0x00,this.frameLen,this.hardwareAddress,0x03,this.frameLen-3];
        return Buffer.from(modbusArr);
    }
    /**
	 *组装响应10功能码报文
	 * @return 返回报文
     * @startAddress, 起始地址
     * @registerNumber，寄存器数量
	 */
	createReply10Frame(startAddress,registerNumber) {
		this.registerNumber = registerNumber|| 6;
		this.startAddress = buf.createBuf(startAddress);
		this.registerNUmber = buf.createBuf(registerNumber);
		let modbusArr = [0x00,0x00,0x00,0x00,0x00,6,this.hardwareAddress,0x10];
		var returnData = Buffer.concat([Buffer.from(modbusArr),this.startAddress,this.registerNUmber])
		return returnData;

	}
    /**
     *组装写10功能码报文
     * @return 返回报文
     * @startAddress, 起始地址
     * @registerNumber，寄存器数量
     */
    createWrite10Frame(startAddress,registerNumber) {
        this.registerNumber = registerNumber|| 6;
        this.startAddress = buf.createBuf(startAddress);
        this.registerNUmber = buf.createBuf(registerNumber);
        let modbusArr = [0x00,0x00,0x00,0x00,0x00,this.frameLen,this.hardwareAddress,0x10];
        var returnData = Buffer.concat([Buffer.from(modbusArr),this.startAddress,this.registerNUmber,Buffer.from([this.frameLen-7])])
        return returnData;

    }
	
	
	/**
	*解析报文 
	* @data 
	* @return 1:帧长度错误;2:？？？？？;
	* 
	*/
	paraseFrame(data) {
		
    	
  	}
	
	/**
	*读取报文 
	* @code 
	* 
	* @return 1:帧长度错误;2:？？？？？;
	* 
	*/
	makeReplyReadMultiRegisterFrame(code){
		
	}
	////////////////////////////主机////////////////////////////
	
	/**
	*响应读 
	* @startAddress 起始地址  registerNumber 寄存器个数
	* @return 1:帧长度错误;2:？？？？？;
	* 
	*/
	makeRequestMutilRegister(startAddress,registerNumber){
	}
}
module.exports = Modbus;


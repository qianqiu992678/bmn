

// mysql.js
const soe_list = [];
const soe_max_length = 300;

exports.add = (arr) => {
	if(soe_list.length < 300) soe_list.push(arr);
	else {
		soe_list.splice(0,1);
		soe_list.push(arr);
	}
}
exports.get = () =>{
	return soe_list;
}
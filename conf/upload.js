const multiparty = require('multiparty');

exports.parseOne = (req) => new Promise((resolve, reject) => {
	let form = new multiparty.Form({uploadDir: './upload/temp/'});
	form.parse(req, function(err, fields, files) {
	 	if(err){
	    	reject(err);
		}
		else {
			let inputFile = files.file[0];
			let uploadedPath = inputFile.path;
			let rename = uploadedPath.split(".");
			if (rename[1] != "jpg" && rename[1] != "jpeg" && rename[1] != "png" && rename[1] != "bmp" && rename[1] != "gif" ){
				resolve({error:1});
			}
			else {
				let newFilename = uploadedPath.replace("upload/temp/","");
				resolve({uploadedPath, newFilename, fields});
			}
		}
	})
})
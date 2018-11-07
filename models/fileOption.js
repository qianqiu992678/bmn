/**
 * Created by Administrator on 2018/8/6 0006.
 */
const fs = require("fs");
const myfs=require("../conf/fs");
const nodeExcel = require('excel-export');
var redis=require('./redis');
var comment=require('./comment');
var ws=require('./websocketServer');
var path=require('path');
var formidable=require('formidable');
var util=require('util');
exports.executeExcel= async function (conf,sessionID) {
    var result = nodeExcel.execute(conf);
    fs.writeFileSync("../upload/temp/"+sessionID+".xlsx", result, 'binary');
};
exports.excelDownload=function(req,res,next){
    let name=req.params.name;
    let fileName=req.params.filename;
    if(fileName){
        if(req.params.filename=='.xlsx'){
            fileName=req.params.name;
        }else{
            //fileName=req.params.filename;
            if(fileName.substr(fileName.length-5,5)!='.xlsx'){
                fileName+='.xlsx';
            }
        }
    }else{
        fileName=req.params.name;
    }
    res.download("../upload/temp/"+name, fileName, async function(){
        await myfs.remove("../upload/temp/"+name);
        ws.wsSend({data:'',msg:'下载成功！',act:'toast'})
    });
}
var readOneDir=function(){
    return new Promise((resolve,reject)=>{

    })
}
var myReaddir= function (path) {
    return new Promise((resolve,reject)=>{

        fs.readdir(path,function(err,files){
            resolve(files)
        });
    })
}
var myMkdir= function (path) {
    return new Promise((resolve)=>{
        fs.mkdir(path, function (err) {
            resolve()
        })
    })
}
var fileList;
var fid=2;
var folderFiles=async function(middlePath,userName,fileList){
    if(!fileList){
        var fileList=[]
    }
    return new Promise(async (resolve)=>{
        let path = '../upload/client/'+userName+'/'+middlePath;
        if(!fs.existsSync(path)){
            await myMkdir(path);
        }
        let files = await myReaddir(path);
        (function iterator(i){
            if(i==files.length){
                resolve(fileList)
                return;
            }
            fs.stat("../upload/client/"+userName+"/"+middlePath+files[i], async function (err,stats) {
                if(stats.isDirectory()){
                    let children=await folderFiles(middlePath+files[i]+'/',userName);
                    fileList.push({
                        fid:fid++,
                        name:files[i],
                        isFile:0,
                        url:userName+'/'+middlePath+files[i],
                        showChildren:0,
                        children:children
                    })
                    //fileList.children=fileList.children.concat();

                }else{
                    fileList.push({
                        fid:fid++,
                        name:files[i],
                        isFile:1,
                        url:userName+'/'+middlePath+files[i]
                    })
                }
                iterator(i+1)
            })
        })(0);
    })

}
exports.getAllFiles=async function(req,res,next){
    let userInfo=await redis.get(req.headers.access_token);
    fileList=[];
    let result=await folderFiles('',JSON.parse(userInfo).UserName,fileList);

    res.json({status:200,msg:'',data:result})
}
exports.fileDelete=async function(req,res,next){
    let userInfo=await redis.get(req.headers.access_token);
    //console.log(105,'../upload/client/'+req.body.url)
    fs.unlink('../upload/client/'+req.body.url,function(err){
        if(err){
            res.json({status:202,msg:'删除失败',data:''});
            return;
        }
        res.json({status:200,msg:'删除成功',data:''});
    })
    res.json({status:200,msg:'',data:'result'})
}
exports.fileRename=async function(req,res,next){
    let userInfo=await redis.get(req.headers.access_token);
    let newpath=req.body.url.substring(0,req.body.url.lastIndexOf('/')+1)+req.body.newname;
    fs.rename('../upload/client/'+req.body.url,'../upload/client/'+newpath,function(err){
        if(err){
            res.json({status:202,msg:'重命名失败',data:''});
            return;
        }
        res.json({status:200,msg:'重命名成功',data:''});
    })
    res.json({status:200,msg:'',data:'result'})
}
exports.folderDelete=async function(req,res,next){
    //console.log(105,'../upload/client/'+req.body.url)
    fs.rmdir('../upload/client/'+req.body.url,function(err){
        if(err){
            res.json({status:202,msg:'删除失败',data:''});
            return;
        }
        res.json({status:200,msg:'删除成功',data:''});
    })
    res.json({status:200,msg:'',data:'result'})
}
exports.folderRename=async function(req,res,next){
    let newpath=req.body.url.substring(0,req.body.url.lastIndexOf('/')+1)+req.body.newname;
    //console.log(118,newpath,'---',req.body.url);
    fs.rename('../upload/client/'+req.body.url,'../upload/client/'+newpath,function(err){
        if(err){
            res.json({status:202,msg:'重命名失败',data:''});
            return;
        }
        res.json({status:200,msg:'重命名成功',data:''});
    })
    res.json({status:200,msg:'',data:'result'})
}
exports.folderNew=async function(req,res,next){
    //console.log(151,req.body.url,'--',req.body.sonFoldername);
    fs.mkdir('../upload/client/'+req.body.url+'/'+req.body.sonFoldername,function(err){
        if(err){
            res.json({status:202,msg:'新建子文件夹失败',data:''});
            return;
        }
        res.json({status:200,msg:'新建子文件夹成功',data:''});
    })
    res.json({status:200,msg:'',data:'result'})
}
exports.fileUpload=function(req,res,next){
    //let userInfo=await redis.get(req.headers.access_token);
    var form = new formidable.IncomingForm();
    var uploadDir = path.normalize(__dirname+'/'+"../upload/temp");
    form.uploadDir = uploadDir;
    form.parse(req, function(err, fields, files) {
        for(item in files){
            (function(){
                if(!files[item].path)return;
                var oldname = files[item].path;
                //var newname = files[item].name === 'blob' ? oldname+'.xml' : oldname+"."+files[item].name.split('.')[1];
                var newname=__dirname+'/../upload/client/'+fields.path+'/'+files[item].name;
                fs.rename(oldname,newname,function(err){
                    if(err) console.log(err);
                    console.log('修改成功');
                })
            })(item);
        }
        //类型，名称，状态，权限逻辑描述
        util.inspect({fields: fields, files: files});
        res.send({status:200,msg:'succ',data:'success'})
    });


    //let file=req.files.file;
    //file.mv('../upload/client/user/'+req.files.file.name,function(err){
    //    if(err){
    //        return res.json({status:500,msg:'upload err',data:err})
    //    }
    //    res.send({status:200,msg:'succ',data:'success'})
    //})


    //var str='';
    //req.on("data",function(chunk){
    //    console.log(168,chunk)
    //    str+=chunk;
    //})
    //req.on("end",function(){
    //    console.log(170,str);
    //    res.send({status:200,msg:'succ',data:"success"})
    //})
}
//exports.fileUpload=async function(req,res,next){
//    console.log(164,req.files); // the uploaded file object
//    let file = req.files.file;
//    let userInfo=await redis.get(req.headers.access_token);
//    // Use the mv() method to place the file somewhere on your server
//    file.mv('../upload/client/'+JSON.parse(userInfo).UserName+'/'+req.files.file.name, function(err) {
//        if (err)
//            return res.status(500).send({status:501,msg:'upload err',data:err});
//
//        res.send({status:200,msg:'',data:''});
//    });
//}




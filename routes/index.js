var express = require('express');
var router = express.Router();
var sys=require('../models/sys/sys')
var user=require('../models/user');
var system=require('../models/system');
var operateLog=require('../models/operateLog');
var platform=require('../models/platform');
var constantManage=require('../models/constantManage');
var comment=require('../models/comment');
var fileOption=require('../models/fileOption');
var cmdOption=require('../models/cmdOption');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.all('/*',async function(req,res,next){
  //console.log(req.path.slice(req.path.length-4,req.path.length));
  //req.path=decodeURI(req.path);
  if(req.path!='/sys/login'
      &&req.path.slice(req.path.length-4,req.path.length)!='.svg'
      &&req.path.slice(0,26)!='/fileExport/excel_download'
      &&req.path!='/fileOption/fileupload'){
    if((!req.headers.access_token&&!req.cookies.access_token)||!await comment.tokenValidate(req)){
      res.json({status:401,data:'',msg:'登录超时，请重新登录！'});
      //next()
    }else{
      next()
    }
  }else{
      //console.log('忽略登录验证')
      next();
  }
})

router.post('/sys/login', sys.login);

router.get('/user/userlist', user.getUserList);

router.post('/user/userlistexport', user.userListExport);

router.post('/user/adduser', user.insertUser);
router.post('/user/userdelete', user.userDelete);
router.post('/user/useredit', user.userEdit);

router.get('/system/getparameterlist', system.getparameterlist);
router.post('/system/parameterlistexport', system.parameterListExport);
router.post('/system/parameterupdate', system.parameterUpdate);
router.post('/system/parameteradd', system.parameterAdd);
router.post('/system/parameterdelete', system.parameterDelete);

router.post('/operatelog/getoptlog', operateLog.getOptLog);
router.post('/operatelog/operatelogexport', operateLog.operatelogExport);

router.post('/operatelog/getctrllog', operateLog.getCtrlLog);
router.post('/operatelog/ctrllogExport', operateLog.ctrllogExport);

//router.post('/operatelog/getctrllog', operateLog.getCtrlLog);
//router.get('/collector/currentdata',collector.getCurrentData)/platform/getsamplevaluenames
router.post('/platform/getcurrentdata', platform.getCurrentData);
router.post('/platform/getsamplevaluenames', platform.getSampleValueNames);
router.post('/platform/getoutputvaluenames', platform.getOutputValueNames);

router.get('/platform/zonelist', platform.zoneList);
router.post('/platform/zoneadd', platform.zoneAdd);
router.post('/platform/zoneedit', platform.zoneEdit);
router.post('/platform/zonedelete', platform.zoneDelete);
router.get('/platform/currentzone', platform.currentZone);

//router.get('/platform/getstationtypelist', platform.getStationTypeList);
router.get('/platform/stationtypelist', platform.stationTypeList);
router.get('/platform/stationlist', platform.stationList);
router.post('/platform/stationadd', platform.stationAdd);
router.post('/platform/stationedit', platform.stationEdit);
router.post('/platform/stationdelete', platform.stationDelete);
router.get('/platform/currentstation', platform.currentStation);

router.post('/platform/gethistorydata', platform.getHistoryData);


router.get('/platform/constantmanage/getstringconstant', constantManage.getStringConstant);
router.get('/platform/constantmanage/synchronousdata', constantManage.synchronousData);

router.post('/platform/constant/stringconstupdate', constantManage.stringConstUpdate);
router.post('/platform/constant/modbusconstupdate', constantManage.modbusConstUpdate);

router.post('/platform/getalarmhistory', platform.getAlarmhistory);
router.post('/platform/alarmhistoryexport', platform.alarmHistoryExport);


router.get('/platform/getalarmvol', platform.getAlarmVol);
router.get('/platform/getalarmres', platform.getAlarmRes);

//router.post('/fileExport/excel',fileExport.getExcel)

router.get('/fileExport/excel_download/:name/:filename',fileOption.excelDownload );

router.get('/fileOption/getallfiles', fileOption.getAllFiles);

router.post('/fileOption/filedelete', fileOption.fileDelete);
router.post('/fileOption/filerename', fileOption.fileRename);
router.post('/fileOption/folderdelete', fileOption.folderDelete);
router.post('/fileOption/folderrename', fileOption.folderRename);
router.post('/fileOption/foldernew', fileOption.folderNew);
router.post('/fileOption/fileupload', fileOption.fileUpload);

router.post('/cmdOption/cmdlist', cmdOption.cmdList);
router.post('/cmdOption/cmdadd', cmdOption.cmdAdd);
router.post('/cmdOption/cmdedit', cmdOption.cmdEdit);
router.post('/cmdOption/cmddelete', cmdOption.cmdDelete);



//constantManage.synchronousData()
module.exports = router;

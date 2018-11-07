var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var comment=require('./models/comment');
var usersRouter = require('./routes/users');
//连接集中器
var nodeStart = require('./models/appStart');
nodeStart.appStart();
//获取当前数据
require('./models/websocketServer');

//require('./models/getDataForDatabase');
var app = express();



var ejs=require('ejs');
require('./models/myPlugin');
// view engine setup
app.set('views', path.join(__dirname,'views'));
app.engine('.html',ejs.__express);
app.set('view engine', 'html');
app.use(cookieParser('token'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var indexRouter = require('./routes/index');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers", "access_token,path,Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  //res.header("Access-Control-Allow-Credentials","true");
  res.header("X-Powered-By",' 3.2.1');
  if(req.method=="OPTIONS"){
    res.sendStatus(200);/*��options������ٷ���*/
  }else{
    next();
  }
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));



app.use('/', indexRouter);

//app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
//app.listen(3000,function(){
//  console.log('server start ...');
//});


//系统级失败之后的处理
process.on('uncaughtException', (err) => {
  setTimeout(() => {
    console.log("错误，请检查",err);
    //appStart()
  }, 5000)

});
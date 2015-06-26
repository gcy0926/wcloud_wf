
/*
 * GET home page.
*/
var http=require('http');
var qs=require('querystring');
var ajax=require('./handler');
var fs=require('fs');
var Path=require('path');

var config=require("./config");

var rendObj={
	dev_id:"加载中...",
	pnumber:"加载中...",
  title: 'WorkPhone Manager'
};
exports.perLogin = function(req, res){
  res.render('plogin',rendObj);
}
exports.perDevice = function(req, res){
  res.render('pdevice',rendObj);
}

exports.login = function(req, res){
  res.render('login', rendObj);
};
exports.device = function(req, res){
  res.render('device', rendObj);
};
exports.qiyeLogin = function(req, res){
  res.render('qiyeLogin', rendObj);
};
exports.acc = function(req, res){
  res.render('acc', rendObj);
};
exports.mapp = function(req, res){
  res.render('mapp', rendObj);
};
exports.setLDAP = function(req, res){
  res.render('setLDAP', rendObj);
};
exports.strategy = function(req, res){
  res.render('strategy', rendObj);
};
exports.trace = function(req, res){
    res.render('trace', rendObj);
};
exports.contacts = function(req, res){
    res.render('contacts', rendObj);
};
exports.home = function(req, res){
  res.render('home', rendObj);
};

exports.appStore = function(req, res){
  res.render('appStore',rendObj);
};

exports.doLogin = function(req,res){
  ajax.handler(req,res);
};

//上传文件
exports.upApp=function(req,res){
  var type=req.body.lesTy;
  var lei=req.body.lei;
  var path=req.files.apll.path;
  var jq=Path.resolve(__dirname, '..', path);
  var mark=req.body.mark;
  var apptype=req.body.lei;//$("#lei").val();
  var appName=req.body.appName;
  var url=req.body.url;
  if(type=="add"){    //上传应用
        req.body={
          _path:'/a/was/add_native_app',
          _methods:'post',
          param:{
            apk_path: jq,
            remark:mark,
            apptype:apptype
          }
        };
        handler(req,res);
  }else if(type="update"){  //升级本地应用。
    req.body={
      _path:"/a/was/update_native_app",
      _methods:"post",
      param:{
        apk_path:jq,
        remark:mark,
        apptype:apptype
      }
    };
      handler(req,res);
  }
}
exports.updateLogo=function(req,res){
  var pat=req.files.logtu.path;
  var filetype=req.files.logtu.headers['content-type']
  if(filetype=='image/jpeg'||filetype=='image/png'){
    fs.readFile(pat,function(err,data){
      if(err){
        console.log(err);
      }
      var base64=new Buffer(data).toString('base64');
      var sid=req.body.lsid;
      var type='';
      if(filetype=='image/jpeg') type='jpg'
      if(filetype=='image/png') type='png'
      req.body={
        _path:'/a/wp/org/logo',
        _methods:'post',
        param:{
          sid:sid,
          logo_base64:base64,
          img_type:type
        }
      };
      handler(req,res);
    })
  }else{
    res.send('<script>parent.typeerr()</script>');
  }
}


function handler(req,res)   //req是请求 res是响应
{
  var content=qs.stringify(req.body.param);
  var host,port;
  host=config.config.host;
  port=config.config.port;
  var opt=
  {
    host:host,    //主机名
    port:port,    //端口号码
    path:req.body._path,    //路径
    method:req.body._methods, //方法post或者get
      headers:{
      'Content-Type':'application/x-www-form-urlencoded',
      'Content-Length':content.length
      }
  };
  if(req.body._methods=='get')    //如果是发送get请求，将content附加在path后面。
  {
    if(!!content){
      opt.path=req.body._path+'?'+content;
    }else{
      opt.path=req.body._path;
    }
    opt.headers=null;
    content=null;
  }
  var body='';
  var requ=http.request(opt,function(resp)
  {
      resp.setEncoding('utf8');
      resp.on('data',function(d)
      {
        body+=d;
      }).on('end',function()
      {
        res.send('<script>parent.waitL('+body+');</script>');
      });
  }).on('error',function(e)
  {
      console.log("错误内容："+e.message);
  });
  if(!!content)   //如果是post方法，centent应该不为空。get方法不发送请求主体（已经附加到path中）。
  {
    requ.write(content);
  }
  requ.end();
}

//chat room send  12.26
exports.sendmes=function(req,res){
    var send=req.body.send;
    var name=req.body.name;
    var txt=name+send;
    req.body={
        _path:'/a/wp/user/send_txt',
        _methods:'post',
        param:{
            txt:txt
        }
    };
    backup_handler(req,res);
}
function backup_handler(req,res){
    var content=qs.stringify(req.body.param);
    var host,port;
    host=config.config.host;
    port=config.config.port;
    var opt=
    {
        host:host,    //主机名
        port:port,    //端口号码
        path:req.body._path,    //路径
        method:req.body._methods, //方法post或者get
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Content-Length':content.length
        }
    };
    if(req.body._methods=='get')    //如果是发送get请求，将content附加在path后面。
    {
        if(!!content){
            opt.path=req.body._path+'?'+content;
        }else{
            opt.path=req.body._path;
        }
        opt.headers=null;
        content=null;
    }
    var body='';
    var requ=http.request(opt,function(resp)
    {
        resp.setEncoding('utf8');
        resp.on('data',function(d)
        {
            body+=d;
        }).on('end',function()
        {
            res.send(body);
        });
    }).on('error',function(e)
    {
        console.log("错误内容："+e.message);
    });
    if(!!content)   //如果是post方法，centent应该不为空。get方法不发送请求主体（已经附加到path中）。
    {
        requ.write(content);
    }
    requ.end();
}

//+++ 20150603 上传excel
exports.upcel=function(req,res){
    var excelpath=req.files.excel.path;
    var ep=Path.resolve(__dirname, '..', excelpath);
    req.body={
        _path:'/a/wp/org/upldap_excel',
        _methods:'post',
        param:{
            excel_path: ep
        }
    };
    upexcel_handler(req,res);
}

function upexcel_handler(req,res){
    var content=qs.stringify(req.body.param);
    var host,port;
    host=config.config.host;
    port=config.config.port;
    var opt=
    {
        host:host,    //主机名
        port:port,    //端口号码
        path:req.body._path,    //路径
        method:req.body._methods, //方法post或者get
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Content-Length':content.length
        }
    };
    if(req.body._methods=='get')    //如果是发送get请求，将content附加在path后面。
    {
        if(!!content){
            opt.path=req.body._path+'?'+content;
        }else{
            opt.path=req.body._path;
        }
        opt.headers=null;
        content=null;
    }
    var body='';
    var requ=http.request(opt,function(resp)
    {
        resp.setEncoding('utf8');
        resp.on('data',function(d)
        {
            body+=d;
        }).on('end',function()
        {
//            res.send(body);
            res.send('<script>parent.waitexcel('+body+');</script>');
        });
    }).on('error',function(e)
    {
        console.log("错误内容："+e.message);
    });
    if(!!content)   //如果是post方法，centent应该不为空。get方法不发送请求主体（已经附加到path中）。
    {
        requ.write(content);
    }
    requ.end();
}


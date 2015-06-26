var $login=$("#login");
var $logout=$("#logout");
var allUsers="";
try{
/*弹出层的设置*/
	$(".dialog").each(function(index, element) {
		var $width = $(this).outerWidth(); //宽度默认300， 添加宽度。
		$(this).dialog({ //所有添加dialog类的元素都会变成弹出层 开始是隐藏的
			width: $width,
			autoOpen: false,
			modal: true,
			resizable: false//,
			//show: "scale"
		});
	});
	$(".cb").click(function(event) { /*所有添加cb类的元素都弹出他连接对应的模块*/
		var id = this.href.split("#")[1];
		id = "#" + id;
		$(id).dialog("open");
		return false;
	});
}catch(err){}
	
//实现登陆功能
$login.submit(function(event){
	event.preventDefault();
	var uidV=$("#uid").val();
	var pwV=$("#password").val();
	if(!verViod(uidV)){
		loadingStatus("用户名不能为空!",0);
		$("#uid").focus();
		return false;
	}else if(uidV.TextFilter()!=uidV){
        alert("用户名非法，请重新输入！");
        return false;
    }else if(!verViod(pwV)){
		loadingStatus("密码不能为空!",0);
		$("#password").focus();
		return false;
	}
	var obj={
		_path:"/a/wp/org/login",
		_methods:"post",
		param:{
			uid:uidV,
			pw:pwV
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
		var sid=data.sid;
		var config=data.is_config_ok;
		if(rt==0){
			//登陆成功之后，实现记住账号
			var saveUid=$("#saveUid");
			if(saveUid.hasClass("checkbox_checked")){
				$.cookie("uid",uidV,{ expires: 30 });
			}else if(saveUid.hasClass("checkbox_uncheck")){
				$.cookie("uid",null);
			}
			loadingStatus("正在跳转!",0);
			$.cookie("org_session_id",sid);
			$.cookie("configStatus",config);
			$.cookie("userid",uidV);
			if(config==0){
				location.href="/f_org_setLDAP";
			}else if(config==1){
				location.href="/f_org_home";
			}
		}else if(rt==2){
			loadingStatus("用户名或密码错误!",0);
		}else if(rt==17){
			loadingStatus("不存在的用户!",0);
		}else{
			loadingStatus("登陆失败!",0);
		}
	},"正在登陆...");
});
//检测cookie中有没有uid字段，是否启用了记住账号的功能
(function checkuid(){
	if($.cookie("uid")){
		$("#uid").val($.cookie("uid"));
		$("#saveUid").removeClass("checkbox_uncheck").addClass("checkbox_checked");
	}
})();
//实现退出功能
$logout.click(function(event){
	event.preventDefault();
	var sid=$.cookie("org_session_id");
	var obj={
		_path:'/a/wp/org/logout',
		_methods:'post',
		param:{
			sid:sid
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
		if(rt==0){
            sessionStorage.clear();
			loadingStatus("正在退出...",0);
			$.cookie("org_session_id",null);
			$.cookie("configStatus",null);
			location.href="/f_org_login";
		}else{
			loadingStatus("操作失败!",0);
		}
	},"正在退出...");
});
//获取公司信息
(function(){
	var href=location.href;
	if(href.indexOf('acc')>-1){
		acc();
	}else if(href.indexOf('setLDAP')>-1){
		setLDAP();
	}else if(href.indexOf('home')>-1){
		home(true);
        getlocs();
        mloadselect();
	}else if(href.indexOf('strategy')>-1){
        loadstrategys();
        home(false);
    }else if(href.indexOf('contacts')>-1){
        home(false);
        showTree();
    }else if(href.indexOf('mapp')>-1){
        home(false);
    }else if(href.indexOf('trace')>-1){
        trace();
        judgeyemianqx();
    }
})();
function trace(){
    //创建地图
//    alert(1);
//    var map = new BMap.Map("trace_cr");
    var map1 = new BMap.Map("tracemap");//在地图容器中创建地图
//    alert(2);
    map1.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
    map1.enableScrollWheelZoom();                 //设置鼠标滚轮缩放
    map1.addControl(new BMap.ScaleControl());                    // 添加默认比例尺控件
    var point = new BMap.Point(116.220686,39.979471);
    map1.centerAndZoom(point,10);//设定地图的中心点和坐标并将地图显示在地图容器中
    window.tracemap = map1;  //为轨迹地图创建一个全局变量
}
function acc(){
	var sid=$.cookie("org_session_id");
	var obj={
		_path:"/a/wp/org/org_info",
		_methods:"get",
		param:{
			sid:sid
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
        var admin_right;
		var admin_email;
		var uid=$.cookie("userid");
		if(rt==0){
			loadingStatus("成功获取管理员信息！",0);
            admin_right = data.org_right;
			admin_email=data.admin_email||"";
		}else{
			loadingStatus("未能获取到管理员信息!",0);
		}
        setText($("#adminqx"),admin_right);
		setText($("#adName"),uid);
	},"正在获取管理员信息!");
//	loadLogo();
}

//上传操作
$("#forfile").click(function(event){
	$("#logtu").click();
});
//上传头像操作
$("#logtu").change(function(event){
	var val=$(this).val()
	if(!val) return false;
	$("#lsid").val($.cookie("org_session_id"));
	$("#leslogo").submit();
	loadingStatus("正在上传...",1);
	$("#forfile").attr("disabled",true);
});
//下载头像
function loadLogo(){
	$("#forfile").attr("disabled",false);
	var obj={
		_path:"/a/wp/org/logo",
		_methods:"get",
		param:{
			sid:$.cookie("org_session_id")
		}
	};
	ajaxReq(obj,function(data){
		if(data.rt==0){
			var type=data["img_type"];
			var b64=data["logo_base64"];
			var tou="";
			if(type=="jpg"){
				b64="data:image/jpg;base64,"+b64;
			}else if(type=="png"){
				b64="data:image/png;base64,"+b64;
			}
			if(!!b64){
				//var img=document.createElement("img");
				//img.src=b64;
				//document.body.appendChild(img);
				$(".kao").attr("src",b64);
			}
		}
	})
}
//图片类型错误时
function typeerr(){
	loadingStatus("上传图片类型错误!",0);
	$("#forfile").attr("disabled",false);
}
function waitL(data){
	$("#forfile").attr("disabled",false);
	var rt=data.rt;
	if(rt==0){
		loadingStatus("上传成功",0);
		loadLogo();
	}else{
		loadingStatus("上传失败",0);
	}
}
function setLDAP(){
	//获取ldap的用户配置信息
	var obj={
		_path:"/a/wp/org/ldap_config",
		_methods:"get",
		param:{
			sid:$.cookie("org_session_id")	
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
		if(rt==0){
			loadingStatus("成功获取到LDAP配置信息!");
			for(var i in data){
				if(i=="rt"){
					continue;
				}
				var id="#"+i;
				$(id).val(data[i]);
			}
		}else{
			loadingStatus("未能获取到LDAP配置信息!")
		}
	},"正在获取LDAP配置信息!");
	checkConfig();
	$(".x").live("click",closeC);
	$("#qx").click(function(event){$("#setA").hide();});
	$("#manu").live("click",manuTongbu);
}
//手动同步
function manuTongbu(event){
	event.preventDefault();
	var org_session_id=$.cookie("org_session_id");
	var obj={
		_path:"/a/wp/org/ldap_sync",
		_methods:"post",
		param:{
			sid:org_session_id
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
		if(rt==0){
			loadingStatus("同步成功!",0);
		}else{
			loadingStatus("同步失败!",0);
		}
	},"正在同步...");
}
function closeC(event){
	event.preventDefault();
	$(this).parent().parent().hide();
}
//检测ldap设置是否完成。
function checkConfig(){
	if(!!$.cookie("configStatus")){
		$("#sq").attr("disabled",false);
		$("#manu").attr("disabled",false);
		openLock();
	}else{
		$("#sq").attr("disabled",true);
		$("#manu").attr("disabled",true);
		$("#kaiguan").attr("disabled",true);
		$("#iterval").addClass("select_disabled");
	}
}
//解锁自动同步
function openLock(){
	var obj={
		_path:"/a/wp/org/ldap_sync_config",
		_methods:"get",
		param:{
			sid:$.cookie("org_session_id")
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
		//console.log(data);
		if(rt==0){
			var cyc=data.ldap_sync_cycle;
			var day=24;
			var week=day*7;
			var tweek=week*2;
			var mon=day*30;
			var year=mon*12;
			var ch="";
			if(cyc>0){
				if(cyc>=year){
					ch="每年";
				}else if(cyc>=mon){
					ch="每个月";
				}else if(cyc>=tweek){
					ch="每两周";
				}else if(cyc>=week){
					ch="每周";
				}else if(cyc>=day){
					ch="每天"
				}
				$("#kaiguan").removeClass("jiaonang_disabled").addClass("jiaonang_open");
				$("#iterval").removeClass("select_disabled");
				$("#tm").html(ch);
			}else{
				$("#kaiguan").removeClass("jiaonang_open").addClass("jiaonang_disabled");
				$("#tm").html("选择同步时间");
			}

		}
	})
}
//是否自动同步选择
$("#kaiguan").click(function(event){
	//console.log($(this).attr("class"));
	var that=$(this);
	if(that.hasClass("jiaonang_open"))		//如果现在是打开状态，点击后应该是闭合状态。
	{
		$("#iterval").addClass("select_disabled");
	}else if(that.hasClass("jiaonang_close")){
		$("#iterval").removeClass("select_disabled");
	}
});
//点击每天或者没周之后，发送修改结果存储到服务器
$("#iterval .option").click(function(event){
	var txt=$(this).html();
	var cyc=0;
	switch(txt){
		case "每年":
		cyc=24*30*12;
		break;
		case "每个月":
		cyc=24*30;
		break;
		case "每两周":
		cyc=24*14;
		break;
		case "每周":
		cyc=24*7;
		break;
		case "每天":
		cyc=24;
		break;
		default:
		cyc=0;
	};
	var obj={
		_path:"/a/wp/org/ldap_sync_config",
		_methods:"post",
		param:{
			sid:$.cookie("org_session_id"),
			ldap_sync_cycle:cyc
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
		//console.log(data);
		if(rt==0){
			loadingStatus("修改成功!",0);
		}else{
			loadingStatus("修改失败!",0);
		}
	},"正在修改同步频率...");
});
//点击授权按钮之后，获取所有用户
$("#sq").live("click",function(event){
	event.preventDefault();
	$("#setA").show();
	var obj={
		_path:"/a/wp/org/ldap_users",
		_methods:"get",
		param:{
			sid:$.cookie("org_session_id")
		}
	};
	ajaxReq(obj,function(data){
		var jrq=$("#pzz");
		var rq=$("tbody",jrq);
		rq.html("");
		var rt=data.rt;
		if(rt==0){
			var users=data['users'];
			var nau_users=data["nau_users"];
			var str='';
			for(var i=0,len=users.length;i<len;i++){
				str='';
				str+='<tr><td><span class="checkbox checkbox_checked"></span></td><td class="tc dev_id">';
				str+=users[i]['username'];
				str+='</td></tr>';
				rq.append(str);
				jrq.mCustomScrollbar("update");
			}
			for(var k=0,l=nau_users.length;k<l;k++){
				str='';
				str+='<tr><td><span class="checkbox checkbox_uncheck"></span></td><td class="tc dev_id">';
				str+=nau_users[k]['username'];
				str+='</td></tr>';
				rq.append(str);
				jrq.mCustomScrollbar("update");
			}
		}else{

		}
	});
});
//点击提交授权管理
$("#tj").live("click",function(event){
	var uids=[];
	var org_session_id=$.cookie("org_session_id");
	// $("#pzz tbody tr .checkbox_checked").each(function(index,element){
	// 	uids.push($(".dev_id",$(element).parent().parent()).html());
	// });
	var obj={
		_path:"/a/wp/org/ldap_users_allow_use",
		_methods:"post",
		param:{
			sid:org_session_id
			//uids:uids
		}
	};
	$("#pzz tbody tr .checkbox_checked").each(function(index,element){
		//uids.push($(".dev_id",$(element).parent().parent()).html());
		var key='uid'+index;
		obj.param[key]=$(".dev_id",$(element).parent().parent()).html();
	});
	ajaxReq(obj,function(data){
		var rt=data.rt;
		if(rt==0){
			loadingStatus("授权成功!",0);
			$("#setA").hide();
		}else{
			loadingStatus("授权失败!",0);
		}
	},"正在提交...")
});
//提交ldap的用户配置信息
$("#setldap").submit(function(event){
	event.preventDefault();
	var obj={
		_path:"/a/wp/org/ldap_config",
		_methods:"post",
		param:{
			sid:$.cookie("org_session_id")
		}
	};
	var input=$("#setldap input");
	for(var i=0,len=input.length;i<len;i++){
		if(input[i].type=="button"||input[i].type=="submit"||input[i].type=="reset"||!verViod(input[i].value)){
			continue;	//如果类型为button submit reset或者是空值，则调到下一个循环
		}
		var key=input[i].id;	//键等于id
		obj.param[key]=input[i].value;	//值等于
	}
	ajaxReq(obj,function(data){
		//console.log(obj);
		//console.log(data);
		if(data.rt==0){
			loadingStatus("提交成功!",0);
			$.cookie("configStatus",1)
		}else{
			loadingStatus("提交失败!",0);
			$.cookie("configStatus",0);
		}
		checkConfig();
	},"正在提交！");
});
function home1(){
	var obj={
		_path:"/a/wp/org/ldap_ous",
		_methods:"get",
		param:{
			sid:$.cookie("org_session_id")
		}
	};
	ajaxReq(obj,function(data){
		var rt=data.rt;
		var ous=data.ous;

		//console.log(data);
		//var classRt="u";
            if (rt != 0) {
            } else {
                loadingStatus("成功获取用户信息！", 0);
                $("#nnum").html(ous.length);
                for (var i = 0, len = ous.length; i < len; i++) {
                    var dn = ous[i]["dn"];
                    var ou = ous[i]["ou"];
                    var html = "";
                    html += '<div name="ou" style="cursor: pointer" title="'+dn+'" onclick="showson(this.title)">';
                    html += '<span class="checkbox checkbox_uncheck" value="'+dn+'"/>';
                    html += '<img src="images/group.png"/>';
                    html += '<a href="javascript:;" title="'+dn+'" onclick="show(this.title)">'
                    html += ou;
                    html += '</a>';
                    html += '</div>';
                    html += '<div style="display:none;" id="'+dn+'"></div>';
                    $("#yic").append(html);	//添加一个账户
                    $("#guanli").mCustomScrollbar("update");	//添加完成之后更新界面滚动。

                }
            }
	},"正在获取用户信息!");
    loadLogo();

}
function showson(title){
    alert(title);
    var obj={
        _path:"/a/wp/org/ldap_onelevel" ,
        _methods:"get",
        param:{
            sid:$.cookie("org_session_id"),
            oudn:title
        }
    };

    ajaxReq(obj,function(data){
        var rt=data.rt;
        var ous=data.ous;

        var users = data.users;

        if (rt != 0) {
        } else {
            loadingStatus("成功获取群组信息！", 0);
            var div = document.getElementById(title);
            div.style.marginLeft = "20px";
            for (var i = 0, len = ous.length; i < len; i++) {
                var dn = ous[i]["dn"];

                var ou = ous[i]["ou"];
                var son = document.createElement("div");
                son.name = "ou";
                son.style.cursor = "pointer";
                son.title = dn;
                //son.attachEvent("onclick",showson("this.title"));
                //bindEvent(son,"click",showson(this.title));
                son.onclick = showson(this.title);

                var span = document.createElement("span");
                span.className = "checkbox checkbox_uncheck";

                var img = document.createElement("img");
                img.src="images/group.png";

                var a = document.createElement("a");
                a.innerHTML =  ou;

                var sonblock = document.createElement("div");
                div.id = dn;


                son.appendChild(span);
                son.appendChild(img);
                son.appendChild(a);
                div.appendChild(son);
                div.appendChild(sonblock);

            }
            for(var j=0;j<users.length;j++){
                var li = document.createElement("li");
                li.title = users[j]['uid'];


                var span = document.createElement("span");
                span.className = "checkbox checkbox_uncheck";

                var img = document.createElement("img");
                img.src = "images/unline.png";

                var a = document.createElement("a");
                a.innerHTML = users[j]['username'];
                //img.style.float = "left";
                li.appendChild(span);
                li.appendChild(img);
                li.appendChild(a);
                div.appendChild(li);
            }
            //if(div.style.display == "none"){
                div.style.display = "block";
            //}else{
            //    div.style.display = "none";
            //}

            $("#guanli").mCustomScrollbar("update");	//添加完成之后更新界面滚动。
        }
    },"正在获取用户信息!");
}



//***home()函数替换
var html;//初始化要加入的html
function home(listen){
    getData(listen);
    loadLogo();
}
function getData(listen){
    html = "";
//    alert("html="+html);
//    alert(sessionStorage.allUsers);
    if(sessionStorage.allUsers==null){
        getUserDataFromDB(listen);
    }else{
        var users = getUserDataFromCache(listen);
        $("#yic").append(users);	//添加用户数据
        $("#guanli").mCustomScrollbar("update");
    }
}
function getUserDataFromDB(listen){
//    alert("缓存是空的，从DB中获取数据");
    var obj={
        _path:"/a/wp/org/ldap_tree",
        _methods:"get",
        param:{
            sid:$.cookie("org_session_id")
        }
    };
    ajaxReq(obj,function(data){
        var rt = data.rt;
        var all = data.all;
        if (rt != 0) {
            loadingStatus("获取用户信息失败！", 0);
        } else {
            loadingStatus("成功获取用户信息！", 0);
            showsons(all,listen);
            sessionStorage.allUsers = html;
            $("#yic").append(html);	//添加一个账户
            $("#guanli").mCustomScrollbar("update");
        }
    },"正在获取用户信息!");
}
function getUserDataFromCache(listen){
    var newcache;
    var cache = sessionStorage.allUsers;
    if(listen==false){
        //如果不需要监听的话，在返回字符串之前将其中的check()函数的参数进行替换
        newcache = cache.replace(/true/g,"false");
    }else{
        newcache = cache.replace(/false/g,"true");
    }
    return newcache;
}

//***函数替换
var count = 1;
var temp;
function showsons(all,listen){
    count+=1;
    temp = count;
    loadingStatus("正在获取用户信息!",0);
    var dn = all['dn'];
    var ou = all['ou'];
    if(ou=='admin'){
        ou='所有用户';
    }
    var ous = all['ous'];
    var users = all['users'];
    //每一个群组要进行的操作
    html+='<div style="cursor:pointer" style="margin-left:20px">';
    if(listen){
        $.cookie("yicid",dn);   //+++20150326   用于修改用户信息时的解析
        html+='<span id="'+"ou:"+dn+'"class="checkbox checkbox_uncheck" onclick="check(this.id,true)"></span>';
    }else
    {
        html+='<span id="'+"ou:"+dn+'"class="checkbox checkbox_uncheck" onclick="check(this.id,false)"></span>';
    }

    html+='<img src="images/group.png"/>';
    html+='<a href="javascript:;" title="'+dn+'" onclick="show(this.title)">';
    html+= ou;
    html+='</a>';
    html+='</div>';

    //当第三层群组时，群组默认闭合
    if(count<=1){
        html+='<div style="margin-left:20px;display:block;" id="'+dn+'">';
    }else{
        html+='<div style="margin-left:20px;display:none;" id="'+dn+'">';
    }
    for(var j=0;j<users.length;j++){
        html+='<li title="'+users[j]['uid']+'">';
        html+='<span title="'+users[j]['uid']+'" id="'+"us:"+users[j]['dn']+'" class="checkbox checkbox_uncheck"  onclick="showuserdetails(this,this.title,this.id,true)"></span>';
        //这里的id是为了寻找span,class是控制前面的checkbox
        html+='<img src="images/unline.png"/>';
        html+='<a class="'+users[j]['job']+":"+users[j]['email']+'"name="'+"us:"+users[j]['dn']+'" title="'+users[j]['uid']+'" href="javascript:;" onclick="showuserdetails(this,this.title,this.name,true)">';
        //这里的属性name是为了寻找此标签对应的span，title是想指向用户的时候显示用户的邮箱信息
        html+=users[j]['username'];
        html+='</a>';
        html+='</li>';
    }
    for(var i=0;i<ous.length;i++){
        showsons(ous[i],listen);
    }
    html+='</div>';
    count=temp;
}
function getSelectStatus(rootNode){
    var status = $("#yic").innerHTML;
    alert(status);
    return status;
}

//***newloopup
function check(dn,listen){
    //获取进行选择操作的checkbox,并将此群组下的所有checkbox的属性设置为选中
    //如果listen选项为真，才进行加载用户信息的操作
    var oudn = dn.substring(3);
    var span = document.getElementById(dn);
    var div = document.getElementById(oudn);  //获取群组所在的div
    var checkboxs = div.getElementsByTagName("span");
    for(var i=0;i<checkboxs.length;i++){
        var type = checkboxs[i].id.substring(0,2);
        if(span.className=="checkbox checkbox_uncheck")
        {
            //遇到问题，现在很多属性不知道存在哪里，比如电话号码，还有要增加的职位、激活
            checkboxs[i].setAttribute("class","checkbox checkbox_checked");

            //获取了由span id中加入的标识字段
            if(listen){
                if(type=='ou'){continue;}
                if(type=='us')
                {
                    hideinfo(checkboxs[i].title);
                    showuserinfo(checkboxs[i].title,checkboxs[i].id);
                }

            }


        }else{
            checkboxs[i].setAttribute("class","checkbox checkbox_uncheck");
            if(listen){
                if(type=='us')
                {
                    hideinfo(checkboxs[i].title);
                }
            }

        }
    }
    if(listen){
        setTimeout(newloopUp,2000);
    }

}
//***newloopup
function showuserdetails($Element,uid,sdn,show){
    var jh=sdn.substr(0,2);
    var dn=sdn.substr(3);
    var pnumber='1000000000';
    if(($Element).tagName=="A")    //如果点击的是文字连接a
    {
        var sp=document.getElementById(sdn);   //获取id=sdn的object span
        if (sp.className=="checkbox checkbox_checked"){
            sp.setAttribute("class","checkbox checkbox_uncheck");
            hideinfo(uid);
            return;
        }
        else{
            sp.setAttribute("class","checkbox checkbox_checked");
        }
    }
    if(($Element).tagName=="SPAN" && ($Element).className=="checkbox checkbox_checked")   //如果点击的是span
    {
        hideinfo(uid);
        return;
    }
    if(show){
        showinfo(uid,sdn,pnumber);
        newloopUp();
    }

}
function showuserinfo(uid,sdn){
    var jh=sdn.substr(0,2);
    var dn=sdn.substr(3);
    var pnumber='1000000000';
    // alert(dn);
    var sp=document.getElementById(sdn);   //获取id=dn的object span
    showinfo(uid,sdn,pnumber);
}
//***no  lookup
function showinfo(uid,sdn,pnumber){
    //alert(sdn);
    var a = document.getElementsByName(sdn)[0];
    var username = a.innerHTML;
    var job = a.className.split(':')[0];
    var email = a.className.split(':')[1];
    var department = '';
    var fenjie = sdn.split(',');
    for(var i=fenjie.length-1;i>=0;i--){
        if(fenjie[i].substring(0,2)=='ou'){
            department+=fenjie[i].substring(3)+'/';
        }
    }
    var dev_id='设备信息获取中...';
    var txt;
    txt="";
    txt+='<tr class="'+uid+'">';
    //alert('uid:'+uid);
    txt+='<td><span class="checkbox checkbox_uncheck"></span>';
    txt+='</td><td class="zhuangtai"></td>';
    txt+='<td class="username">'+username+'</td>';
    txt+='<td class="Email">'+email+'</td><td class="Telephone">'+uid+'</td><td>'+job+'</td><td>'+department.substring(0,department.length-1)+'</td><td class="lastTime">在线时间</td>';
    txt+='<td class="dev_id">'+dev_id+'</td>';
    txt+='<td><img class="lock" alt="unlock" title="suoding" src="images/unlock.png" /></td></tr>';
    $("#yglb tbody").append(txt);
    $("#shebeiB").mCustomScrollbar("update");
    $(".zhuangtai").html('<img src="images/unonline.png" />状态获取中...');

}

function check_dev_id_and_user(Element){
    var arr=[];
    var that;
    $("#yglb tbody tr .checkbox_checked").each(function(index,element){
        var that=$(element).parent().parent();
        if($(".dev_id",that).html()!='undefined'){
            if($(".username",that).html()!='')
                arr.push({"dev_id":$(".dev_id",that).html(),"username":$(".username",that).html()});
            else
                arr.push({"dev_id":$(".dev_id",that).html(),"username":"unknow"});
        }
    });
    //如果点击之前是未选中，则需要在arr中添加该项，反之则删除
    var parenttr=$(Element).parent().parent();
//    alert(Element.className);
    if(Element.tagName=="SPAN" && Element.className=="checkbox checkbox_uncheck")   //如果点击的是span
    {
//        alert($(".dev_id",parenttr).html());
        if($(".dev_id",parenttr).html()!='undefined'){
            if($(".username",parenttr).html()!='')
                arr.push({"dev_id":$(".dev_id",parenttr).html(),"username":$(".username",parenttr).html()});
            else
                arr.push({"dev_id":$(".dev_id",parenttr).html(),"username":"unknow"});
        }
    }
    if(Element.tagName=="SPAN" && Element.className=="checkbox checkbox_checked")
    {
//        alert($(".dev_id",parenttr).html());
        for(var k=0;k<arr.length;k++)
        {
            if(arr[k].dev_id == $(".dev_id",parenttr).html())
            {
               arr.splice(k,1);
               break;
            }
        }
    }
//    alert(JSON.stringify(arr));
    return arr;
}
function hideinfo(uid){
    //解除勾选隐藏用户信息
    $("#yglb tbody tr").each(function(index,element){
        var telephone =$(".Telephone",$(element)).html();
        if(telephone==uid){
            $(element).remove();
        }
    });
}
//获取所有策略的作用范围和坐标 半径
function getlocs(){
    var obj={
        _path:"/a/wp/user/get_strategys",
        _methods:"get",
        param:{
            sid:$.cookie("org_session_id")
        }
    };
    ajaxReq(obj,function(data){

        var rt = data.rt;
        var strategys = data.strategys;
        if (rt != 0) {
            loadingStatus("策略加载失败！",0);
        } else {
            strmarkerArr.splice(0,strmarkerArr.length);
            for(var i=0;i<strategys.length;i++)
            {
                var k =i+1
                var marker={title:"策略"+k,desc:strategys[i].desc,radius:strategys[i].radius,start:strategys[i].start,end:strategys[i].end,point:{lot:parseFloat(strategys[i].lon),
                    lat:parseFloat(strategys[i].lat)},isOpen:1,icon:{w:25,h:25,l:45,t:21,x:6,lb:5}};
                strmarkerArr.push(marker);
            }
        }
        addstrcircles();
    });

}

//***从内存中加载
function showTree(){
    var html = "";//初始化要加入的html
    if(sessionStorage.contactUser==null){
        var obj={
            _path:"/a/wp/org/ldap_tree",
            _methods:"get",
            param:{
                sid:$.cookie("org_session_id")
            }
        };
        ajaxReq(obj,function(data){
            var rt = data.rt;
            var all = data.all;
            if (rt != 0) {
                loadingStatus("获取用户信息失败！", 0);
            } else {
                showsons(all);
                loadingStatus("成功获取用户信息！", 0);
                sessionStorage.contactUser = html;
                $("#tree").append(html);	//添加一个账户
                $("#user_tree").mCustomScrollbar("update");
            }
        },"正在获取用户信息!");
        //加入count变量用来记录现在群组的层级
        var count = 1;
        function showsons(all){
            count+=1;
            temp = count;
            loadingStatus("正在获取用户信息!",0);
            var dn = all['dn'];
            var ou = all['ou'];
            if(ou=='admin'){
                ou='选择全部';
            }
            var ous = all['ous'];
            var users = all['users'];
            //每一个群组要进行的操作
            //html+='<div style="cursor:pointer" style="margin-left:20px" style=" overflow: hidden !important">';
            html+='<div style="cursor:pointer;border:1px solid #f2f2f2;background:#ededed;height:32px" style=" overflow: hidden !important">';
            html+='<span id="'+"out:"+dn+'"class="checkbox checkbox_uncheck" onclick="tcheck(this.id)"></span>';
            html+='<img src="images/group.png"/>';
            html+='<a name="out:'+dn+'"href="javascript:;" title="t'+dn+'" onclick="show(this.title)">';
            html+= ou;
            html+='</a>';
            html+='</div>';

            //当第三层群组时，群组默认闭合
            if(count<=2){
                html+='<div style="display:block;overflow: hidden !important;border:1px solid #ffffff;background:#ffffff;" id="t'+dn+'">';
            }else{
                html+='<div style="display:none;overflow: hidden !important" id="t'+dn+'">';
            }
            for(var j=0;j<users.length;j++){
                html+='<li style="height: 30px" title="'+users[j]['uid']+'">';
                html+='<span title="'+users[j]['uid']+'" id="'+"ust:"+users[j]['dn']+'"class="checkbox checkbox_uncheck" onclick="showcontacts(this,this.title,this.id)"></span>';
                //这里的id是为了寻找span,class是控制前面的checkbox
                html+='<img src="images/unline.png"/>';
                html+='<a class="'+users[j]['job']+":"+users[j]['pnumber']+'"name="'+"ust:"+users[j]['dn']+'" title="'+users[j]['uid']+'" href="javascript:;" onclick="showcontacts(this,this.title,this.name)">';
                //这里的属性name是为了寻找此标签对应的span，title是想指向用户的时候显示用户的邮箱信息
                html+=users[j]['username'];
                html+='</a>';
                html+='</li>';
            }

            for(var i=0;i<ous.length;i++){
                showsons(ous[i]);
            }
            html+='</div>';

            count=temp;
        }
    }
    else{
        html = sessionStorage.contactUser;
        $("#tree").append(html);	//添加一个账户
        $("#user_tree").mCustomScrollbar("update");
    }
    loadLogo();
}

function loadstrategys(){

    var obj={
        _path:"/a/wp/user/get_strategys",
        _methods:"get",
        param:{
            sid:$.cookie("org_session_id")
        }
    };
    ajaxReq(obj,function(data){
        var rt=data.rt;
        var strategys=data.strategys;
        if(rt == 0)
        {
            loadingStatus("获取策略配置信息成功!",0);
            for(var i=0;i<strategys.length;i++)
            {
                showstrategyinfo(strategys[i],i+1);
            }
        }else{
            loadingStatus("获取策略配置信息失败!",0);
        }
    },"正在获取策略配置信息...");
}
//用于展示策略内容
function showstrategycontent(element){
    var strategy_id = element.parentNode.parentNode.className;
    var obj={
        _path:"/a/wp/user/get_strategy_by_id",
        _methods:"get",
        param:{
            sid:$.cookie("org_session_id"),
            strategy_id:strategy_id
        }
    };
    ajaxReq(obj,function(data){
        var rt=data.rt;
        var strategy=data.strategy;
        if(rt == 0)
        {
            var wifi="未设置";
            var camera="未设置";
            var bluetooth="未设置";
            var tape="未设置";
            var gps="未设置";
            var mobiledata="未设置";
            var usb_connect="未设置";
            var usb_debug="未设置"
            if (strategy['wifi']=="wfjy")
                var wifi="非禁用";
            else if(strategy['wifi']=="wjy")
                var wifi="禁用";
            if (strategy['camera']=="cfjy")
                var camera="非禁用";
            else if(strategy['camera']=="cjy")
                var camera="禁用";
            if (strategy['bluetooth']=="bfjy")
                var bluetooth="非禁用";
            else if(strategy['bluetooth']=="bjy")
                var bluetooth="禁用";
            if (strategy['tape']=="tfjy")
                var tape="非禁用";
            else if(strategy['tape']=="tjy")
                var tape="禁用";
            if (strategy['gps']=="gfjy")
                var gps="非禁用";
            else if(strategy['gps']=="gjy")
                var gps="禁用";
            if (strategy['mobiledata']=="mfjy")
                var mobiledata="非禁用";
            else if(strategy['mobiledata']=="mjy")
                var mobiledata="禁用";
            if (strategy['usb_connect']=="ucfjy")
                var usb_connect="非禁用";
            else if(strategy['usb_connect']=="ucjy")
                var usb_connect="禁用";
            if (strategy['usb_debug']=="udfjy")
                var usb_debug="非禁用";
            else if(strategy['usb_debug']=="udjy")
                var usb_debug="禁用";

            var html = "";
            html="策略如下：\n"+"camera:"+camera+','+"bluetooth:"+bluetooth+','+"wifi:"+wifi+','+'\n'+"录音:"+tape+','+"gps:"+gps+','+"移动数据:"+mobiledata+','+'\n'+"USB连接:"+usb_connect+','+"USB调试:"+usb_debug+'。';
            html+='\n';
            alert(html);
        }else{
            loadingStatus("获取策略内容失败!",0);
        }
    },"");
}
function showstrategyinfo(strategy,i)
{
    var userdesc=strategy['userdesc'];
    var strategy_id=strategy['strategy_id'];

    var wifi="";
    var camera="";
    var bluetooth="";

    if (strategy['camera']=="cfjy")
        var camera="非禁用";
    else if(strategy['camera']=="cjy")
        var camera="禁用";
    if (strategy['bluetooth']=="bfjy")
        var bluetooth="非禁用";
    else if(strategy['bluetooth']=="bjy")
        var bluetooth="禁用";
/*
    var tape="";
    var data_work="";
    var gps="";
    var mobiledata="";
    var usb_connect="";
    var usb_debug=""
    if (strategy['wifi']=="wfjy")
        var wifi="非禁用";
    else if(strategy['wifi']=="wjy")
        var wifi="禁用";
    if (strategy['tape']=="tfjy")
        var tape="非禁用";
    else if(strategy['tape']=="tjy")
        var tape="禁用";
    if (strategy['data_work']=="dfjy")
        var data_work="不清除";
    else if(strategy['data_work']=="djy")
        var data_work="清除";
    if (strategy['gps']=="gfjy")
        var gps="非禁用";
    else if(strategy['gps']=="gjy")
        var gps="禁用";
    if (strategy['mobiledata']=="mfjy")
        var mobiledata="非禁用";
    else if(strategy['mobiledata']=="mjy")
        var mobiledata="禁用";
    if (strategy['usb_connect']=="ucfjy")
        var usb_connect="非禁用";
    else if(strategy['usb_connect']=="ucjy")
        var usb_connect="禁用";
    if (strategy['usb_debug']=="udfjy")
        var usb_debug="非禁用";
    else if(strategy['usb_debug']=="udjy")
        var usb_debug="禁用";
*/
    //策略内容
    var strategy_content=''
    strategy_content+="camera:"+camera+"，..."+'<br/>';

    var temp="";
    for(var k=0;k<userdesc.length;k++)
    {
        if(userdesc[k]['name']=="所有用户")
            continue;
        temp+=userdesc[k]['name']+userdesc[k]['desc']+'<br/>';
    }
    var txt;
    txt="";
    txt+='<tr class="'+strategy_id+'">';
    txt+='<td><span class="checkbox checkbox_uncheck"></span>';
    txt+='</td><td class="strategy_id">'+i+'</td>';
    txt+='<td>'+strategy['start']+'</td>';
    txt+='<td>'+strategy['end']+'</td>';
    txt+='<td>'+strategy['desc']+'</td>';
    txt+='<td><a onclick="showstrategycontent(this)" style="text-decoration: underline">'+strategy_content+'</a></td>';
    txt+='<td><a onclick="showusers(this)" style="text-decoration: underline">'+temp+'</a></td>';
    txt+='<td class="modify"><button class="'+strategy_id+'" style="padding:0;padding-left:4px;padding-right:4px;margin:4px;font: 16px/1.5em '+"'微软雅黑'"+'" onclick="modifystrategy(this.className)">修改</button>'+'</td>';
    txt+='<td class="delete"><button class="'+strategy_id+'" style="padding:0;padding-left:4px;padding-right:4px;margin:4px;font: 16px/1.5em '+"'微软雅黑'"+'" onclick="delstrategy(this.className)">删除</button>'+'</td>';
    $("#stB tbody").append(txt);
    $(" #strategyB").mCustomScrollbar("update");
    // }else{
    //   loadingStatus("获取策略配置信息失败!",0);
    // }
}

//公共方法，每棵树都调用的控制展开闭合的方法
function show(title){
    //控制群组的展开和闭合
    var div = document.getElementById(title);
    if(div.style.display=="none"){
        div.style.display="block";
    }
    else{
        div.style.display = "none";
    }

}
//联系人下发功能中选择电话号码树的方法
function tcheck(dn){
    //获取进行选择操作的checkbox,并将此群组下的所有checkbox的属性设置为选中
    var oudn = dn.substring(4);//这是取得的群组dn
    var span = document.getElementById(dn);//获得子群组的span
    var div = document.getElementById('t'+oudn);  //获取群组所在的div
    var checkboxs = div.getElementsByTagName("span");
    //找到checkbox对应的a
    var a = document.getElementsByName(dn)[0];
    a.style.color = '#336C98';
    for(var i=0;i<checkboxs.length;i++){
        var type = checkboxs[i].id.substring(0,2);
        var pnumber = checkboxs[i].parentNode.getElementsByTagName("a")[0].className.split(":")[1];
        if(span.className=="checkbox checkbox_uncheck")
        {
            checkboxs[i].setAttribute("class","checkbox checkbox_checked");
            //如果是群组的话，不做出动作

            if(type=='us'){
                var sdn = checkboxs[i].id;
                var uid = checkboxs[i].title;
                delContacts(pnumber)
                addContacts(sdn,uid);
                //添加联系人到右边的显示框
                }

        }else{
            checkboxs[i].setAttribute("class","checkbox checkbox_uncheck");
            delContacts(pnumber);//将联系人从右边的显示框移除
        }


  }
}

function showcontacts($Element,uid,sdn){
    var jh=sdn.substr(0,2);
    var dn=sdn.substr(4);
    var pnumber='';
    if(($Element).tagName=="A")    //如果点击的是文字连接a
    {
        pnumber = ($Element).className.split(":")[1];
        ($Element).style.color='#336C98';
        var sp=document.getElementById(sdn);   //获取id=sdn的object span
        if (sp.className=="checkbox checkbox_checked"){
          sp.setAttribute("class","checkbox checkbox_uncheck");
          delContacts(pnumber);
          return;
        }
        else{
            sp.setAttribute("class","checkbox checkbox_checked");
            delContacts(pnumber);
            addContacts(sdn,uid);
        }
    }
    if(($Element).tagName=="SPAN")
    {
        var a = document.getElementsByName(sdn)[0];
        a.style.color='#336C98';
    }
    if(($Element).tagName=="SPAN" && ($Element).className=="checkbox checkbox_checked")   //如果点击的是span
    {
        var a = document.getElementsByName(sdn)[0];
        a.style.color='#336C98';
        pnumber = a.className.split(":")[1];
        delContacts(pnumber);
       return;
    }
    else{
        var a = document.getElementsByName(sdn)[0];
        a.style.color='#336C98';
        pnumber = a.className.split(":")[1];
        delContacts(pnumber);
        addContacts(sdn,uid);
    }
}

function addContacts(sdn,uid){
    //将选中的联系人信息添加到右边的显示框，需要显示的信息
    //姓名、职位、所属部门、电话号码
    var a = document.getElementsByName(sdn)[0];
    var username = a.innerHTML;
    var job = a.className.split(':')[0];
    var pnumber = a.className.split(':')[1];
    var department = '';
    var fenjie = sdn.split(',');
    for(var i=fenjie.length-1;i>=0;i--){
        if(fenjie[i].substring(0,2)=='ou'){
            department+=fenjie[i].substring(3)+'/';
        }
    }
    department = department.substring(0,department.length-1);
    //勾选显示用户信息
    var txt;
    txt="";
    txt+='<tr class="'+uid+'">';
    txt+='<td><span class="checkbox checkbox_checked"></span></td>';
    txt+='<td>'+username+'</td>';
    txt+='<td>'+job+'</td>';
    txt+='<td>'+department+'</td>';
    txt+='<td class="Pnumber">'+pnumber+'</td>';
    txt+='</tr>';
    $("#ccN tbody").append(txt);
    $("#contacts_cN").mCustomScrollbar("update");
    return;
}

function delContacts(pnumber){
    //将联系人从右边的显示框移除
    $("#ccN tbody tr").each(function(index,element){
        var Pnumber =$(".Pnumber",$(element)).html();
        if(Pnumber==pnumber){
           $(element).remove();
        }
    });
}

function selectAll(id){
    var span = document.getElementById(id);
    if(span.className=='checkbox checkbox_uncheck'){
        $("#ccN tbody tr .checkbox").removeClass("checkbox_uncheck").addClass("checkbox_checked");
    }
    else{
        $("#ccN tbody tr .checkbox").removeClass("checkbox_checked").addClass("checkbox_uncheck");
    }
}
//联系人查询
function search(){
    var input = document.getElementById("search").value;
    if(input==''){
        alert("请输入查询内容");
    }else if(input.TextFilter()!=input){
        alert("您输入了非法字符，请重新输入！");
    }else{
    var elements = document.getElementById("tree");
    elements.innerHTML='';
    showTree();
    //取到用户输入的数据，去遍历整个contacts_list容器中的所有a
    var contacts_list = document.getElementById("tree");

    var a_list = contacts_list.getElementsByTagName("a");
    setTimeout(function(){for(var i=0;i<a_list.length;i++){
        var a = a_list[i];
        if(a.innerHTML==input){

            var name = a.name;
            var type = name.substring(0,2);
            //以上获取了找到的a的name和类型，只要根据类型进行操作即可
            var parent = a.parentNode;
            while(parent.tagName!='SECTION'){

                parent.style.display='block';
                parent = parent.parentNode;
            }
            a.style.color= '#ff0402';
        }
    }},500);
   }
}
//+++ 20150605 过滤特殊字符
String.prototype.TextFilter=function(){
    var pattern=new RegExp("[`~%!@#^=''?~！@#￥……&——‘”“'？*()（），,。.、<>]");
    var rs="";
    for(var i=0;i<this.length;i++){
        rs+=this.substr(i,1).replace(pattern,'');
    }
    return rs;
}
//下发联系人
function sendcontacts(){

    uidlist=[];
    contactlist=[];
    $("#ccN tbody tr .checkbox_checked").each(function(index,element){
        contactlist.push({'uid': element.parentNode.parentNode.className});
    });
    var users = JSON.stringify(contactlist);
    var trees = $("#yic .checkbox_checked");
    $("#yic .checkbox_checked").each(function(index,element1){
        var type = element1.id.substring(0,2);
        if(type=='us'){
            sendcon(element1.title,users);
        }
    });

}

function sendcon(uid,users){
    var org_session_id = $.cookie("org_session_id");
    var obj = {
        _path: '/a/wp/user/send_contacts',
        _methods: 'post',
        param: {
            sid: org_session_id,
            uid:uid,
            users:users
        }
    };
    ajaxReq(obj,function(data) {
        var rt=data.rt;
        if(rt==0){
            loadingStatus("成功下发联系人信息",0);
        }else{
            loadingStatus("下发联系人失败",0);
        }
    },"正在下发联系人信息");
}
//***替换 loopup
function newloopUp(){
    loadingStatus("正在更新用户设备状态",1);
    var uids = new Array();
    $("#yglb tbody tr").each(function(){
        var uid = $(".Telephone",this).html();
        uids.push(uid);
    });
    getDevsInfo(uids);
    if($("#yglb tbody tr").length!=0){
        setTimeout(newloopUp,300000);
    }

}
//***列表统一请求状态
var _s = 1000;
var _m = _s * 60;
var _h = _m * 60;
var _d = _h * 24;
var _mon = _d * 30;
var _y = _mon * 12;
function getDevsInfo(uids){
    var org_session_id = $.cookie("org_session_id");
    var jsonuids=JSON.stringify(uids);
    var obj = {
        _path: '/a/wp/user/get_devs_info',
        _methods: 'get',
        param: {
            sid: org_session_id,
            uids: jsonuids
        }
    };
    ajaxReq(obj,function(data) {
        var rt=data.rt;
        var devs_info = data.devs_info;
        var trs = $("#yglb tbody tr");

        if(rt==0){
            trs.each(function(index,element){
                refreshStatus(index,element);
            });
            function refreshStatus(index,element){
                refresh(index,$(element));			//获取手机的在线状态（传递tr参数）
            }
            function refresh(index,tr){
                (function(tr){
                    var data=devs_info[index];
                    var status = data.status;
                    var lastupdate = data.last_update;
                    var dev=data.dev_id;
                    //alert(status+","+lastupdate+","+index);   //****************
                    if(status===2){
                        $(".zhuangtai",tr).html('<img src="images/online.png" />在线');
                    }else{
                        $(".zhuangtai",tr).html('<img src="images/unonline.png" />离线');
                    }
                    if(dev===''){
                        $(".dev_id",tr).html("设备未激活");
                    }else {
                        $(".dev_id",tr).html(dev);
                    }
                    if(lastupdate===''){
                        $(".lastTime",tr).html("设备未激活");
                    }else {
                        var last_ms = parseInt(lastupdate);
                        var last_time = new Date(last_ms*1000);
                        var new_time = new Date();
                        var qian_time = new_time - last_time;
                        var show_time='';
                        if(qian_time / _y > 1) {
                            show_time = parseInt(qian_time / _y) + "年前"
                        } else if (qian_time / _mon > 1) {
                            show_time = parseInt(qian_time / _mon) + "月前"
                        } else if (qian_time / _d > 1) {
                            show_time = parseInt(qian_time / _d) + "天前"
                        } else if (qian_time / _h > 1) {
                            show_time = parseInt(qian_time / _h) + "小时前"
                        } else if (qian_time / _m > 1) {
                            show_time = parseInt(qian_time / _m) + "分前"
                        } else if (qian_time / _s > 1) {
                            show_time = parseInt(qian_time / _s) + "秒前"
                        } else {
                            show_time = "1秒前";
                        }
                        $(".lastTime",tr).html(show_time);
                    }
                })(tr);
            }
            loadingStatus('更新成功!',0);
        }
        else{
            loadingStatus('更新失败!',0);
        }

    });
}

function setText(select,text){
	select.html(text);
}
//验证一个值是否为空
function verViod(val){
	if(!val.replace(/\s/g,"")){		//如果值为空，则返回false；
		return false;
	}else{		//如果值为非空，则返回true。
		return true;
	}
}
//抽象ajax请求函数
function ajaxReq(obj, func,str) //obj是要发送的数据  url是nodejs接受请求的路径 time是请求允许的时间
{
	$.ajax({
		async: true,
		timeout: 15000,
		type: "POST",
		url: "/f_login",
		data: obj,
		dataType: 'json',
		beforeSend: function(jqXHR) {
			if(!!str){
				loadingStatus(str,1);
			}
		},
		success: function(data) {
			var rt = data.rt;
			switch (rt) {
				case 4:
				case 6:
				case 8:
					$.cookie("org_session_id",null);
					$.cookie("configStatus",null);
					location.href="/f_org_login";
					break;
				default:
					func(data);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			//console.log('解析对像:' + JSON.stringify(jqXHR));
			switch (textStatus) {
				case "timeout":
					//alert("请求超时!", obj._path);
					loadingStatus("请求超时!",0);
					break;
				case "error":
				case null:
					loadingStatus("发生错误，请重试!",0);
					break;
				case "notmodified":
					//alert("notmodified.", obj._path);
					loadingStatus("notmodified!",0);
					break;
				case "parsererror":
					//console.log("parsererror.", obj._path);
					loadingStatus("parsererror!",0);
					break;
				default:
					//alert("未知错误。", obj._path);
					loadingStatus("未知错误!",0);
			}
		}
	});
}

function ajaxReq1(obj, func,str) //obj是要发送的数据  url是nodejs接受请求的路径 time是请求允许的时间
{
    $.ajax({
        async: false,
        timeout: 15000,
        type: "POST",
        url: "/f_login",
        data: obj,
        dataType: 'json',
        beforeSend: function(jqXHR) {
            if(!!str){
                loadingStatus(str,1);
            }
        },
        success: function(data) {
            var rt = data.rt;
            switch (rt) {
                case 4:
                case 6:
                case 8:
                    $.cookie("org_session_id",null);
                    $.cookie("configStatus",null);
                    location.href="/f_org_login";
                    break;
                default:
                    func(data);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            //console.log('解析对像:' + JSON.stringify(jqXHR));
            switch (textStatus) {
                case "timeout":
                    //alert("请求超时!", obj._path);
                    loadingStatus("请求超时!",0);
                    break;
                case "error":
                case null:
                    loadingStatus("发生错误，请重试!",0);
                    break;
                case "notmodified":
                    //alert("notmodified.", obj._path);
                    loadingStatus("notmodified!",0);
                    break;
                case "parsererror":
                    //console.log("parsererror.", obj._path);
                    loadingStatus("parsererror!",0);
                    break;
                default:
                    //alert("未知错误。", obj._path);
                    loadingStatus("未知错误!",0);
            }
        }
    });
}
function pf(sid, dev_id, func) {
	var obj = {
		_path: '/a/wp/user/get_online_status',
		_methods: 'get',
		param: {
			sid: sid,
			dev_id: dev_id
		}
	}
	ajaxReq(obj,function(data) {
		var rt = data.rt;
		var status = data.status;
		if (rt === 0 && status === 2) {
			func();
		} else {
			//loadingStatus('用户不在线,不能执行操作!', 0);

            return;
		}
	})
}
var status='<div id="tanceng"><div id="loadingStatus" style="display:none;font-size:24px"></div></div>';
$(document.body).append(status);
var idArr = null;
function loadingStatus(state, sh) {
    var errTishi = $("#loadingStatus");
	if (idArr != null) {
		clearTimeout(idArr);
		idArr = null;
	}
	errTishi.html(state).fadeIn('fast');
	if (!sh) {
		idArr = setTimeout(hideLoad, 2000);
	}
}

function hideLoad() {
    $("#loadingStatus").fadeOut('fast');
}

//排序
function sortable(index,aid){
    var table = document.getElementById('yglb');
    var tbody = table.tBodies[0];
    var colRows = tbody.rows;
    var aTrs = new Array;
    if(colRows.length==0){
        return;
    }
    else{
        for (var i=0; i < colRows.length; i++) {
            aTrs[i] = colRows[i];
        }

        //现在已经获取到所有的tbody中的数据，要做的就是根据相应的行进行排序
        //表头a标签的class属性中存储现在排序的方法0为顺序，1为逆序
        var aa=document.getElementById(aid);
        //表头索引为5,按照职称进行排序
        if(index==5){
            if(aa.className=='0'){
                aa.className='1';
                var i=aTrs.length-1;
                while(i){
                    for(var j=0;j<i;j++){
                        if(getTitleCode(aTrs[j].cells[index].innerHTML)>getTitleCode(aTrs[j+1].cells[index].innerHTML)){
                            var temp = aTrs[j].innerHTML;
                            aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                            aTrs[j+1].innerHTML = temp;
                        }
                    }
                    i--;
                }
            }
            else{
                aa.className='0';
                var i=aTrs.length-1;
                while(i){
                    for(var j=0;j<i;j++){
                        if(getTitleCode(aTrs[j].cells[index].innerHTML)<=getTitleCode(aTrs[j+1].cells[index].innerHTML)){
                            var temp = aTrs[j].innerHTML;
                            aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                            aTrs[j+1].innerHTML = temp;
                        }
                    }
                    i--;
                }

            }

        }
        else if(index==6){
            if(aa.className=='0'){
                aa.className='1';
                var i=aTrs.length-1;
                while(i){
                    for(var j=0;j<i;j++){
                        if(getDeCode(aTrs[j].cells[index].innerHTML)>getDeCode(aTrs[j+1].cells[index].innerHTML)){
                            var temp = aTrs[j].innerHTML;
                            aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                            aTrs[j+1].innerHTML = temp;
                        }
                        if(getDeCode(aTrs[j].cells[index].innerHTML)==getDeCode(aTrs[j+1].cells[index].innerHTML)){
                            if(getTitleCode(aTrs[j].cells[index-1].innerHTML)>=getTitleCode(aTrs[j+1].cells[index-1].innerHTML)){
                                var temp = aTrs[j].innerHTML;
                                aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                                aTrs[j+1].innerHTML = temp;
                            }
                        }
                    }
                    i--;
                }
            }
            else{
                aa.className='0';
                var i=aTrs.length-1;
                while(i){
                    for(var j=0;j<i;j++){
                        if(getDeCode(aTrs[j].cells[index].innerHTML)<getDeCode(aTrs[j+1].cells[index].innerHTML)){
                            var temp = aTrs[j].innerHTML;
                            aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                            aTrs[j+1].innerHTML = temp;
                        }
                        if(getDeCode(aTrs[j].cells[index].innerHTML)==getDeCode(aTrs[j+1].cells[index].innerHTML)){
                            if(getTitleCode(aTrs[j].cells[index-1].innerHTML)<getTitleCode(aTrs[j+1].cells[index-1].innerHTML)){
                                var temp = aTrs[j].innerHTML;
                                aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                                aTrs[j+1].innerHTML = temp;
                            }
                        }
                    }
                    i--;
                }

            }
        }
        else{
            if(aa.className=='0'){
                aa.className='1';
                var i=aTrs.length-1;
                while(i){
                    for(var j=0;j<i;j++){
                        if(aTrs[j].cells[index].innerHTML.localeCompare(aTrs[j+1].cells[index].innerHTML)>0){
                            var temp = aTrs[j].innerHTML;
                            aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                            aTrs[j+1].innerHTML = temp;
                        }
                    }
                    i--;
                }
            }
            else if(aa.className=='1'){
                aa.className='0';
                var i=aTrs.length-1;
                while(i){
                    for(var j=0;j<i;j++){
                        if(aTrs[j].cells[index].innerHTML.localeCompare(aTrs[j+1].cells[index].innerHTML)<=0){
                            var temp = aTrs[j].innerHTML;
                            aTrs[j].innerHTML = aTrs[j+1].innerHTML;
                            aTrs[j+1].innerHTML = temp;
                        }
                    }
                    i--;
                }
            }
        }
    }
}



//判断是否有权限在当前页面(后来加的)
function judgeyemianqx(){
    var sid=$.cookie("org_session_id");
    var obj={
        _path:"/a/wp/org/org_info",
        _methods:"get",
        param:{
            sid:sid
        }
    };
    ajaxReq(obj,function(data){
        var rt=data.rt;
//        var uid=$.cookie("userid");
//        var loginType=$.cookie("loginType");
        if(rt==0){
            //判断是否是当前用户该在的页面
        }else{
            location.href="/f_org_login";
        }
    },"正在获取管理员信息!");
}

/*修改用户信息 20150326*/
function mloadselect(){
    var uid=$.cookie("userid");
    $("#modUser .ot #mldapou").empty();
    $("#modUser .ot #mldapou").append("<option value='请选择'>请选择</option>");
    if(uid != "admin")
    {
        var ou = $.cookie("yicid").split(",")[0].split("=")[1];
        $("#modUser .ot #mldapou").empty();
        $("#modUser .ot #mldapou").append("<option value='"+ou+"'>"+ou+"</option>");
    }
    else
    {
        var sid=$.cookie("org_session_id");
        var oudn="dc=test,dc=com";
        var txt=loadous(sid,oudn);
        $("#modUser .ot #mldapou").append(txt);
    }
    document.getElementById('mldapou').className="dc=test,dc=com";
    document.getElementById('mldapou').onchange = function(){
        loadnextous(document.getElementById('mldapou'));
    };
}
function loadous(sid,oudn){
    var obj={
        _path:"/a/wp/org/ldap_onelevel",
        _methods:"get",
        param:{
            sid:sid,
            oudn:oudn
        }
    };
    var txt="";
    ajaxReq1(obj,function(data){
        var ous=data.ous;
        if(data.rt==0){
            for(var i=0;i<ous.length;i++)
            {
                txt+="<option value='"+ous[i].ou+"'>"+ous[i].ou+"</option>";
            }
        }else{
        }
    },"");
    return txt;
}
function loadnextous(element){
    var span=document.getElementById('modbm');
    var seletes=span.children;
    var classname=element.className;
    for(var i=seletes.length-1;i>0;i--)
    {
        if(seletes[i].className.indexOf(classname)>0)
        {
            span.removeChild(seletes[i]);
        }
    }
    if(element.value == "请选择")
    {
        return;
    }
    var oudn="ou="+element.value+","+element.className;
    var txt="";
    var obj={
        _path:"/a/wp/org/ldap_onelevel",
        _methods:"get",
        param:{
            sid:$.cookie("org_session_id"),
            oudn:oudn
        }
    };
    ajaxReq(obj,function(data){
        var ous=data.ous;
        if(ous.length>0)
        {
            var st="<select onchange='loadnextous(this)'class='"+oudn+"' id='st"+oudn+"'></select>";
            $("#modbm").append(st);
            if(data.rt==0){
                document.getElementById("st"+oudn).options.add(new Option("请选择","请选择"));
                for(var i=0;i<ous.length;i++)
                {
                    document.getElementById("st"+oudn).options.add(new Option(ous[i].ou,ous[i].ou));
                }
            }
        }
        else{
            var span=document.getElementById('modbm');
        }
    },"");
}
//修改用户
$("#muserinfo").submit(function(event){
    event.preventDefault();
    var username=$("#mname").val();
    var email = $("#memail").val();
    var zhiW = $("#mzhiw").val();
    var zhiC = $("#mzhic").val();
    var mobile = 'Y';
    //姓名监测
    if(!verViod(username)){
        loadingStatus("用户名不能为空!");
        return false;
    }else if(username.TextFilter()!=username){
        alert("用户名不得含有特殊字符！");
        return false;
    }
    //邮箱监测
    if(!verViod(email)){
        loadingStatus("邮箱不能为空!");
        return false;
    }
    if (!checkemail(email)){
        loadingStatus("邮箱格式不对!");
        return false;
    }
    //构造职位/职称
    var title="";
    if (zhiW == "无")
    {
        if (zhiC == "无")
            title = "无";
        else
            title = zhiC;
    }
    else
    {
        if (zhiC == "无")
            title = zhiW;
        else
            title = zhiW+'/'+zhiC;
    }
    //判定所属部门
    var ou = [];
    var span = document.getElementById("modbm");
    var selects = span.getElementsByTagName("select");
    if(selects.length<=1 && selects[0].value == "请选择")
    {
        loadingStatus("所属部门不能为空！！！");
        return false;
    }
    for(var i=selects.length-1;i>=0;i--)
    {
        if(selects[i].value != "请选择")
        {
            ou.push("ou="+selects[i].value);
        }
    }
    //获得待修改用户(根据括号格式)
    var pnumber=this.className;
    if(!pnumber.length){
        loadingStatus("请激活待修改信息的用户!",0);
        return false;
    }
    var obj={
        _path:"/a/wp/org/ldap_mod_user",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            username:username,
            email:email,
            mobile:mobile,
            pnumber:pnumber,//获取当前锁定的用户
            title:title,
            dn:ou.join(',')
        }
    };
    ajaxReq(obj,function(data){
        if(data.rt==0){
            sessionStorage.clear();   //******************************//
            loadingStatus("用户修改成功！");
            window.location.reload();
        }
        else {
            loadingStatus("用户添加失败！");
        }

    },"正在提交...");

});
//获取勾选设备pnumber(uid)
function check_uid(){
    var arr=[];
    var that;
    $("#yglb tbody tr .checkbox_checked").each(function(index,element){
        var that=$(element).parent().parent();
        if(($(".Telephone",that).html()!='undefined')){
            arr.push($(".Telephone",that).html());
        }
    });
    return arr;
}
//邮箱规则判断
function checkemail(email)
{
    var rg = new RegExp('^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])');
    if( !rg.test(email))
        return false;
    return true;
}
// JavaScript Document
var pInfo=[
	{
		title:'1. 海云手机版本',
		firmware_version : "固件版本",
		model_number : "型号号码",
		version_number : "版本号码"
	},
	{
		title:'2. 电话通讯',
		imei : "IMEI",
		imei_version : "IMEI软件版本",
		sim_supplier : "SIM供应商",
		sim_sn : "SIM序列号",
		sim_state : "SIM插入状态",
		signal_strength : "信号强度",
		network_providers : "网络供应商",
		network_type : "网络类型",
		phone_type : "手机类型（手机制式）",
		call_status : "通话状态"
	},
	{
		title:'3. 无线网络',
		wifi_bssid : "WIFI BSSID",
		wifi_ip_addr : "WIFI IP地址",
		wifi_mac_addr : "WIFI MAC地址",
		wifi_rssi : "WIFI RSSI",
		wifi_ssid : "WIFI SSID",
		wifi_network_id : "WIFI 网络id",
		wifi_request_status : "WIFI 请求状态",
		wifi_conn_speed : "WIFI 连接速度"
	},
	{
		title:'4. 蓝牙',
		bluetooth_is_on : "蓝牙是否打开",
		bluetooth_is_search : "蓝牙是否搜索中",
		bluetooth_name : "蓝牙名称",
		bluetooth_addr : "蓝牙地址",
		bluetooth_status : "蓝牙状态",
		bluetooth_pair_dev : "蓝牙配对设备"
	},
	{
		title:'5. 电源',
		battery_status : "电池状态",
		battery_power : "现时电量",
		battery_voltage : "电压",
		battery_temperature : "电池温度",
		battery_technology : "电池技术",
		battery_life : "电池寿命"
	},
	{
		title:'6. 网络',
		data_activity_status : "数据活动状态",
		data_conn_status : "数据连接状态"
	},
	{
		title:'7. 音响',
		call_volume : "通话音量",
		system_volume : "系统音量",
		ring_volume : "铃声音量",
		music_volume : "音乐音量",
		tip_sound_volume : "提示声音音量"
	},
	{
		title:'8. 位置',
		longitude : "经度",
		latitude : "纬度",
		pos_corrention_time : "位置修正时间"
	}
];
//策略冲突计时用的计数器
var count = 0;

$(document).ready(function(e) {

	//为添加了.jscroll类的元素添加滚动条。
	$(".jscroll").mCustomScrollbar({
		updateOnContentResize: true
	});				//添加了jscroll类的元素添加滚动。
	//支持设备管理页面的tab
	$("#xinxiTab a").live("click",function(event){
		var id=$(this).attr("href");
		$("#xinxiTab a").removeClass("tabHover");
		$(this).addClass("tabHover");
		$("#xList .tabw").hide();
		$(id).show().mCustomScrollbar("update");
		return false;
	})
	//点击部门的时候显示所有设备
	$("#all").click(function(event){
		event.preventDefault();
		$("#yglb tbody tr").show();
	});
    //点击删除用户
    $("#delusers").live('click',function(event){
//        alert("1111111111111");
        if ($("#yglb tbody tr .checkbox_checked").length<1)
        {
            loadingStatus("请先选择需要删除的用户！",0);
            return false;
        }
        popd.attr("href","#delete");
        popd.click();
    })
    	//$("#yic li").live("click",function(event){
		//var cla=this.className;
		//$("#yglb tbody tr").hide();
		//$("#yglb tbody tr."+cla).show();
	//});

    //选择全部的按钮
    $("#xzqb").live("click",function(event){
        if($("#yglb tbody tr").children("td").length==0){
            alert("请在左侧选取用户");//jquery搜索标签并对标签进行操作的过程基本上都是用的函数
        }
        else{
            $("#yglb tbody tr .checkbox").removeClass("checkbox_uncheck").addClass("checkbox_checked");
            $("#gnan .tog").show();
            devPostion();
        }
    })
    //空出选择的按钮
    $("#kcxz").live("click",function(event){
        $("#yglb tbody tr .checkbox").removeClass("checkbox_checked").addClass("checkbox_uncheck");
        $("#gnan .tog").hide();
        devPostion();
        initCon();
    })
    //点击每一个设备所在的表格的时候做出相应
    $("#yglb tbody tr").live("click",function(event){
        event.preventDefault();
        var that=$(this);
        var dev_id=$(".dev_id",that).html();
        var user_id=$(".Telephone",that).html();

        var checkbox=this.getElementsByTagName("span")[0];
        $("#muserinfo").removeClass();   //+++ 20150415 for mod user
        if(checkbox.className=="checkbox checkbox_checked"){
            checkbox.className="checkbox checkbox_uncheck";
            $("#currentUser").html("");   //+++ 20150413 当前用户
        }
        else{
            checkbox.className="checkbox checkbox_checked";
            $("#muserinfo").addClass(user_id);   //+++ 20150415 for mod user
        }
        var user=this.getElementsByTagName('td')[2].innerHTML;
        var images=$("#yglb tbody tr .lock");
        for(var i=0;i<images.length;i++)
        {
            images[i].src="images/unlock.png";
            images[i].alt="unlock";   //+++20150327
        }
        var imag=this.getElementsByTagName('img')[1];
        if (checkbox.className=="checkbox checkbox_checked"){
            imag.src="images/lock.png";
            imag.alt="lock";   //+++20150327
        }
        //+++20150415   只显示锁定者
        if(imag.alt=="lock"){
            devPostion();
            loadDetails(dev_id);
            loadApp(dev_id);
            loadDateLog(dev_id);
            loadDevStrategy(user_id);
            //更新状态时间 +++20150527
            var refresh=$.cookie("refresh");
            var refresh_time="更新时间："+refresh;
            var cur_user="<span id='cur_usr' class='"+user_id+"'>当前用户："+$(".username",that).html()+"("+user_id+")"+"</span><span style='font-weight:100;float:right;margin-right:1%'>"+refresh_time+"</span>";   //+++20150413 当前用户
            $("#currentUser").html(cur_user);   //+++ 20150413 当前用户
        }else{
            imag.src="images/unlock.png";
            imag.alt="unlock";
            initCon();
        }
        //+++ 20150506
        function initCon(){
            $("#xiCont table tbody").html("");	//首先添加头
            $("#xiCont").mCustomScrollbar("update");//添加之后更新滚动
            $("#straList table tbody").html("");	//首先添加头
            $("#straList").mCustomScrollbar("update");//添加之后更新滚动
            $("#appInfo table tbody").html("");	//首先添加头
            $("#appInfo").mCustomScrollbar("update");//添加之后更新滚动
            $("#logData table tbody").html("");	//首先添加头
            $("#logData").mCustomScrollbar("update");//添加之后更新滚动
        }
    });

	//通过电话或者邮件过滤设备
	$("#guolv").bind("keyup",flushDev);
	function flushDev(event){
		var value=$(this).val();
		if(!!value){	//如果value非空，则隐藏所有tr，只显示匹配tr。
			$("#yglb tbody tr").hide();
			$("#yglb tbody tr").each(function(index,element){
				var trText=$(element).text();
				if(trText.indexOf(value)>-1){
					$(element).show();
				}
			})
		}else{		//反之，则显示所有tr。
			$("#yglb tbody tr").show();
		}
		
	}
	//点击复选框不会刷新设备状态。
	$("#yglb tbody tr .checkbox").live("click",function(event){
		var dev_idArr=check_dev_id();
		var len=dev_idArr.length;
		if(len>0){
			$("#gnan .tog").show();
		}else{
			$("#gnan .tog").hide();
		}
		return false;
//        $("#gnan .tog").show();
	});
	//通过勾选筛选出dev—id
	function check_dev_id(){
		var arr=[];
		var that;
		$("#yglb tbody tr .checkbox_checked").each(function(index,element){
			var that=$(element).parent().parent();
            if($(".dev_id",that).html()!='设备未激活'){
                arr.push($(".dev_id",that).html());
            }
		});
		return arr;
	}

    function check_dev_id_and_user(){
        var arr=[];
        var that;
        $("#yglb tbody tr .checkbox_checked").each(function(index,element){
            var that=$(element).parent().parent();
            if($(".dev_id",that).html()!='设备未激活'){
                if($(".username",that).html()!='')
                    arr.push({"dev_id":$(".dev_id",that).html(),"username":$(".username",that).html()});
                else
                    arr.push({"dev_id":$(".dev_id",that).html(),"username":"unknow"});
            }
        });
        return arr;
    }
	//
	var popd=$("#popd");
	$("#gnan .tog").click(function(event){
		var id=event.target.id;
		var href="";
		switch(id){
			case "jihuo":
			href="#tuisong";
			break;
			case "lock":
			href="#suoding";
			break;
            case "unlock":
            href="#jiesuo";
            break;
			case "shanchu":
			href="#qingchu";
			break;
            case "updatesys":
            href="#upsys";
            break;
            case "delusers":
            href="#delete";
            break;
			case "qccelue":
			href="#qchu";
            break;
            case "devControl":
            setallrespons(0);
            href="#DevControl";
			break;
			default:
			href="#";
		}
		popd.attr("href",href);
		popd.click();
	});
    //清除硬件管控所有标识位
    function setallrespons(res){
        var org_session_id = $.cookie("org_session_id");
        var arr=check_dev_id();
        for(var i=0,len=arr.length;i<len;i++){
            var dev_id=arr[i];
            var obj={
                _path: '/a/wp/user/set_all_respons',
                _methods: 'post',
                param:{
                    sid:org_session_id,
                    dev_id:dev_id,
                    rs:res
                }
            };
            ajaxReq(obj,function(data){
                var rt=data.rt;
                if(rt==0){
                    loadingStatus("标识位复位成功!",0);
                }else{
                    loadingStatus("标志位复位出错!",0);
                }
            },"设备标志位正在复位...");
        }
    }
    //清除所有策略 改20150511
	$("#lsf").submit(function(event){
		event.preventDefault();
		$("#qchu").dialog("close");
		var org_session_id=$.cookie("org_session_id");
		var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: 'qccl'
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("策略清除指令下发成功!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'qccl');},5000);
            }else if(rt==12){
                loadingStatus("操作过于频繁，请稍后再试!",0);
            }else{
                loadingStatus("指令下发失败!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'qccl');},1000);
            }
        },"正在执行...");
	});
	//否定清除策略 改20150511
	$("#bqc").click(function(event) {
		$("#qchu").dialog("close");
	});
	//清除
	$("#lsth").submit(function(event){
		event.preventDefault();
		$("#qingchu").dialog("close");
		var org_session_id=$.cookie("org_session_id");
		var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: 'reset'
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("清除工作数据指令已下发!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'reset');},5000);
            }else{
                loadingStatus("清除工作数据指令下发失败!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'reset');},1000);
            }
        },"正在清除工作数据!");
//		for(var i=0,len=arr.length;i<len;i++){
//			var dev_id=arr[i];
//			var obj={
//				_path: '/a/wp/user/send_cmd',
//				_methods: 'post',
//				param: {
//					sid: org_session_id,
//					dev_id: dev_id, //测试设备。
//					cmd: 'reset'
//				}
//			};
//			ajaxReq(obj,function(data){
//				var rt=data.rt;
//				if(rt==0){
//					loadingStatus("已经清除工作数据!",0);
//				}else{
//					loadingStatus("清除工作数据失败!",0);
//				}
//			},"正在清除工作数据!");
//		}
	})
	//拒绝拒绝清除的按钮。
	$("#bqingchu").click(function(event) {
		$("#qingchu").dialog("close");
	});
    //更新系统
    $("#lsup").submit(function(event){
        event.preventDefault();
        $("#upsys").dialog("close");
        var app_id="com.singuloid.secphone.apk,5";
        var app_idss = [];
        app_idss.push(app_id);
        sendsys(app_idss);
    })

    function sendsys(app_idss){
        var users = [];
        var nodes = $("#yic .checkbox_checked");
        for (var i=0;i<nodes.length;i++){
            if(nodes[i].title)
            {
                users.push(nodes[i].title);
            }
        }
        users = JSON.stringify(users);
        app_ids = JSON.stringify(app_idss   );
        if (users!="[]"){
            var obj={
                _path:"/a/was/send_app",
                _methods:"post",
                param:{
                    sid:$.cookie("org_session_id"),
                    app_ids:app_ids,
                    users:users
                }
            };
            ajaxReq(obj,function(data){
                var rt=data.rt;
                if(rt == 0)
                {
                    loadingStatus("推送更新系统成功!",0);

                }else{
                    loadingStatus("推送更新系统失败!",0);
                }
            },"正在推送更新...");
        }
    }

    //拒绝更新系统的按钮。
    $("#bupsys").click(function(event) {
        $("#upsys").dialog("close");
    });
    //删除用户
    $("#lsscyh").submit(function(event){
        event.preventDefault();
        $("#delete").dialog("close");
        var org_session_id=$.cookie("org_session_id");
        var arr = check_telephone();
        for(var i=0,len=arr.length;i<len;i++){
            var uid=arr[i];
            var obj={
                _path: '/a/wp/org/ldap_del_user',
                _methods: 'post',
                param: {
                    sid: org_session_id,
                    uid:uid
                }
            };
            ajaxReq(obj,function(data){
                var rt=data.rt;
                if(rt==0){
                    sessionStorage.clear();   //**********************************//
                    loadingStatus("已经清除工作数据!",0);
//                    alert(data.dn);
                    //删除列表中对应项
//                    alert( $("#yglb tbody tr .checkbox_checked").length);
                    $("#yglb tbody tr .checkbox_checked").each(function(index,element){
                        var tr = $(element).parent().parent();
                        tr.hide();
                    $("#shebeiB").mCustomScrollbar("update")
                    });
                    //需要重新加载树,清除原来的数据
                    $("#yic").html("");
                    home(true);
                }else{
                    loadingStatus("清除工作数据失败!",0);
                }
            },"正在清除工作数据...");
        }
    })
    function check_telephone(){
        var arr=[];
//        var that;
        $("#yglb tbody tr .checkbox_checked").each(function(index,element){
            var that=$(element).parent().parent();
            if($(".Telephone",that).html()!=''){
                arr.push($(".Telephone",that).html());
            }
        });
        return arr;
    }

    //拒绝删除用户
    $("#bScyh").click(function(event) {
        $("#delete").dialog("close");
    });
	//锁定设备
	$("#lst").submit(function(event){
		event.preventDefault();
		$("#suoding").dialog("close");
		var org_session_id = $.cookie("org_session_id");
		var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: 'lockscreen'
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("锁定指令下发成功!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'lockscreen');},5000);
            }else{
                loadingStatus("锁定指令下发失败!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'lockscreen');},1000);
            }
        },"正在锁定设备...")
//		for(var i=0,len=arr.length;i<len;i++){
//			var dev_id=arr[i];
//				var obj={
//					_path: '/a/wp/user/send_cmd',
//					_methods: 'post',
//					param:{
//						sid:org_session_id,
//						dev_id:dev_id,
//						cmd:'lockscreen'
//					}
//				};
//				ajaxReq(obj,function(data){
//					var rt=data.rt;
//					if(rt==0){
//						loadingStatus("锁定成功!",0);
//					}else{
//						loadingStatus("锁定失败!",0);
//					}
//				},"正在锁定设备...")
//		}
	})
	//退出锁定（不锁定）
	$("#bSuoding").click(function(event) {
		$("#suoding").dialog("close");
	});
    //一键解锁设备
    $("#lsut").submit(function(event){
        event.preventDefault();
        $("#jiesuo").dialog("close");
        var org_session_id = $.cookie("org_session_id");
        var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: 'unlockscreen'
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("解锁指令下发成功!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'unlockscreen');},5000);
            }else{
                loadingStatus("解锁指令下发失败!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'unlockscreen');},1000);
            }
        },"正在强制解锁...")
//        for(var i=0,len=arr.length;i<len;i++){
//            var dev_id=arr[i];
//            var obj={
//                _path: '/a/wp/user/send_cmd',
//                _methods: 'post',
//                param:{
//                    sid:org_session_id,
//                    dev_id:dev_id,
//                    cmd:'unlockscreen'
//                }
//            };
//            ajaxReq(obj,function(data){
//                var rt=data.rt;
//                if(rt==0){
//                    loadingStatus("解锁成功!",0);
//                }else{
//                    loadingStatus("解锁失败!",0);
//                }
//            },"正在强制解锁...")
//        }
    })
    //退出解锁
    $("#bJiesuo").click(function(event) {
        $("#jiesuo").dialog("close");
    });
	//推送通知
	$("#lso").submit(function(event){
		event.preventDefault();
		var $purl = $("#purl"); //取得通知信息字段
		var url = $purl.val()+"(阅后即焚)"; //获得url。
        if (!url.replace(/\s/g, "")) {
			loadingStatus("通知内容不能为空!", 0);
			return false;
		}
		var org_session_id = $.cookie("org_session_id");
		var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: 'url '+url
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("推送完成!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'url '+url);},5000);
            }else{
                loadingStatus("推送失败!",0);
                setTimeout(function(){check_cmd_result(org_session_id,'url '+url);},1000);
            }
        },"正在推送链接!");
//		for(var i=0,len=arr.length;i<len;i++){
//			var obj={
//				_path: '/a/wp/user/send_cmd',
//				_methods: 'post',
//				param: {
//					sid: org_session_id,
//					dev_id: arr[i],
//					cmd: 'url ' + url
//				}
//			};
//			ajaxReq(obj,function(data){
//				var rt=data.rt;
//				if(rt==0){
//					loadingStatus("推送完成!",0);
//				}else{
//					loadingStatus("推送失败!",0);
//				}
//			},"正在推送链接!");
//		}
		$("#tuisong").dialog("close");
        $("#purl").val("");
	});
	//关闭窗口时，清空数据
    $("#urlExit").click(function(event) {
        $("#tuisong").dialog("close");
        $("#purl").val("");
    });
    //硬件设备管理
    //这几个函数的作用是首先在用户点击一下胶囊时激活胶囊，用户即可控制胶囊的状态，否则如果胶囊有默认的开闭状态的话会发出不必要的命令
    $("#wifiCon").click(function(event){
        var wifi = document.getElementById("wifiCon");
        if(wifi.className=='jiaonang jiaonang_disabled'){
            wifi.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    $("#blthCon").click(function(event){
        var blth = document.getElementById("blthCon");
        if(blth.className=='jiaonang jiaonang_disabled'){
            blth.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    $("#cameraCon").click(function(event){
        var camera = document.getElementById("cameraCon");
        if(camera.className=='jiaonang jiaonang_disabled'){
            camera.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    $("#tapeCon").click(function(event){
        var tape = document.getElementById("tapeCon");
        if(tape.className=='jiaonang jiaonang_disabled'){
            tape.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    $("#gpsCon").click(function(event){
        var gps = document.getElementById("gpsCon");
        if(gps.className=='jiaonang jiaonang_disabled'){
            gps.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    $("#mobiledataCon").click(function(event){
        var mobiledata = document.getElementById("mobiledataCon");
        if(mobiledata.className=='jiaonang jiaonang_disabled'){
            mobiledata.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    $("#usbcCon").click(function(event){
        var usb_connect = document.getElementById("usbcCon");
        if(usb_connect.className=='jiaonang jiaonang_disabled'){
            usb_connect.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    $("#usbdCon").click(function(event){
        var usb_debug = document.getElementById("usbdCon");
        if(usb_debug.className=='jiaonang jiaonang_disabled'){
            usb_debug.setAttribute("class","jiaonang jiaonang_close");
        }
    });
    //sms send cmd 4.8
    $("#sDevcon").live('click',function(event) {
        event.preventDefault();
        $("#DevControl").dialog("close");
        var wifi = document.getElementById("wifiCon");
        var bluetooth = document.getElementById("blthCon");
        var camera = document.getElementById("cameraCon");
        var gps = document.getElementById("gpsCon");
        var tape = document.getElementById("tapeCon");
        var mobiledata = document.getElementById("mobiledataCon");
        var usb_connect = document.getElementById("usbcCon");
        var usb_debug = document.getElementById("usbdCon");

        if(wifi.className=="jiaonang jiaonang_open"){
            sendDevCmd('wfjy');//具体格式待商议
            document.getElementById('stramesg').className='wfjy';
            searchres('wifi','wfjy');
        }
        if(wifi.className=="jiaonang jiaonang_close"){
            sendDevCmd('wjy');
            document.getElementById('stramesg').className='wjy';
            searchres('wifi','wjy');
        }
        if(bluetooth.className=="jiaonang jiaonang_open"){
            sendDevCmd('bfjy');
            document.getElementById('bstramesg').className='bfjy';
            searchres('bluetooth','bfjy');
        }
        if(bluetooth.className=="jiaonang jiaonang_close"){
            sendDevCmd('bjy');
            document.getElementById('bstramesg').className='bjy';
            searchres('bluetooth','bjy');
        }
        if(camera.className=="jiaonang jiaonang_open"){
            sendDevCmd('cfjy');
            document.getElementById('cstramesg').className="cfjy";
            searchres('camera','cfjy')
        }
        if(camera.className=="jiaonang jiaonang_close"){
            sendDevCmd('cjy');
            document.getElementById('cstramesg').className='cjy';
            searchres('camera','cjy')
        }
        if(tape.className=="jiaonang jiaonang_open"){
            sendDevCmd('tfjy');
            document.getElementById('tstramesg').className="tfjy";
            searchres('tape','tfjy')
        }
        if(tape.className=="jiaonang jiaonang_close"){
            sendDevCmd('tjy');
            document.getElementById('tstramesg').className='tjy';
            searchres('tape','tjy')
        }
        if(gps.className=="jiaonang jiaonang_open"){
            sendDevCmd('gfjy');
            document.getElementById('gstramesg').className="gfjy";
            searchres('gps','gfjy')
        }
        if(gps.className=="jiaonang jiaonang_close"){
            sendDevCmd('gjy');
            document.getElementById('gstramesg').className='gjy';
            searchres('gps','gjy')
        }
        if(mobiledata.className=="jiaonang jiaonang_open"){
            sendDevCmd('mfjy');
            document.getElementById('mstramesg').className="mfjy";
            searchres('mobiledata','mfjy')
        }
        if(mobiledata.className=="jiaonang jiaonang_close"){
            sendDevCmd('mjy');
            document.getElementById('mstramesg').className='mjy';
            searchres('mobiledata','mjy')
        }
        if(usb_connect.className=="jiaonang jiaonang_open"){
            sendDevCmd('ucfjy');
            document.getElementById('ucstramesg').className="ucfjy";
            searchres('usb_connect','ucfjy')
        }
        if(usb_connect.className=="jiaonang jiaonang_close"){
            sendDevCmd('ucjy');
            document.getElementById('ucstramesg').className='ucjy';
            searchres('usb_connect','ucjy')
        }
        if(usb_debug.className=="jiaonang jiaonang_open"){
            sendDevCmd('udfjy');
            document.getElementById('udstramesg').className="udfjy";
            searchres('usb_debug','udfjy')
        }
        if(usb_debug.className=="jiaonang jiaonang_close"){
            sendDevCmd('udjy');
            document.getElementById('udstramesg').className='udjy';
            searchres('usb_debug','udjy')
        }

        $("#wifiCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#blthCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#tapeCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#cameraCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#gpsCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#mobiledataCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#usbcCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#usbdCon").removeClass().addClass("jiaonang jiaonang_disabled");
    });

    $("#qDevcon").live('click',function(event) {
        event.preventDefault();
        $("#DevControl").dialog("close");
        var wifi = document.getElementById("wifiCon");
        var bluetooth = document.getElementById("blthCon");
        var camera = document.getElementById("cameraCon");
        var gps = document.getElementById("gpsCon");
        var tape = document.getElementById("tapeCon");
        var mobiledata = document.getElementById("mobiledataCon");
        var usb_connect = document.getElementById("usbcCon");
        var usb_debug = document.getElementById("usbdCon");

        if(wifi.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('wfjy');//具体格式待商议
        }
        if(wifi.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('wjy');
        }
        if(bluetooth.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('bfjy');
        }
        if(bluetooth.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('bjy');
        }
        if(camera.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('cfjy');
        }
        if(camera.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('cjy');
        }
        if(tape.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('tfjy');
        }
        if(tape.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('tjy');
        }
        if(gps.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('gfjy');
        }
        if(gps.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('gjy');
        }
        if(mobiledata.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('mfjy');
        }
        if(mobiledata.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('mjy');
        }
        if(usb_connect.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('ucfjy');
        }
        if(usb_connect.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('ucjy');
        }
        if(usb_debug.className=="jiaonang jiaonang_open"){
            sendDevCmdSms('udfjy');
        }
        if(usb_debug.className=="jiaonang jiaonang_close"){
            sendDevCmdSms('udjy');
        }

        $("#wifiCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#blthCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#tapeCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#cameraCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#gpsCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#mobiledataCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#usbcCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#usbdCon").removeClass().addClass("jiaonang jiaonang_disabled");
    });

//    $("#lsdc").submit(function(event){
//        event.preventDefault();
//        $("#DevControl").dialog("close");
//        var wifi = document.getElementById("wifiCon");
//        var bluetooth = document.getElementById("blthCon");
//        var camera = document.getElementById("cameraCon");
//        var gps = document.getElementById("gpsCon");
//        var tape = document.getElementById("tapeCon");
//        var mobiledata = document.getElementById("mobiledataCon");
//        var usb_connect = document.getElementById("usbcCon");
//        var usb_debug = document.getElementById("usbdCon");
//
//        if(wifi.className=="jiaonang jiaonang_open"){
//            sendDevCmd('wfjy');//具体格式待商议
//            document.getElementById('stramesg').className='wfjy';
//            searchres('wifi','wfjy');
//        }
//        if(wifi.className=="jiaonang jiaonang_close"){
//            sendDevCmd('wjy');
//            document.getElementById('stramesg').className='wjy';
//           searchres('wifi','wjy');
//       }
//        if(bluetooth.className=="jiaonang jiaonang_open"){
//            sendDevCmd('bfjy');
//            document.getElementById('bstramesg').className='bfjy';
//           searchres('bluetooth','bfjy');
//        }
//        if(bluetooth.className=="jiaonang jiaonang_close"){
//            sendDevCmd('bjy');
//            document.getElementById('bstramesg').className='bjy';
//            searchres('bluetooth','bjy');
//        }
//        if(camera.className=="jiaonang jiaonang_open"){
//            sendDevCmd('cfjy');
//            document.getElementById('cstramesg').className="cfjy";
//            searchres('camera','cfjy')
//        }
//        if(camera.className=="jiaonang jiaonang_close"){
//            sendDevCmd('cjy');
//            document.getElementById('cstramesg').className='cjy';
//            searchres('camera','cjy')
//        }
//        if(tape.className=="jiaonang jiaonang_open"){
//            sendDevCmd('tfjy');
//            document.getElementById('tstramesg').className="tfjy";
//            searchres('tape','tfjy')
//        }
//        if(tape.className=="jiaonang jiaonang_close"){
//            sendDevCmd('tjy');
//            document.getElementById('tstramesg').className='tjy';
//            searchres('tape','tjy')
//        }
//        if(gps.className=="jiaonang jiaonang_open"){
//            sendDevCmd('gfjy');
//            document.getElementById('gstramesg').className="gfjy";
//            searchres('gps','gfjy')
//        }
//        if(gps.className=="jiaonang jiaonang_close"){
//            sendDevCmd('gjy');
//            document.getElementById('gstramesg').className='gjy';
//            searchres('gps','gjy')
//        }
//        if(mobiledata.className=="jiaonang jiaonang_open"){
//            sendDevCmd('mfjy');
//            document.getElementById('mstramesg').className="mfjy";
//            searchres('mobiledata','mfjy')
//        }
//        if(mobiledata.className=="jiaonang jiaonang_close"){
//            sendDevCmd('mjy');
//            document.getElementById('mstramesg').className='mjy';
//            searchres('mobiledata','mjy')
//        }
//        if(usb_connect.className=="jiaonang jiaonang_open"){
//            sendDevCmd('ucfjy');
//            document.getElementById('ucstramesg').className="ucfjy";
//            searchres('usb_connect','ucfjy')
//        }
//        if(usb_connect.className=="jiaonang jiaonang_close"){
//            sendDevCmd('ucjy');
//            document.getElementById('ucstramesg').className='ucjy';
//            searchres('usb_connect','ucjy')
//        }
//        if(usb_debug.className=="jiaonang jiaonang_open"){
//            sendDevCmd('udfjy');
//            document.getElementById('udstramesg').className="udfjy";
//            searchres('usb_debug','udfjy')
//        }
//        if(usb_debug.className=="jiaonang jiaonang_close"){
//            sendDevCmd('udjy');
//            document.getElementById('udstramesg').className='udjy';
//            searchres('usb_debug','udjy')
//        }
//
//        $("#wifiCon").removeClass().addClass("jiaonang jiaonang_disabled");
//        $("#blthCon").removeClass().addClass("jiaonang jiaonang_disabled");
//        $("#tapeCon").removeClass().addClass("jiaonang jiaonang_disabled");
//        $("#cameraCon").removeClass().addClass("jiaonang jiaonang_disabled");
//        $("#gpsCon").removeClass().addClass("jiaonang jiaonang_disabled");
//        $("#mobiledataCon").removeClass().addClass("jiaonang jiaonang_disabled");
//        $("#usbcCon").removeClass().addClass("jiaonang jiaonang_disabled");
//        $("#usbdCon").removeClass().addClass("jiaonang jiaonang_disabled");
//    });

    //强制执行wifi指令 策略冲突
    $("#straconflict").submit(function(event){
        event.preventDefault();
        $("#conflict").dialog("close");
        var cmd =document.getElementById('stramesg').className;
        var cmdnew = cmd.substr(0,1)+'x'+cmd.substr(1);
        //sendDevCmdcon(cmdnew,flog,0);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#bcomplete").click(function(event) {
        $("#conflict").dialog("close");
    });
    //强制执行bluetooth指令 策略冲突
    $("#bstraconflict").submit(function(event){
        event.preventDefault();
        $("#bconflict").dialog("close");
        var cmd =document.getElementById('bstramesg').className;
        var cmdnew = cmd.substr(0,1)+'x'+cmd.substr(1);
        //sendDevCmdcon(cmdnew,flog,0);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#bbcomplete").click(function(event) {
        $("#bconflict").dialog("close");
    });
    //强制执行camera指令 策略冲突
    $("#cstraconflict").submit(function(event){
        event.preventDefault();
        $("#cconflict").dialog("close");
        var cmd =document.getElementById('cstramesg').className;
        var cmdnew = cmd.substr(0,1)+'x'+cmd.substr(1);
        //sendDevCmdcon(cmdnew,flog,0);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#cbcomplete").click(function(event) {
        $("#cconflict").dialog("close");
    });
    //强制执行tape指令 策略冲突
    $("#tstraconflict").submit(function(event){
        event.preventDefault();
        $("#tconflict").dialog("close");
        var cmd =document.getElementById('tstramesg').className;
        var cmdnew = cmd.substr(0,1)+'x'+cmd.substr(1);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#tbcomplete").click(function(event) {
        $("#tconflict").dialog("close");
    });
    //强制执行gps指令 策略冲突
    $("#gstraconflict").submit(function(event){
        event.preventDefault();
        $("#gconflict").dialog("close");
        var cmd =document.getElementById('gstramesg').className;
        var cmdnew = cmd.substr(0,1)+'x'+cmd.substr(1);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#gbcomplete").click(function(event) {
        $("#gconflict").dialog("close");
    });
    //强制执行mobiledata指令 策略冲突
    $("#mstraconflict").submit(function(event){
        event.preventDefault();
        $("#mconflict").dialog("close");
        var cmd =document.getElementById('mstramesg').className;
        var cmdnew = cmd.substr(0,1)+'x'+cmd.substr(1);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#mbcomplete").click(function(event) {
        $("#mconflict").dialog("close");
    });
    //强制执行usb_connect指令 策略冲突
    $("#ucstraconflict").submit(function(event){
        event.preventDefault();
        $("#ucconflict").dialog("close");
        var cmd =document.getElementById('ucstramesg').className;
        var cmdnew = cmd.substr(0,2)+'x'+cmd.substr(2);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#ucbcomplete").click(function(event) {
        $("#ucconflict").dialog("close");
    });
    //强制执行usb_debug指令 策略冲突
    $("#udstraconflict").submit(function(event){
        event.preventDefault();
        $("#udconflict").dialog("close");
        var cmd =document.getElementById('udstramesg').className;
        var cmdnew = cmd.substr(0,2)+'x'+cmd.substr(2);
        sendDevCmd(cmdnew);
    });
    //否定强制执行
    $("#udbcomplete").click(function(event) {
        $("#udconflict").dialog("close");
    });

    //sms 20150408
    function sendDevCmdSms(cmd){
        var org_session_id = $.cookie("org_session_id");
        var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd_sms',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: cmd
            }
        };
        ajaxReq1(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("硬件设备管理短信发送成功!",0);
            }else{
                loadingStatus("硬件设备管理短信发送出错,请重试!",0);
            }
        },"正在发送设备管理命令短信...");
    }
    /*******************/

    function sendDevCmd(cmd){
        var org_session_id = $.cookie("org_session_id");
        var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: cmd
            }
        };
        ajaxReq1(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("硬件设备管理命令发送成功!",0);
                setTimeout(function(){check_cmd_result(org_session_id,cmd);},5000);
            }else{
                loadingStatus("硬件设备管理命令发送出错!",0);
                setTimeout(function(){check_cmd_result(org_session_id,cmd);},1000);
            }
        },"正在发送设备管理命令...");
//        for(var i=0 ,len=arr.length;i<len;i++){
//            var dev_id=arr[i];
//            var obj={
//                _path: '/a/wp/user/send_cmd',
//                _methods: 'post',
//                param:{
//                sid:org_session_id,
//                dev_id:dev_id,
//                cmd:cmd
//                }
//            };
//            ajaxReq1(obj,function(data){
//                var rt=data.rt;
//                if(rt==0){
//                     loadingStatus("硬件设备管理成功!",0);
//                }else{
//                     loadingStatus("硬件设备管理出错!",0);
//                }
//             },"正在发送设备管理命令...");
//        }
    }
//    查询是否管控与策略相冲突
    function searchres(flog,cmd){
        count = 0;
        loopUpRes(flog,cmd);
    }
    function loopUpRes(flog,cmd){
        count=count+1;
        getres(flog,cmd);
        if(count<10)
        {
            setTimeout(function(){loopUpRes(flog,cmd);},2000);
        }
    }
    function getres(flog,cmd){
        var org_session_id = $.cookie("org_session_id");
        var arr=check_dev_id();
        for(var i=0,len=arr.length;i<len;i++){
            var dev_id=arr[i];
            var obj={
                _path: '/a/wp/user/get_cmd_respons',
                _methods: 'get',
                param:{
                    sid:org_session_id,
                    dev_id:dev_id,
                    info:flog
                }
            };
            ajaxReq(obj,function(data){
                var rt = data.rt;
                var res = data.res;
                if(rt == 0){
                    if(res == 1){
                        if(cmd.substr(0,1)=='w')
                            var href="#conflict";
                        if(cmd.substr(0,1)=='b')
                            var href="#bconflict";
                        if(cmd.substr(0,1)=='c')
                            var href="#cconflict";
                        if(cmd.substr(0,1)=='t')
                            var href="#tconflict";
                        if(cmd.substr(0,1)=='g')
                            var href="#gconflict";
                        if(cmd.substr(0,1)=='m')
                            var href="#mconflict";
                        if(cmd.substr(0,2)=='uc')
                            var href="#ucconflict";
                        if(cmd.substr(0,2)=='ud')
                            var href="#udconflict";
                        $("#popd").attr("href",href);
                        $("#popd").click();
                        count = 14;
                    }
                    if(res == 0){
                        // var href="conflict";
                        $("#popd").attr("href","#");
                        $("#popd").click();
                    }
                }
            },"");
            if (count > 10)
               break;
        }
    }

    $("#bDevcon").click(function(event){
        $("#DevControl").dialog("close");
        $("#wifiCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#blthCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#cameraCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#tapeCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#gpsCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#mobiledataCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#usbcCon").removeClass().addClass("jiaonang jiaonang_disabled");
        $("#usbdCon").removeClass().addClass("jiaonang jiaonang_disabled");
    });
	//修改设备锁屏密码
	$("#srnp").submit(function(event){
		event.preventDefault();
		var org_session_id=$.cookie("org_session_id");
		var reg=/\d{4}/;
		var arr=check_dev_id();
		if(!arr.length){
			loadingStatus("您未勾选设备!",0);
			return false;
		}
		if ($("#xmm").val() == '' || $("#qxmm").val() == '') {
			loadingStatus("密码不能为空!", 0);
			return false;
		}
		if(!reg.test($("#xmm").val())||!reg.test($("#qxmm").val())||($("#xmm").val().length!=4)){
			loadingStatus("密码必须是四位数字!",0);
			return false;
		}
		if ($("#xmm").val() != $("#qxmm").val()) {
			loadingStatus("您两次输入的密码不匹配!", 0);
			return false;
		}
        var dev=JSON.stringify(arr);
		for(var i=0,len=arr.length;i<len;i++){
			var obj={
				_path: '/a/wp/user/send_cmd',
				_methods: 'post',
				param:{
					sid:org_session_id,
					devs:dev,
					cmd:'chg_screen_pw ' + $("#qxmm").val()
				}
			};
			ajaxReq(obj,function(data){
				var rt=data.rt;
				if(rt==0){
					loadingStatus("更改锁屏密码成功!",0);
					$("#xmm").val("");
					$("#qxmm").val("");
				}else{
					loadingStatus("更改锁屏密码失败!",0);
				}
			},"正在修改锁屏密码!");
		}
	});
	//获取设备详细信息
	function loadDetails(dev_id){
        $.cookie("refresh",null);
		var org_session_id=$.cookie("org_session_id");
		var obj={
			_path:"/a/wp/user/dev_static_info",
			_methods:"get",
			param:{
				sid:org_session_id,
				dev_id:dev_id,
				all:1
			}
		};
		//发送请求之前清空之前的数据。
		$("#xiCont table tbody").html("");	//首先添加头
		$("#xiCont").mCustomScrollbar("update");//添加之后更新滚动
		ajaxReq(obj,function(data){
			var rt=data.rt;
			///console.log(data);
			if(rt==0){
                //更新时间 +++ 20150527
                var refresh_time=data['pos_corrention_time'];
                $.cookie("refresh",refresh_time);

				loadingStatus("成功获取到设备详细信息!",0);
				var str='';//头
				var cName='';
				var cSub='';
				var cNameP='';
				var dd='';
				for(var i=0,len=pInfo.length;i<len;i++){
					str+='<tr><td>'+pInfo[i]["title"]+'</td><td></td></tr>';
					for(var t in pInfo[i]){
						if(t=="title") continue;
						var dt=data[t]||"未知";
						str+='<tr><td>';
						str+=pInfo[i][t]+'</td><td>';
						str+=dt+'</td></tr>'
					}
				}
				$("#xiCont table tbody").html(str);	//首先添加头
				$("#xiCont").mCustomScrollbar("update");//添加之后更新滚动
			}else{
                //+++20150612
                var refresh_time="未上传信息";
                $.cookie("refresh",refresh_time);
				loadingStatus("未能获得设备详细信息!",0);
			}
            //+++ 20150612
            var cur_span=document.getElementById("currentUser").lastChild;
            var refresh=$.cookie("refresh");
            if(refresh==''){
                refresh="未上传时间";
            }
            cur_span.innerHTML="更新时间："+ refresh;
		},"正在获取设备详细信息!");
	}
	//获取日志
	function loadDateLog(dev_id){
		var org_session_id=$.cookie("org_session_id");
		var obj={
			_path:"/a/wp/org/user_log",
			_methods:"get",
			param:{
				sid:org_session_id,
				dev_id:dev_id
			}
		};
		var str='<tr><td>时间</td><td>应用</td><td>动作</td><td>描述</td></tr>';
		$("#logData table tbody").html(str);
		$("#logData").mCustomScrollbar("update");
		ajaxReq(obj,function(data){
			//console.log(data);
			var rt=data.rt;
			var logs=data.logs;
			if(rt==0){
				loadingStatus("成功获取设备日志!",0);
				for(var i=0,len=logs.length;i<len;i++){
					var log=logs[i];
					var info=log['info'];
					var di=info;
					if(info.length>6){
						di=info.slice(0,6)+'...'
					}
                    str+='<tr><td>'+log['t']+'</td><td>'+log['app']+'</td><td>'+log['act']+'</td><td title="'+info+'">'+di+'</td></tr>';
					$("#logData table tbody").html(str);
				}
			}else{
				loadingStatus("未能获取设备日志!",0);
				$("#logData").mCustomScrollbar("update");
			}
		},"正在获取设备日志!");
	}
	//获取app应用信息
	function loadApp(dev_id){
		var org_session_id=$.cookie("org_session_id");
		var obj={
			_path:"/a/wp/user/dev_app_info",
			_methods:"get",
			param:{
				sid:org_session_id,
				dev_id:dev_id
			}
		};
		//发送请求之前清空
		var str='<tr><td>应用名</td><td>版本号</td><td>Build号</td><td>最后更新时间</td></tr>';
		$("#appInfo table tbody").html(str);
		$("#appInfo").mCustomScrollbar("update");
		ajaxReq(obj,function(data){
			//console.log(data);
			var rt=data.rt;
			if(rt==0){
				loadingStatus("成功获取设备应用信息!",0);
				var appLen;
				if(!data.apps){
					appLen=0;
				}else{
					var apps=JSON.parse(data.apps);
					appLen=apps.length;
				}
				for(var i=0;i<appLen;i++){
					var appName=apps[i]['app_name'];
					var version_code=apps[i]['version_code'];
					var version_name=apps[i]['version_name'];
					var last_update_time=parseInt(apps[i]['last_update_time']);
					var last_time=new Date(last_update_time);
					var mn=last_time.getMonth()+1;
					var ltime=last_time.getFullYear()+'-'+mn+'-'+last_time.getDate();
					str+='<tr><td>'+appName+'</td><td>'+version_name+'</td><td>'+version_code+'</td><td>'+ltime+'</td></tr>';
					$("#appInfo table tbody").html(str);
					$("#appInfo").mCustomScrollbar("update");
				}
			}else{
				loadingStatus("未能获取设备应用信息!",0);
			}
		},"正在获取设备应用信息!");
	}
    //获取当前设备所有的策略
    function loadDevStrategy(uid){
        var org_session_id=$.cookie("org_session_id");
        var obj={
            _path:"/a/wp/user/get_user_strategys",
            _methods:"get",
            param:{
                sid:org_session_id,
                uid:uid
            }
        };
        //发送请求之前清空之前的数据。
        $("#straList table tbody").html("");	//首先添加头
        $("#straList").mCustomScrollbar("update");//添加之后更新滚动
        ajaxReq(obj,function(data){
            var rt=data.rt;
            var strategys = data.strategys;
            if(rt==0){
                loadingStatus("成功获取策略信息！",0);
                var str = '';
                for (var i=0;i<strategys.length;i++)
                {
                    var wifi="未设置";
                    var bluetooth="未设置";
                    var camera="未设置";
                    var tape="未设置";
                    var gps="未设置";
                    var mobiledata="未设置";
                    var usb_connect="未设置";
                    var usb_debug="未设置";
                    if(strategys[i].wifi=="wfjy")
                        wifi = "非禁用";
                    else if(strategys[i].wifi=="wjy")
                        wifi = "禁用";
                    if(strategys[i].bluetooth=="bfjy")
                        bluetooth = "非禁用";
                    else if(strategys[i].bluetooth=="bjy")
                        bluetooth = "禁用";
                    if(strategys[i].camera=="cfjy")
                        camera = "非禁用";
                    else if(strategys[i].camera=="cjy")
                        camera = "禁用";
                    if(strategys[i].tape=="tfjy")
                        tape = "非禁用";
                    else if(strategys[i].tape=="tjy")
                        tape = "禁用";
                    if(strategys[i].gps=="gfjy")
                        gps = "非禁用";
                    else if(strategys[i].gps=="gjy")
                        gps = "禁用";
                    if(strategys[i].mobiledata=="mfjy")
                        mobiledata = "非禁用";
                    else if(strategys[i].mobiledata=="mjy")
                        mobiledata = "禁用";
                    if(strategys[i].usb_connect=="ucfjy")
                        usb_connect = "非禁用";
                    else if(strategys[i].usb_connect=="ucjy")
                        usb_connect = "禁用";
                    if(strategys[i].usb_debug=="udfjy")
                        usb_debug = "非禁用";
                    else if(strategys[i].usb_debug=="udjy")
                        usb_debug = "禁用";
                    var k = i+1;
                    var id = "strategy_"+k;
                    var straflog='';
                    if (strategys[i].is_read =="false")
                        straflog = "待读取";
                    else if(strategys[i].is_read =="true")
                        straflog = "已读取";
                    else if(strategys[i].is_read =="delete")
                        straflog = "待删除";
                    else
                        straflog = "未知";
//                    alert(straflog);
                    str+= "<tr class='strategy_id' id = '0"+id+"'><td style='font-size: 11pt;font-weight: bold'>策略"+k+"</td><td>"+straflog+"</td><td></td><td></td></tr>";
                    str+= "<tr class ='"+id+"'><td>开始时间:</td><td>"+strategys[i].start+"</td><td>结束时间:</td><td>"+strategys[i].end+"</td></tr>";
                    str+= "<tr class ='"+id+"'><td>作用地点:</td><td>"+strategys[i].desc+"</td><td>作用半径:</td><td>"+strategys[i].radius+"(米)</td></tr>";
                    str+= "<tr class ='"+id+"'><td>Wifi:</td><td>"+wifi+"</td><td>Bluetooth:</td><td>"+bluetooth+"</td></tr>";
                    str+= "<tr class ='"+id+"'><td>Camera:</td><td>"+camera+"</td><td>录音:</td><td>"+tape+"</td></tr>";
                    str+= "<tr class ='"+id+"'><td>GPS:</td><td>"+gps+"</td><td>移动数据:</td><td>"+mobiledata+"</td></tr>";
                    str+= "<tr class ='"+id+"'><td>USB连接:</td><td>"+usb_connect+"</td><td>USB调试:</td><td>"+usb_debug+"</td></tr>";
                }
                $("#straList table tbody").html(str);	//首先添加头
                $("#straList").mCustomScrollbar("update");//添加之后更新滚动
            }
            else{
                loadingStatus("未能获取策略信息！",0);
            }
        });
    }
    //当前策略隐藏和显示
    $("#straList table tbody .strategy_id").live('click',function(event){
        if(this.id.substr(0,1) == "0")
        {
            var  id = this.id.substr(1);
//            alert(id);
            $("#straList table tbody tr."+id).hide();
            this.setAttribute("id","1"+id);
            return true;
        }
        if(this.id.substr(0,1) == "1")
        {
            var  id = this.id.substr(1);
//            alert(id);
            $("#straList table tbody tr."+id).show();
            this.setAttribute("id","0"+id);
            return true;
        }


    })

    //*** 刷新操作替换掉
    $("#shuaxin").click(function(event){
//		event.preventDefault();
//        loopUpRe();
        var uids = new Array();
        $("#yglb tbody tr").each(function(){
            var uid = $(".Telephone",this).html();
            uids.push(uid);
        });
        getDevsInfo(uids);
    });

    //右下角刷新的优化
    $("#staticinfoRe").click(function(event){
        event.preventDefault();
        var org_session_id=$.cookie("org_session_id");
        //+++20150602 重写刷新
        var that;
        $("#yglb tbody tr .checkbox_checked").each(function(index,element){
            var that=$(element).parent().parent();
            if($(".dev_id",that).html()!='设备未激活'){
                if ($(".Telephone",that).html()==$("#cur_usr").attr("class")){
                    var dev_id=$(".dev_id",that).html();
                    var user_id=$(".Telephone",that).html();
                    var username=$(".username",that).html();
                    var obj={
                        _path: '/a/wp/user/send_staticinfo',
                        _methods: 'post',
                        param: {
                            sid: org_session_id,
                            dev_id: dev_id //测试设备。
                        }
                    };
                    ajaxReq(obj,function(data){
                        var rt=data.rt;
                        if(rt==0){
                            loadingStatus("正在实时更新...",1);
                            delay(2900);
                            loadRe(dev_id,user_id,username);
                        }else{
                            loadingStatus("离线用户无法更新！",0);
                        }
                    },"正在更新...");
                }
            }
        });
        /**************************/

        function delay(numberMillis){
            var now = new Date();
            var exitTime = now.getTime()+numberMillis;
            while(true){
                now = new Date();
                if(now.getTime() > exitTime)
                    return;
            }
        }
        function loadRe(dev_id,user_id,username){
            loadDetails(dev_id);   //获取设备详细信息
            loadApp(dev_id);   //获取app信息
            loadDateLog(dev_id);   //获取log信息
            loadDevStrategy(user_id);   //获取用户策略
            setTimeout("loadingStatus('更新完成!',0)",1000);
        }
    });
    //获取设备位置信息
    function devPostion() {
        //删除markerArr中所有的数据

        markerArr.splice(0,markerArr.length);
        var ssid = $.cookie("org_session_id");
        var iduserArr = check_dev_id_and_user();
        var len=iduserArr.length;
        if(len>0){
            $("#gnan .tog").show();
        }else{
            $("#gnan .tog").hide();
        }
        if ($("#yglb tbody tr .checkbox").hasClass('checkbox_checked')){
            addMarker();
        }
    }

    //+++ 20150611 for check send_cmd result
    function check_cmd_result(sid,cmd){
        var obj={
            _path: '/a/wp/user/re_send_cmd',
            _methods: 'get',
            param: {
                sid: sid,
                cmd:cmd
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            var devs=data.devs;
            if(rt==0){
                if(devs.length==0){
                    loadingStatus("管控指令已全部被成功接收!",0);
                }else{
                    loadingStatus("存在用户未成功接收管控指令!",0);
                    deal_devs(sid,devs,cmd);
                }
            }
        },"正在执行管控指令...");
    }
    function deal_devs(sid,devs,cmd){
        var str_dev='有'+devs.length+'台设备未接收到管控指令,';
        devs_json=JSON.stringify(devs);
        if(confirm(str_dev+"是否一键短信下发？(提示：若点击确定，管控指令将以短信形式下发至未接收到管控指令的设备。若取消，则管控指令对这些设备不再发送！)")){
            event.preventDefault();
            var obj={
                _path: '/a/wp/user/send_cmd_sms',
                _methods: 'post',
                param: {
                    sid: sid,
                    devs: devs_json, //测试设备。
                    cmd: cmd
                }
            };
            //最后看是否能发送成功
            setTimeout(function(){check_cmd_result(sid,cmd);},30000);
            ajaxReq(obj,function(data){
                var rt=data.rt;
                if(rt==0){
                    loadingStatus("短信下发管控指令成功!",0);
                }else{
                    loadingStatus("短信下发管控指令失败,请重试!",0);
                    deal_devs(sid,devs,cmd);
                }
            },"正在发送短信...");
        }else{
            //清空re cmd dev list
            var obj={
                _path: '/a/wp/user/del_re_cmd_dev',
                _methods: 'get',
                param: {
                    sid: sid,
                    cmd:cmd
                }
            };
            ajaxReq(obj,function(data){
                var rt=data.rt;
                if(rt==0){
                    loadingStatus("取消执行管控指令成功!",0);
                }
            },"正在取消执行管控指令...");
        }
    }

    //+++ 20150612 sms send cmd for 远程遥毁
    $("#smsqingchu").live('click',function(event) {
        event.preventDefault();
        $("#qingchu").dialog("close");
        var org_session_id=$.cookie("org_session_id");
        var arr=check_dev_id();
        dev=JSON.stringify(arr);
        var obj={
            _path: '/a/wp/user/send_cmd_sms',
            _methods: 'post',
            param: {
                sid: org_session_id,
                devs: dev, //测试设备。
                cmd: 'reset'
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("工作数据清除短信下发成功!",0);
            }else{
                loadingStatus("工作数据清除短信下发失败,请重试!",0);
            }
        },"正在执行...");
    });

});//end load documents

//+++ 20150609 for ip/sms send cmd
function choice(element){
    var butid=element.value;
    document.getElementById("iporsms").firstChild.firstChild.id=butid;
    document.getElementById("iporsms").lastChild.firstChild.id=butid+"sms";
    var popd=$("#popd");
    popd.attr("href","#iporsms");
    popd.click();
}
var popd=$("#popd");
$(".choicebtn").click(function(event){
    var id=event.target.id;
    var href="";
    switch(id){
        case "shanchusms":
            var p1=document.getElementById("qingchu").firstChild.firstChild;
            var b1=document.getElementById("qingchu").firstChild.lastChild.firstChild;
            p1.innerText="此操作将发送管控短信，使其工作数据清空，是否继续？";
            b1.id="smsqingchu";
            b1.type="button";
            href="#qingchu";
            break;
        case "shanchu":
            var p1=document.getElementById("qingchu").firstChild.firstChild;
            var b1=document.getElementById("qingchu").firstChild.lastChild.firstChild;
            p1.innerText="这将清除您设备中所有的资料，是否还要继续？";
            b1.id="sqingchu";
            b1.type="submit";
            href="#qingchu";
            break;
        case "qcceluesms":
            var p1=document.getElementById("qchu").firstChild.firstChild;
            var b1=document.getElementById("qchu").firstChild.lastChild.firstChild;
            p1.innerText="此操作将向该设备发送管控短信，使其所有策略失效，是否继续？";
            b1.id="smsqc";
            b1.type="button";
            href="#qchu";
            break;
        case "qccelue":
            var p1=document.getElementById("qchu").firstChild.firstChild;
            var b1=document.getElementById("qchu").firstChild.lastChild.firstChild;
            p1.innerText="这将使该设备的所有策略失效，是否继续？";
            b1.id="sqc";
            b1.type="submit";
            href="#qchu";
            break;
        case "devControlsms":
            var b1=document.getElementById("DevControl").firstChild.lastChild.firstChild;
            b1.id="qDevcon";
            b1.innerText="短信下发";
            href="#DevControl";
            break;
        case "devControl":
            var b1=document.getElementById("DevControl").firstChild.lastChild.firstChild;
            b1.id="sDevcon";
            b1.innerText="确定";
            setallrespons(0);
            href="#DevControl";
            break;
        default:
            href="#";
    }
    popd.attr("href",href);
    popd.click();
    $("#iporsms").dialog("close");
});
//通过勾选筛选出dev—id
function check_dev_id(){
    var arr=[];
    var that;
    $("#yglb tbody tr .checkbox_checked").each(function(index,element){
        var that=$(element).parent().parent();
        if($(".dev_id",that).html()!='设备未激活'){
            arr.push($(".dev_id",that).html());
        }
    });
    return arr;
}
//清除硬件管控所有标识位
function setallrespons(res){
    var org_session_id = $.cookie("org_session_id");
    var arr=check_dev_id();
    for(var i=0,len=arr.length;i<len;i++){
        var dev_id=arr[i];
        var obj={
            _path: '/a/wp/user/set_all_respons',
            _methods: 'post',
            param:{
                sid:org_session_id,
                dev_id:dev_id,
                rs:res
            }
        };
        ajaxReq(obj,function(data){
            var rt=data.rt;
            if(rt==0){
                loadingStatus("标识位复位成功!",0);
            }else{
                loadingStatus("标志位复位出错!",0);
            }
        },"设备标志位正在复位...");
    }
}

/*+++20150609+++短信下发操作集合*/
//短信清除策略 +++ 20150511
function smssubmit(element){
    if(element.id=="sqc"){
        return;
    }
    $("#qchu").dialog("close");
    var org_session_id=$.cookie("org_session_id");
    var arr=check_dev_id();
    dev=JSON.stringify(arr);
    var obj={
        _path: '/a/wp/user/send_cmd_sms',
        _methods: 'post',
        param: {
            sid: org_session_id,
            devs: dev, //测试设备。
            cmd: 'qccl'
        }
    };
    ajaxReq(obj,function(data){
        var rt=data.rt;
        if(rt==0){
            loadingStatus("策略清除短信下发成功!",0);
        }else{
            loadingStatus("策略清除短信下发失败,请重试!",0);
        }
    },"正在执行...");
}
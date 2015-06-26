$("#exceldap").live('click',function(event){
	event.preventDefault();
	$("#upcel")[0].reset();
	var left=($(window).outerWidth(true)-$(".upexcel").outerWidth(true))/2;
	var top=($(window).outerHeight(true)-$(".upexcel").outerHeight(true))/2;
	$(".upexcel").css({left:left,top:top});
	$(".upexcel").show();
});

$(".upexcel .x").click(function(event){
	$(".upexcel").hide();
	$("#appName").attr("readonly",null);
	$("#appSocu").attr("readonly",null);
	$("#lei").attr("disabled",false);
	$(".wb").hide();
	$(".nat").show();
});
$(".upexcel .err").click(function(event){
	$(".upexcel .x").click();
});


$("#excels").focus(function(event){
    $("#excel").click();
});
$("#excel").change(function(event){
    $("#excels").val($(this).val());
});

$("#upcel").submit(function(event){
    if(!$("#excels").val()){
        loadingStatus("上传文件不能为空!",0);
        return false;
    }
    else{
        var excelname =$("#excels").val();
        var excelmode =/\.[^\.]+/.exec(excelname);
        if(excelmode != '.xls'){
            loadingStatus("上传文件格式不对，请重新上传.xls格式的文件!",0);
            return false;
        }
    }
    loadingStatus("正在上传...",1);
    $(".upexcel .x").click();
    disexceldap();		//禁用上传的按钮；
});

//禁用上传按钮
var exceldap=$("#exceldap")
function disexceldap(){
    exceldap.attr({"disabled":"disabled"});
    exceldap.live('click',excelalert);
}

function excelalert(event){
    alert("有一个文件正在上传，请稍侯...");
}


function waitexcel(data){
    abexceldap();		//释放上传的按钮！
    var rt=data.rt;
    if(rt==0){
        sessionStorage.clear();
        loadingStatus("上传成功!",0);
    }else{
        loadingStatus("上传失败!",0);
    }
}


function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

//释放上传按钮
function abexceldap(){
    exceldap.removeAttr("disabled");
    exceldap.die('click',excelalert);
}
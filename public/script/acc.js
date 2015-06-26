/**
 * Created by Seren on 14-4-22.
 */
//实现账户页面的切换
$(".asideU .tab").click(function(event){
    event.preventDefault();
    var href=$(this).attr("href");
    $("#acc > section").hide();
    var sid=$.cookie("org_session_id");
    var oudn="dc=test,dc=com";
    var txt=loadous(sid,oudn);
    var uid=$.cookie("userid");
    var qx=$("#adminqx").html();
    if(href=="#addgly")
    {
        $("#addglqx .yc #xzhqx").empty();
        document.getElementById("xzhqx").disabled = false;
        if(uid != "admin")
        {
            txt="<option value="+qx+">"+qx+"</option>";
        }
        $("#addglqx .yc #xzhqx").append(txt);
    }
    else if(href=="#addyh"){
        $("#addou .yc #uldapou").empty();
        $("#addou .yc #uldapou").append("<option value='请选择'>请选择</option>");
        if(uid != "admin")
        {
            var ou = $("#adminqx").html();
            $("#addou .yc #uldapou").append("<option value='"+ou+"'>"+ou+"</option>");
        }
        else
        {
            $("#addou .yc #uldapou").append(txt);
        }
        document.getElementById('uldapou').className="dc=test,dc=com";
        document.getElementById('uldapou').onchange = function(){
            loadnextous(document.getElementById('uldapou'));
        };
    }
    $(href).show();
    $(".asideU .tab").removeClass("hover");
    $(this).addClass("hover")
});

//更换头像的代码
$("#changeFace").click(function(event){
    var changeFaceHref = $("#changeFaceHref");
    changeFaceHref.attr("href","#changeFaceDialog");
    $("#faceNow").attr("src","images/tree.jpg");
    $("#cropPreview").attr("src","images/tree.jpg");
    readyToUploadFace();
    changeFaceHref.click();
});
function readyToUploadFace(){
    $(document).ready(function(){

        $("#faceNow").Jcrop({
            onChange:showPreview,
            onSelect:showPreview,
            aspectRatio:1
        });
        //简单的事件处理程序，响应自onChange,onSelect事件，按照上面的Jcrop调用
        function showPreview(coords){
            if(parseInt(coords.w) > 0){
                //计算预览区域图片缩放的比例，通过计算显示区域的宽度(与高度)与剪裁的宽度(与高度)之比得到
                var rx = $("#previewBox").width() / coords.w;
                var ry = $("#previewBox").height() / coords.h;
                //通过比例值控制图片的样式与显示
                $("#cropPreview").css({
                    width:Math.round(rx * $("#faceNow").width()) + "px",	//预览图片宽度为计算比例值与原图片宽度的乘积
                    height:Math.round(rx * $("#faceNow").height()) + "px",	//预览图片高度为计算比例值与原图片高度的乘积
                    marginLeft:"-" + Math.round(rx * coords.x) + "px",
                    marginTop:"-" + Math.round(ry * coords.y) + "px"
                });
            }
        }
    });
}
//上传备选图片
$("#uploadBtn").click(function(event){
    var fileContent = $("#uploadPhoto").val();
    alert(fileContent);
});

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
        //console.log(data);
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
//每点击一次加载下一级的群组
function loadnextous(element){
//    alert(element.value);
    var span=document.getElementById('addbm');
    var seletes=span.children;
    var classname=element.className;
//    alert(classname);
    //删除其后的所有兄弟节点后退出
//    alert(seletes.length);
//        alert(element.className);
    for(var i=seletes.length-1;i>0;i--)
    {
//        alert(seletes[i].className);
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
//    alert("loadnextous:"+oudn);
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
        //console.log(data);
        var ous=data.ous;
        if(ous.length>0)
        {
            var st="<select onchange='loadnextous(this)'class='"+oudn+"' id='st"+oudn+"'></select>";
            $("#addbm").append(st);
            if(data.rt==0){
                document.getElementById("st"+oudn).options.add(new Option("请选择","请选择"));
                 for(var i=0;i<ous.length;i++)
                 {
                     document.getElementById("st"+oudn).options.add(new Option(ous[i].ou,ous[i].ou));
                 }
            }
        }
        else{
         var span=document.getElementById('addbm');
//           alert(span.lastChild.className);
        }
    },"");
}
//隐藏的选项卡滑下的动作
$(".ra").click(function(event){
    var parent=$(this).parent();
    var yc=$(".yc",parent);
    yc.slideDown("fast");
});
//提交或者关闭的时候收上选项卡。
$(".yc .an button.err").click(function(event){
    var yc=$(this).parent().parent().parent();
//	$("input[type='text']").val("");
//	$("input[type='password']").val("");
    yc.slideUp("fast");
});
//修改企业信息的代码。
$("#dwmc").submit(function(event){
    event.preventDefault();
    var dwm=$("#dwm");
    if(!verViod(dwm.val())){
        loadingStatus("企业名不能为空!");
        return false;
    }
    var obj={
        _path:"/a/wp/org/org_info",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            org_name:dwm.val()
        }
    };
    ajaxReq(obj,function(data){
        //console.log(data);
        if(data.rt==0){
            loadingStatus("提交成功!",0);
            $("#dwmc").parent().slideUp("fast");
            dwm.val("");
        }else{
            loadingStatus("提交失败!",0);
        }
    },"正在提交...")
});
//修改企业地址
$("#addr").submit(function(event){
    event.preventDefault();
    var xadd=$("#xadd");
    if(!verViod(xadd.val())){
        loadingStatus("企业地址不能为空!");
        return false;
    }
    var obj={
        _path:"/a/wp/org/org_info",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            org_addr:xadd.val()
        }
    };
    ajaxReq(obj,function(data){
        //console.log(data);
        if(data.rt==0){
            loadingStatus("提交成功!")
            $("#addr").parent().slideUp("fast");
            xadd.val("");
        }else{
            loadingStatus("提交失败!",0);
        }
    },"正在提交...")
});
//修改手机号码
$("#shh").submit(function(event){
    event.preventDefault();
    var hm=$("#hm");
    if(!verViod(hm.val())){
        loadingStatus("手机号码不能为空!");
        return false;
    }
    var obj={
        _path:"/a/wp/org/org_info",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            admin_pnumber:hm.val()
        }
    };
    ajaxReq(obj,function(data){
        //console.log(data);
        if(data.rt==0){
            loadingStatus("提交成功!",0);
            $("#shh").parent().slideUp("fast");
            hm.val("");
        }else{
            loadingStatus("提交失败!",0);
        }
    },"正在提交...");
});
//修改邮箱
$("#adyx").submit(function(event){
    event.preventDefault();
    var xyx=$("#xyx");
    if(!verViod(xyx.val())){
        loadingStatus("邮箱不能为空!")
        return false;
    }
    var obj={
        _path:"/a/wp/org/org_info",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            admin_email:xyx.val()
        }
    };
    ajaxReq(obj,function(data){
        //console.log(data);
        if(data.rt==0){
            loadingStatus("提交成功!",0);
            $("#adyx").parent().slideUp("fast");
            xyx.val("");
        }else{
            loadingStatus("提交失败!",0);
        }
    },"正在提交...");
});
//修改密码
$("#xmim").submit(function(event){
    event.preventDefault();
    var dma=$("#dma");
    var xma=$("#xma");
    var qxma=$("#qxma");
    if(!verViod(dma.val())){
        loadingStatus("当前密码不能为空!");
        return false;
    }
    if(!verViod(xma.val())){
        loadingStatus("新密码不能为空!");
        return false;
    }
    if(!verViod(qxma.val())){
        loadingStatus("确认密码不能为空!");
        return false;
    }
    if(xma.val()!=qxma.val()){
        loadingStatus("两次密码不一致!");
        return false;
    }
    var obj={
        _path:"/a/wp/org/set_pw",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            oldpw:dma.val(),
            newpw:xma.val()
        }
    };
    ajaxReq(obj,function(data){
        //console.log(data);
        if(data.rt==0){
            $("#xmim").parent().slideUp("fast");
            dma.val("");
            xma.val("");
            qxma.val("");
            alert("密码已修改,请重新登陆！");
            relogin();
        }else if(data.rt==18){
            alert("新密码需要8~16位，且必须包含字母与数字!");
            loadingStatus("新密码不符合规则!");
        }else if(data.rt=19){
            loadingStatus("旧密码输入错误!");
        }
    },"正在提交...");
});
//添加用户
$("#adduser").submit(function(event){
    event.preventDefault();
    var username=$("#uname").val();
    var email = $("#umail").val();
    var pnumber=$("#uphone").val();
    var zhiW = $("#uzhiw").val();
    var zhiC = $("#uzhic").val();
    var mobile = 'Y';
    var pw1='12345678';
    var pw2='12345678';
    //姓名监测
    if(!verViod(username)){
        loadingStatus("用户名不能为空!");
        return false;
    }else if(username.TextFilter()!=username){
        alert("用户名不得含有特殊字符！");
        return false;
    }else if(username.length>6){
        alert("用户名不应超过6个字符！");
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
    //监测两次密码是否一样
    if(!verViod(pw1)){
        loadingStatus("密码不能为空!");
        return false;
    }
    if(!verViod(pw2)){
        loadingStatus("确认密码不能为空!");
        return false;
    }
    if(pw1!=pw2){
        loadingStatus("两次密码不一致!");
        $("#xzhmm2").val("");
        return false;
    }
    //检验电话号码
    var reg = new RegExp('^[1][3-8]+\\d{9}')
    if(pnumber.length<11 || !reg.test(pnumber))
    {
        loadingStatus("电话号码无效！");
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
//    alert(title);
    //判定所属部门
    var ou = []
    var span = document.getElementById("addbm");
    var selects = span.getElementsByTagName("select");
    if(selects.length<=1 && selects[0].value == "请选择")
    {
//        alert("所属部门不能为空！！！");
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
    var obj={
        _path:"/a/wp/org/ldap_add_user",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            username:username,
            pw:pw1,
            email:email,
            mobile:mobile,
            pnumber:pnumber,
            title:title,
            dn:ou.join(',')
        }
    };
    ajaxReq(obj,function(data){
        //console.log(data);
        if(data.rt==0){
            sessionStorage.clear();   //******************************//
            loadingStatus("用户添加成功！");
            $("#uname").val("");
            $("#umail").val("");
            $("#uphone").val("");
            $("#uzhiw").val("无");
            $("#uzhic").val("无");
//            $("#uldapsq").val();
            $("#upw1").val("");
            $("#upw2").val("");
//            $("#uldapou").val("请选择");
        }
        else if(data.rt == 12){
            loadingStatus("该设备已被注册！");
        }
        else {
            loadingStatus("用户添加失败！");
        }

    },"正在提交...");

});
//添加管理员
$("#addmanager").submit(function(event){
    event.preventDefault();
    if(document.getElementById("xzhqx").disabled == true)
    {
        alert("您的权限不够，不能够添加管理员！！！");
        $("#xzh").val("");
        $("#xzhmm1").val("");
        $("#xzhmm2").val("");
        return;
    }
    var uid=$("#xzh").val();
    var pw1=$("#xzhmm1").val();
    var pw2=$("#xzhmm2").val();
    var ou=$("#xzhqx").val();

    if(ou==""){
        alert("管理员权限不能为空！！！");
        return;
    }
    //+++ 20150605
    if(uid.TextFilter()!=uid){
        alert("管理员账号名不得含有特殊字符！");
        return;
    }
    //监测两次密码是否一样
    if(!verViod(pw1)){
        loadingStatus("密码不能为空!");
        return false;
    }
    if(!verViod(pw2)){
        loadingStatus("确认密码不能为空!");
        return false;
    }
    if(pw1!=pw2){
        loadingStatus("两次密码不一致!");
        $("#xzhmm2").val("");
        return false;
    }

    var obj={
        _path:"/a/wp/org/add_admin",
        _methods:"post",
        param:{
            sid:$.cookie("org_session_id"),
            uid:uid,
            pw:pw1,
            ou:ou
        }
    };
    ajaxReq(obj,function(data){
        //console.log(data);
        if(data.rt==0){
            loadingStatus("管理员添加成功！");
            $("#xzh").val("");
            $("#xzhmm1").val("");
            $("#xzhmm2").val("");
        }else if(data.rt==12){
            loadingStatus("管理员已存在！");
        }else{
            loadingStatus("管理员添加失败！");
        }
    },"正在提交...");

});
function checkpwrule(pw)
{
    var  pw_rule_1 = '.*[0-9].*';
    var  pw_rule_2 = '.*[A-Za-z].*';
    var re1 = new RegExp(pw_rule_1);
    var re2 = new RegExp(pw_rule_2);
    if ((!re1.test(pw))||(!re2.test(pw)))
    {
        $("#xzhmm1").value="";
        $("#xzhmm2").value="";
        return false;
    }
    return true;
}
function checkemail(email)
{
    var rg = new RegExp('^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])');
    if( !rg.test(email))
         return false;
    return true;
}

//+++ 20150608 修改密码重新登录
function relogin(){
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
}
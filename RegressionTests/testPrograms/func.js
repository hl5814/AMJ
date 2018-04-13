// parse function body
b=function a (){eval("str1.1");};
var b=function a (){eval("str1.2");};
c=function(){eval("str2.1");};
var c=function(){eval("str2.2");};


// check variable scope
var test = 1;
function testScope1() {
	var test = "inner1";
	function testScope2() {
		var test = "inner2";
		eval(test);     
	}
	eval(test);
}
eval(test);

// function redefined and override current variable in varMap
var b = eval;
function b(){};
b("test2");

// assignment override function variable in varMap
function a(){};
function b(){};
if (1>2){
	a=eval;
} else {
	a=b;
}
a("test");
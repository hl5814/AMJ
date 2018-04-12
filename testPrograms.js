//===============================TestProgram=================================
var program0 = 
`	eval("xxx");`;
var program1 = 
`	eval("helloworld");
	eval(1+1);
	eval(foo(1+bar()))`;
var program2 = 
`	b = "alert(b)";
	a = b;
	b = c; 
	c = a;
	a = "xxx";
	eval(c);`;
var program3 = 
`	b=function a (){eval("str1.1");};
	var b=function a (){eval("str1.2");};
	c=function(){eval("str2.1");};
	var c=function(){eval("str2.2");};`;
var program4 = 
`	var a = "test";
	unescape(a)`;
var program5 =
`	var test = 1;
	function testScope1() {
		var test = "inner1";
		function testScope2() {
			var test = "inner2";
			eval(test);     
		}
		eval(test);
	}
	eval(test);`;
var program6 =`
	var x = "STR";
	try{
		x = "TRY";
	}catch(e){
		x = 0;
	}
	eval(x);

	var y = "";
	try{
		y = "TRY";
	}catch(e){
		y = "CATCH";
	}
	eval(y);

	try{
		var z = "TRY";
	}catch(e){
		var z = "CATCH";
	}
	var z = "end";
	eval(z);

	var a = "STR";
	try{
	    a = "TRY";
	}catch(e){
	    a = "CATCH";
	}finally{
	    a = "FINALLY";
	}
	eval(a);`
var program7 =`
	var a = eval;
	a("test");

	var b = eval;
	function b(){};
	b("test2");`
var program8 = 
`	function a(){};
	function b(){};
	if (1>2){
		a=eval;
	} else {
		a=b;
	}
	a("test");`;
var program9 =
`	var a = "alert()";
	b = eval; 
	b(a);`;
var program10 =
`	var x = "STR1";
	if (1>2) {
	    x = 0;
	}
	eval(x);

	var y = "STR2";
	if (1>2) {
	    y = 0;
	    eval(y);
	}`;

exports.programs = [program0,program1,program2,program3,
					program4,program5,program6,program7,
					program8,program9,program10];





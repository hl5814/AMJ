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
`	a = b; 
	b = c; 
	c = a;
	a = "xxx";
	eval(c);`;
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
	eval(test);
	var b = 1;
	var c = "c";
	function foo(){var a = 1+1;};
	var d = c;
	eval(d);
	function bar(){var x = "2"};`;
var program6 =`
	var a = eval;
	function a(){};
	a("test");`
var program7 =`
	var a = eval;
	a("test");`
var program8 = 
`	var D = function foo(){};`;
//TODO: undefined variables
// var program_undefined_b = 
// `	var a = "alert()";
// 	b = eval; 
// 	b(a);`;

exports.programs = [program0,program1,program2,program3,
					program4,program5,program6,program7,
					program8]
// parse function body
b=function a (){eval("str1.1");};
var b=function a (){eval("str1.2");};
c=function(){eval("str2.1");};
var c=function(){eval("str2.2");};
// FEATURE[StringOp] in :a: pre_Function:eval(STRING) => eval("str1.1")
// FEATURE[InitVariable] in :User_Program, Init Variable by FunctionExpression:b=a
// FEATURE[StringOp] in :a: pre_Function:eval(STRING) => eval("str1.2")
// FEATURE[StringOp] in :eval("str2.1");: pre_Function:eval(STRING) => eval("str2.1")
// FEATURE[InitVariable] in :User_Program, Init Variable by FunctionExpression:c=function(){eval("str2.2");}
// FEATURE[StringOp] in :function(){eval("str2.2");}: pre_Function:eval(STRING) => eval("str2.2")

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
// FEATURE[StringOp] in :testScope2: eval(Object->STRING) => [test] ==> eval("inner2")
// FEATURE[StringOp] in :testScope1: eval(Object->STRING) => [test] ==> eval("inner1")


// function redefined and override current variable in varMap
var b = eval;
function b(){};
b("test2");
// FEATURE[FuncObfuscation] :[ b ] -> [ eval ]
// FEATURE[StringOp] in :User_Program: user_Function:b(STRING) => b("test2")


// assignment override function variable in varMap
function a(){};
function b(){};
if (1>2){
	a=eval;
} else {
	a=b;
}
a("test");
// FEATURE[FuncObfuscation] :[ a ] -> [ eval ]
// FEATURE[StringOp] in :User_Program: pre_Function:a(STRING) => eval("test")
// FEATURE[StringOp] in :User_Program: user_Function:a(STRING) => b("test")

// prototype functions
a.prototype.myFunc=function(x) {
	eval(x);
	return x;
}
//FEATURE[StringOp] in :eval(x);;: eval(Object->STRING) => [x] ==> eval(STR)
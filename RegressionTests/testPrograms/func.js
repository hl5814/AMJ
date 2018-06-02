// parse function body
b=function a (){MJSA_TEST("str1.1");};
var b=function a (){MJSA_TEST("str1.2");};
c=function(){MJSA_TEST("str2.1");};
var c=function(){MJSA_TEST("str2.2");};
// FEATURE[StringOp] in :a: pre_Function:MJSA_TEST(STRING) => MJSA_TEST("str1.1")
// FEATURE[InitVariable] in :User_Program, Init Variable by FunctionExpression:b=a
// FEATURE[StringOp] in :a: pre_Function:MJSA_TEST(STRING) => MJSA_TEST("str1.2")
// FEATURE[StringOp] in :MJSA_TEST("str2.1");: pre_Function:MJSA_TEST(STRING) => MJSA_TEST("str2.1")
// FEATURE[InitVariable] in :User_Program, Init Variable by FunctionExpression:c=function(){MJSA_TEST("str2.2");}
// FEATURE[StringOp] in :function(){MJSA_TEST("str2.2");}: pre_Function:MJSA_TEST(STRING) => MJSA_TEST("str2.2")

// check variable scope
var test = 1;
function testScope1() {
	var test = "inner1";
	function testScope2() {
		var test = "inner2";
		MJSA_TEST(test);
	}
	MJSA_TEST(test);
}
MJSA_TEST(test);

// FEATURE[StringOp] in :testScope2: MJSA_TEST(Object->STRING) => [test] ==> MJSA_TEST("inner2")
// FEATURE[StringOp] in :testScope1: MJSA_TEST(Object->STRING) => [test] ==> MJSA_TEST("inner1")


// function redefined and override current variable in varMap
var b = MJSA_TEST;
function b(){};
b("test2");
// FEATURE[FuncObfuscation] :[ b ] -> [ MJSA_TEST ]
// FEATURE[StringOp] in :User_Program: user_Function:b(STRING) => b("test2")


// assignment override function variable in varMap
function a(){};
function b(){};
if (1>2){
	a=MJSA_TEST;
} else {
	a=b;
}
a("test");
// FEATURE[FuncObfuscation] :[ a ] -> [ MJSA_TEST ]
// FEATURE[StringOp] in :User_Program: pre_Function:a(STRING) => MJSA_TEST("test")
// FEATURE[StringOp] in :User_Program: user_Function:a(STRING) => b("test")

// prototype functions
a.prototype.myFunc=function(x) {
	return MJSA_TEST(x);
}
//FEATURE[StringOp] in :MJSA_TEST(x);;: MJSA_TEST(Object->STRING) => [x] ==> MJSA_TEST(STR)
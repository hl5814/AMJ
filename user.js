// access Array via index
var a = new Array(1,2);
a[1] = "str1";
MJSA_TEST(a[1])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str1")

// access Arrray via reference variable
var i = 1;
MJSA_TEST(a[i])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str1")

// access list via index
var l = [1,2,3];
l[2] = "str2";
MJSA_TEST(l[2])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [l,[object Object]] ==> eval("str2")

// access list via index
var i = 2;
MJSA_TEST(l[2])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [l,[object Object]] ==> eval("str2")

// multiple possible indice access
var x=["str1", "str2", "str3"];
var index = 0;
if (1>2){
	index = 1;
} else {
	index = 2;
}
MJSA_TEST(x[index]);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object],[object Object]] ==> eval("str2")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object],[object Object]] ==> eval("str3")

// multiple values for array element
var x=["str1", "str2", "str3"];
if (1>2){
	x[0] = "a";
} else {
	x[0] = "b";
}
MJSA_TEST(x[0]);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("a")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("b")

// multiple values for array object
var x = ["0",2,3];
if (1>2) {
	x = ["1"];
} else if (1>2) {
	x = ["2"];
}
MJSA_TEST(x[0]);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("0")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("2")

// use object field as array index
var a = [1,2,3];
var f = {b:2};
a[f.b] = "str";
MJSA_TEST(a[f.b]);
// FEATURE[FuncCallOnStringVariable] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str")

// field object in array
var a = [{f:"f"}];
MJSA_TEST(a[0].f)
// FEATURE[FuncCallOnStringVariable] in :User_Program: eval(Object->STRING) => [a,[object Object],[object Object]] ==> eval("f")

// nested array
var a = [ 	
			[ ["0","1"], ["2","3"] ], 
		  	[ ["4","5"], ["6","7"] ], 
		  	[ ["8","9"], ["a","b"] ]
		];
MJSA_TEST(a[2][1][0])
//  FEATURE[FuncCallOnStringVariable] in :User_Program: eval(Object->STRING) => [a,[object Object],[object Object],[object Object]] ==> eval("a")


var a = [ 	
			[ ["0","1"], ["2","3"] ], 
		  	[ ["4","5"], ["6","7"] ], 
		  	[ ["8","9"], [{test:"test"},"b"] ]
		];

var f = {b:2};
MJSA_TEST(a[f.b][1][0].test)
// FEATURE[FuncCallOnStringVariable] in :User_Program: eval(Object->STRING) => [a,[object Object],[object Object],[object Object],[object Object]] ==> eval("test")


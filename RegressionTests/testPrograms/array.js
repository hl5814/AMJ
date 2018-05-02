// access Array via index
var a = new Array(1,2);
a[1] = "str1";
eval(a[1])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str1")

// access Arrray via reference variable
var i = 1;
eval(a[i])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str1")

// access list via index
var l = [1,2,3];
l[2] = "str2";
eval(l[2])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [l,[object Object]] ==> eval("str2")

// access list via index
var i = 2;
eval(l[2])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [l,[object Object]] ==> eval("str2")

// multiple possible indice access
var x=["str1", "str2", "str3"];
var index = 0;
if (1>2){
	index = 1;
} else {
	index = 2;
}
eval(x[index]);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object],[object Object]] ==> eval("str2")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object],[object Object]] ==> eval("str3")

// multiple values for array element
var x=["str1", "str2", "str3"];
if (1>2){
	x[0] = "a";
} else {
	x[0] = "b";
}
eval(x[0]);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("a")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("b")

// multiple values for array object
var x = ["0",2,3];
if (1>2) {
	x = ["1"];
} else if (1>2) {
	x = ["2"];
}
eval(x[0]);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("0")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("2")

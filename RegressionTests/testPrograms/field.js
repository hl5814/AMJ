//regular field access
var a = {"f":0, "test":1};
a.f = "str";
eval(a.f)
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str")

//array index field access
eval(a["f"])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str")

//reference variable field access
var b = "f";
eval(a[b])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str")

//multiple values for object field
var x={a:"str1", b:"str2", c:"str3"};
if (1>2){
	x.a = "b";
} else {
	x.a = "c";
}
eval(x.a);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("b")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("c")

//multiple values for field object
var x = {a:"a"};
if (1>2) {
	x = {b:"b1"};
} else {
	x = {b:"b2"};
}
eval(x.a);
eval(x.b);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("b1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object]] ==> eval("b2")

// use array element as object field
var a = [1,"b",3];
var f = {b:2};
f[a[1]] = "str";
eval(f[a[1]]);
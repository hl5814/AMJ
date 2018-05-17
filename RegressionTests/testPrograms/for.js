// main scope variable updated in for body
var x = 0;
for (var i = 0; i < 5; i++) {
	x = "for";
}
eval(x);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("for")

// new variable created in for body
for (var i = 0; i < 5; i++) {
	var y = "for";
}
eval(y);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [y] ==> eval("for")

// variable override in condition
var testList = [1,2,3];

// [for-loop]
// CASE 1: variable declaration in condition
var c1 = "case1";
for (var c1 = 0; c1 < 5; c1 ++) {
	// do something
}
eval(c1);

// CASE 2: variable assignment in condition
var c2 = "case2";
for (c2 = 0; c2 < 5; c2 ++) {
	// do something
}
eval(c2);

// CASE 3: variable expression in condition
var c3 = "case3";
for (c3; c3 < 5; c3 ++) {
	// do something
}
eval(c3);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [c3] ==> eval("case3")

// [for-in-loop]
// CASE 4: variable declaration in condition
var c4 = "case4";
eval(c4);
for (var c4 in testList) {
	// do something
}
eval(c4);

// CASE 5: variable expression in condition
var c5 = "case5";
eval(c5);
for (c5 in testList) {
	// do something
}
eval(c5);

// [for-of-loop]
var x = ["1", "2", "3"];
for (var t of x){
	eval(t);
}

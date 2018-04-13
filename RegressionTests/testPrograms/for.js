// main scope variable updated in for body
var x = 0;
for (var i = 0; i < 5; i++) {
	x = "for";
}
eval(x);

// new variable created in for body
for (var i = 0; i < 5; i++) {
	var y = "for";
}
eval(y);


// variable override in condition
var testList = [1,2,3];

// [for-loop]
// CASE 1: variable declaration in condition
var case1 = "case1"
for (var case1 = 0; case1 < 5; case1 ++) {
	// do something
}
eval(case1);

// CASE 2: variable assignment in condition
var case2 = "case2"
for (case2 = 0; case2 < 5; case2 ++) {
	// do something
}
eval(case2);

// CASE 3: variable expression in condition
var case3 = "case3"
for (case3; case3 < 5; case3 ++) {
	// do something
}
eval(case3);

// [for-in-loop]
// CASE 4: variable declaration in condition
var case4 = "case4"
for (var case4 in testList) {
	// do something
}
eval(case4);

// CASE 5: variable expression in condition
var case5 = "case5"
for (case5 in testList) {
	// do something
}
eval(case5);
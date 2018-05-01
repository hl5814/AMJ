// // function AST() {
// // }

// // AST.prototype.foo= function(x) {
// // 	eval(x);
// // };
// // AST.a = 1;


// var f = {a:0}
// f.a = "STR";
// eval(f["a"])
// eval(x[0])

// var a = new Array(1,2);
// a[1] = "str1";
// eval(a[1])

var x={a:"str1", b:"str2", c:"str3"};
x.f = "a";
if (1>2){
	x.f = "b";
} else {
	x.f = "c";
}
eval(x.f);

// // var myAST = new AST();
// // myAST.foo("str");

// // access Array via index
// var a = new Array(1,2);
// a[1] = "str1";
// eval(a[1])
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str1")

// // access Arrray via reference variable
// var i = 1;
// eval(a[i])
// // FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [a,[object Object]] ==> eval("str1")

// // access list via index
// var l = [1,2,3];
// l[2] = "str2";
// eval(l[2])
// // FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [l,[object Object]] ==> eval("str2")

// // access list via index
// var i = 2;
// eval(l[2])
// // FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [l,[object Object]] ==> eval("str2")
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

var x=["str1", "str2", "str3"];
if (1>2){
	x[0] = "a";
} else {
	x[0] = "b";
}
eval(x[0]);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object],[object Object]] ==> eval("str2")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x,[object Object],[object Object]] ==> eval("str3")

// multiple values for array element

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
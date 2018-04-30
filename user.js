// // function AST() {
// // }

// // AST.prototype.foo= function(x) {
// // 	eval(x);
// // };
// // AST.a = 1;

// var x = [2];
// var f = {a:0}
// var c = 0;
// x[f.a] = "STR";

// eval(x[0])

// // var a = new Array(1,2);
// // a[1] = "str1";
// // eval(a[1])

// // var x=["str1", "str2", "str3"];
// // var index = 0;
// // if (1>2){
// // 	index = 1;
// // } else {
// // 	index = 2;
// // }
// // eval(index);

// // var myAST = new AST();
// // myAST.foo("str");

//regular field access
var a = {"f":0, "test":1};
a.f = "str";

//array index field access
eval(a["f"])

//reference variable field access
var b = "f";
eval(a[b])

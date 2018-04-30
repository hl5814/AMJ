// function AST() {
// }

// AST.prototype.foo= function(x) {
// 	eval(x);
// };
// AST.a = 1;

// var x = [2];
// var f = {a:0}
// var c = 0;
// x[x[c]] = "STR";

// eval(x[0])


var x = {a:1, b:2};
x.a="str";
eval(x[a]);


// var x=["str1", "str2", "str3"];
// var index = 0;
// if (1>2){
// 	index = 1;
// } else {
// 	index = 2;
// }
// eval(index);

// var myAST = new AST();
// myAST.foo("str");
// var a = [1,2,3];
// var f = {b:2};
// a[f.b] = "str";
// eval(a[f.b]);

var a = [1,"b",3];
var f = {b:2};
f[a[1]] = "str";
eval(f[a[1]]);
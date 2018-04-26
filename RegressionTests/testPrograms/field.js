//regular field access
var a = {"f":0, "test":1};
a.f = "str";
eval(a.f)

//array index field access
eval(a["f"])

//reference variable field access
var b = "f";
eval(a[b])

// eval patterns
eval("xxx");
eval("helloworld");
eval(1+1);
eval(foo(1+bar()))

// variable assignments
b = "alert(b)";
a = b;
b = c; 
c = a;
a = "xxx";
eval(c);


// function name obfuscation
var a = eval;
a("test");
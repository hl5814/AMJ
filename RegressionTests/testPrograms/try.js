// main scope variable overrided in both try/catch blocks
var x = "STR";
try{
	x = "TRY";
}catch(e){
	x = 0;
}
eval(x);

// main scope variable overrided in try block but NOT in catch block
var x = "STR";
try{
	x = "TRY";
}catch(e){}
eval(x);

// main scope variable overrided in catch block but NOT in try block
var x = "STR";
try{}catch(e){
	x = "CATCH";
}
eval(x);


// new variable created in both try/catch blocks
try{
	var z = "TRY";
}catch(e){
	var z = "CATCH";
}
eval(z);

// main scope variable override in both try/catch and finally blocks
var a = "STR";
try{
    a = "TRY";
}catch(e){
    a = "CATCH";
}finally{
    a = "FINALLY";
}
eval(a);

// init_varMap used for try/catch blocks should be main scope varMap
// init_varMap used for finally blocks should be after try/catch blocks
b = "test";
try  {
    eval(b);
    b = "TRY";
} catch(e) {
    eval(b);
    b = "CATCH";
} finally {
   eval(b);
   b = 0;
}
eval(b);
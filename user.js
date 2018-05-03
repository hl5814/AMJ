

// main scope variable override in both try/catch and finally blocks
var a = "STR5";
try{
    a = "TRY5";
}catch(e){
    a = "CATCH5";
}finally{
    a = "FINALLY5";
}
eval(a);

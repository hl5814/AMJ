var x;
x += String.fromCharCode(0);
eval(x)
// FEATURE[FunctionCall] : String.fromCharCode(0)
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval(String.fromCharCode(0))
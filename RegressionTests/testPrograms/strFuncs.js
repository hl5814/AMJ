var x;
x += String.fromCharCode(65);
eval(x)
// FEATURE[DecodeString_OR_DOM_FunctionCall] : String.fromCharCode(65)
// FEATURE[FuncCallOnStringVariable] in :User_Program: eval(Object->STRING) => [x] ==> eval(A)

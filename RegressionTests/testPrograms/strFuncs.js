var x = "a";
x += String.fromCharCode(65);
MJSA_TEST(x)
// FEATURE[DecodeString_OR_DOM_FunctionCall] : String.fromCharCode(65)
// FEATURE[FuncCallOnStringVariable] in :User_Program: MJSA_TEST(Object->STRING) => [x] ==> MJSA_TEST(A)


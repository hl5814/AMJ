// switch with default cases
var x = "main";
switch (1) {
    case 0:
        x = "0";
        break;
    case 1:
        x = "1";
        break;
    case 2:
        x = "2";
        break;
    default: 
        x = "default";
}
eval(x);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("default")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("0")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("2")

// switch without default cases
var x = "main";
switch (1) {
    case 0:
        x = "0";
        break;
    case 1:
        x = "1";
        break;
    case 2:
        x = "2";
        break;
}
eval(x);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("main")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("0")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("2")

// switch with shared code in cases
var x = "main";
switch (1) {
    case 0:
    case 1:
        x = "1";
        break;
    case 2:
        x = "2";
    case 3:
        x = "3";
        break;
}
eval(x);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("main")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("3")

// switch with default at the beginning with break
var x = "main";
switch (1) {
    default:
        x = "default";
        break;
    case 0:
    case 1:
        x = "1";
        break;
    case 2:
        x = "2";
    case 3:
        x = "3";
        break;
}
eval(x);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("default")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("3")

// switch with default at the beginning without break
var x = "main";
switch (1) {
    default:
        x = "default";
    case 0:
    case 1:
        x = "1";
        break;
    case 2:
        x = "2";
    case 3:
        x = "3";
        break;
}
eval(x);
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("1")
// FEATURE[StringOp] in :User_Program: eval(Object->STRING) => [x] ==> eval("3")








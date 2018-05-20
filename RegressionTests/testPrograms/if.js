// main scope variable overrided in both if/else blocks
var x = "main1";
if (1>2) {
    x = 0;
} else {
	x = "else1";
}
eval(x);

var x = "main2";
if (1>2) x = 0
else  x = "else2";
eval(x);


// CASE1: main scope variable overrided in if blocks
var y = "main1";
if (1>2) {
    y = 0;
    eval(y);
}

// CASE2: main scope variable overrided in both try blocks
var z = "main1";
if (1>2) {
    z = 0;
}
eval(z)

var z = "main2";
if (1>2) z = 0;
eval(z)


// CASE3: multiple if & else-if blocks but NO else block
var a = "main";
if (1>2) {
    a = "if1";
} else if (1>2) {
	a = "elseif1";
} else if (1>2) {
	a = "elseif2";
} 
eval(a);

// CASE4: multiple if & else-if blocks AND else block
var b = "main";
if (1>2) {
    b = "if1";
} else if (1>2) {
	b = "elseif1";
} else if (1>2) {
	b = "elseif2";
} else {
	b = "else"
}
eval(b);

// block-level variable ->let
var x = "main";
if (1>2) {
	let x = "if";
} else {
	let x = "else";
}
eval(x);
// FEATURE[FuncCallOnStringVariable] in :User_Program: eval(Object->STRING) => [x] ==> eval("main")

// block-level variable ->const
var y = "main";
if (1>2) {
	const y = "if";
	if (2>1) {
		eval(y);
	}
}
eval(y);

// FEATURE[FuncCallOnStringVariable] in :if_statements: eval(Object->STRING) => [y] ==> eval("if")
// FEATURE[FuncCallOnStringVariable] in :User_Program: eval(Object->STRING) => [y] ==> eval("main")








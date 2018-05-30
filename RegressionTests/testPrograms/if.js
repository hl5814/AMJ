// main scope variable overrided in both if/else blocks
var x = "main1";
if (1>2) {
    x = 0;
} else {
	x = "else1";
}
MJSA_TEST(x);

var x = "main2";
if (1>2) x = 0
else  x = "else2";
MJSA_TEST(x);


// CASE1: main scope variable overrided in if blocks
var y = "main1";
if (1>2) {
    y = 0;
    MJSA_TEST(y);
}

// CASE2: main scope variable overrided in both try blocks
var z = "main1";
if (1>2) {
    z = 0;
}
MJSA_TEST(z)

var z = "main2";
if (1>2) z = 0;
MJSA_TEST(z)


// CASE3: multiple if & else-if blocks but NO else block
var a = "main";
if (1>2) {
    a = "if1";
} else if (1>2) {
	a = "elseif1";
} else if (1>2) {
	a = "elseif2";
} 
MJSA_TEST(a);

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
MJSA_TEST(b);

// block-level variable ->let
var x = "main";
if (1>2) {
	let x = "if";
} else {
	let x = "else";
}
MJSA_TEST(x);
// FEATURE[FuncCallOnStringVariable] in :User_Program: MJSA_TEST(Object->STRING) => [x] ==> MJSA_TEST("main")

// block-level variable ->const
var y = "main";
if (1>2) {
	const y = "if";
	if (2>1) {
		MJSA_TEST(y);
	}
}
MJSA_TEST(y);

// FEATURE[FuncCallOnStringVariable] in :if_statements: MJSA_TEST(Object->STRING) => [y] ==> MJSA_TEST("if")
// FEATURE[FuncCallOnStringVariable] in :User_Program: MJSA_TEST(Object->STRING) => [y] ==> MJSA_TEST("main")








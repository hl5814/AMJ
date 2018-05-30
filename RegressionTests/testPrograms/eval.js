// eval patterns
MJSA_TEST("xxx");
MJSA_TEST("helloworld");
MJSA_TEST(1+1);
MJSA_TEST(foo(1+bar()))

// variable assignments
b = "alert(b)";
a = b;
b = c; 
c = a;
a = "xxx";
MJSA_TEST(c);


// function name obfuscation
var a = MJSA_TEST;
a("test");
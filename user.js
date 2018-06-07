var a = [1,"b",3];
var f = {b:2};
f[a[1]] = "str";
MJSA_TEST(f[a[1]]);
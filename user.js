
var x = {a:"a"};
if (1>2) {
	x = {b:"b1"};
} else {
	x = {b:"b2"};
}
eval(x.a);
eval(x.b);


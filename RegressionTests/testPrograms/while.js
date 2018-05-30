// main scope variable updated in while body
var x = "main";
while (i < 5) {
	x = "while";
}
MJSA_TEST(x);

// variable created in while body
while (i < 5) {
	y = "while";
}
MJSA_TEST(y);


// main scope variable updated in do-while body 
var i = "main";
do {
    i = "do-while"
}
while (i < 5);
MJSA_TEST(i)

// variable created in do-while body
do {
    j = "do-while"
}
while (j < 5);
MJSA_TEST(j)
// main scope variable updated in while body
var x = "main";
while (i < 5) {
	x = "while";
}
eval(x);

// variable created in while body
while (i < 5) {
	y = "while";
}
eval(y);


// main scope variable updated in do-while body 
var i = "main";
do {
    i = "do-while"
}
while (i < 5);
eval(i)

// variable created in do-while body
do {
    j = "do-while"
}
while (j < 5);
eval(j)
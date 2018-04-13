// main scope variable overrided in both if/else blocks
// TODO: check if exists else branch: 
var x = "STR1";
if (1>2) {
    x = 0;
} else {
	x = "STR2";
}
eval(x);


// main scope variable overrided in both try/catch blocks
var y = "STR2";
if (1>2) {
    y = 0;
    eval(y);
}
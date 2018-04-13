// main scope variable overrided in both if/else blocks
var x = "STR1";
if (1>2) {
    x = 0;
} else {
    x = "STR2";
}
eval(x);
// assignment override function variable in varMap
function a(){};
function b(){};
if (1>2){
	a=eval;
} else {
	a=b;
}
a("test");
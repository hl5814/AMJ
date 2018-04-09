
function a(){};
function b(){};
if (1>2){
	a=eval;
} else {
	a=b;
}

a("test");
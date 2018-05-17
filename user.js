

// var f = {b:[1,"2"]};
// eval(f.b[1]);

var f = {b:{c:{d:"d"}}, t:"c"};
eval(f["b"][f.t]["d"]);

// var f = {b:"b"};
// eval(f.b)


node main.js
node main.js -t 2
node main.js -u -v

mocha test

// https://github.com/facebook/flow

detections and analysiss of drive-





 3) suggestions for next step?
 	-- variable declarations & assignments:
 			var a = 1 + 1;
 			var a = "str1" + "str2"
 			var a = 1 + "str"
 			var a = b + 1;
 			var a = function foo(){} + 1;

 	-- handle more ways of calling a function

 	-- capture function without name

 	>> should be capture after obfuscation:
 		capture new object pattern
 		e.g. new ActiveXObject() 

 	-- function return type:
 		{function: "foo", return: '1+1'}
 		{function: "bar", return: '"string"''}

 	-- capture more malicous terms:
 		bitwaise operations:
 		a << b, b >> a
 		a |= b
 		a = 0xe1 ^ w
 		a && b

 	-- capture special way of accessing a field
 		document[write]
 		.
TODO: array related expressions


1) Build basic machine learning model using current features
2) Extend more features




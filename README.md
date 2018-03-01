node main.js
node main.js -t 2
node main.js -u -v

mocha test

// https://github.com/facebook/flow

detections and analysiss of drive-


1) how to deal with undefined variables
	b = "test";
	eval(b);
// we can assume attacker will only use eval on string, otherwise pointless
// we can put different weight on features


2) for binary expressions, should I store value or raw [for now and future]
	var x = 1 + 1 + 1;
    var x = a + b;

 >>> BinaryExpression {
  type: 'BinaryExpression',
  operator: '+',
  left: Literal { type: 'Literal', value: 1, raw: '1', range: [ 12670, 12671 ] },
  right: Literal { type: 'Literal', value: 1, raw: '1', range: [ 12672, 12673 ] },
  range: [ 12670, 12673 ] }

varMap:
 [ [ 'a', { type: 'Literal', value: '1+1' } ] ] 
or 
 [ [ 'a', { type: 'Numeric', value: '2' } ] ] 
or 
// better for symbolic execution
 [ [ 'a', { type: 'Numeric', value: '2', raw: '1+1' } ] ] 



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
TODO: URL detection



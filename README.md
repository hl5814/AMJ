node main.js
node main.js -t 2
node main.js -u -v

mocha test

// https://github.com/facebook/flow

detections and analysiss of drive-


// Count the number of occurences of patterns
// where the patters are (more statically way)

current varmap before entering branches
strore possible values in varMap 
[val1, [val2, val3]]

//==> dynamically stage, profiling on the code


Current Patterns:
================================================================
Direct Function Calls:
	-> eval(object->String)
	-> eval("STRING")
	-> eval(function_calls)
	-> eval(expressions)
	...

Function calls on object:
	-> xxx.toString()
	-> document.write()
	...

Malicious Operations:
	-> bitwiseOperations
	-> expression assignment
	[String + (anything) will be treated as type string]

Malicious Initialization:
	-> expression
	-> String
	-> functionExpressions


inner blocks check:
	->if/else
	->for
	->for in
	->while
	->do while


TODO:

1) Build basic machine learning model using current features
2) Extend more features

symbolic execution? Execution for all



change all places that calling varMap.get to parse a list





node main.js
node main.js -t 2
node main.js -u -v

mocha test

// https://github.com/facebook/flow

detections and analysiss of drive-





Current Patterns:

Malicious Function Calls:
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
	-> TODO: functions
	-> String




1) Build basic machine learning model using current features
2) Extend more features




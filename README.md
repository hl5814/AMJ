node main.js
node main.js -t 2
node main.js -u -v

<!-- unit test command for JSDetector -->
mocha test

// https://github.com/facebook/flow
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


<!-- change varMap store all possible values when encounter if branches -->
// for variables with multiple possible values (e.g. {key:a, value:[1, "string"]})
// case 1:  [equal assignment a=b]
// 		 ignore all possible values, replace with the new value on RHS
//		 ==> {key:a, value:[b]}
// case 2:  [update statements, a+=1, a=a+c]
//		 update all branches with the corresponding value
//		 ==> {key:a, value:[1+1, "string"+1]}
//
// same works for functions names
// EXAMPLE: [Program8]

<!-- change varMap store all possible values when encounter for/while blocks -->
// check for/while same way as if statements, base on the conditions
// program might skip the for/while block, therefore, we should store
// both possible values for variables encounter for/while blocks
//
// example:
//		   	var a = "STRING";
// 		   	for (var i = 0; i>5; i++) {
//				a = 0;	
//			}
//			eval(a)
// Based on static analysis, we didn't check whether the condition will be met,
// therefore we need to capture both cases.
//
// ==>varMap: {key:a, value:["STRING", 0]}

<!-- try catch finally blocks -->
// Difference between try/catch blocks and if/for/while blocks are, try catch
// has no condition, which means the previous value will always be override by either
// try branch or catch branch. whilst if/for/while blocks has condition, so we 
// still need to record previous value in the varMap
//
// example:
//			var x = 0;
//			try{
//				x = 1;
//			}catch(e){
//				x = 2;
//			}
//
// ==>varMap: {key:x, value:[1, 2]}
//
// however there exists finally block and if the same variable is updated in the 
// finally block (exists finally block), then update varMap only store the finally 
// value
//			var x = 0;
//			try{
//				x = 1;
//			}catch(e){
//				x = 2;
//			}finally {
//              x = 3;
//        	}   
// 
// ==>varMap: {key:x, value:[3]}



TODO:

1) add checks for function calls on object, e.g. XXX.toString().
2) Build basic machine learning model using current features
	==> SVM, python scikit-learn (svm)

//	from sklearn import svm
//	X = [[0, 0], [1, 1]]
//	y = [0, 1]
//	clf = svm.SVC()
//	clf.fit(X, y)
//	clf.predict([[2., 2.]])
//	>> array([1])
//
//   (x,y) ==> x : number of occurances
//		   y : total weight

3) Extend more features


TODO: change data structure from list to set, when storing all type info in variable map
otherwise, multiple same ?








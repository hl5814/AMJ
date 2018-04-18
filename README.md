JSDetector
================================================================
Malicious JavaScript Pattern Detector and Analyzer.

## Usage
#### main program:
```
node main.js [-v|verbose flag]? [-w|show weighted points for SVM]? [-s source|source file path]?
````
#### script for batch input files:
```
./checkFiles.sh [-s|--source] [filePath/directoryPath] [-v|--verbose]?
```

#### unit Test
```
mocha test
```
#### regression Test
```
./testAll.sh
```

Current Patterns:
================================================================
* Direct Function Calls:
    * eval(object->String)
    * eval("STRING")
    * eval(function_calls)
    * eval(expressions)

* Function calls on object:
	* xxx.toString()
	* document.write()

* Malicious Operations:
    * bitwiseOperations
	* expression assignment
	* [String + (anything) will be treated as type string]

* Malicious Initialization:
	* expression
	* String
	* functionExpressions


* inner blocks check:
	* if/else
	* for/for-in
	* while/do-while
	* function body

## Updates for variables with multiple possibe values
for variables with multiple possible values (e.g. {key:a, value:[1, "string"]})
#### case 1:  [equal assignment a=b]
ignore all possible values, replace with the new value on RHS
==> {key:a, value:[b]}
#### case 2:  [update statements, a+=1, a=a+c]
update all branches with the corresponding value
==> {key:a, value:[1+1, "string"+1]}

p.s. same works for functions names

Special JS Blocks Parsing
================================================================
## if blocks 
for single if statement, store both possible values in main scope and if block 
#### example:
		   	var a = "MAIN";
 		   	if (...) {
				a = "IF";	
			}
 
 ==>varMap:
 >{key:a, value:["MAIN", "IF"]}

 for an if-else statement, store both possible values in if block and else block
#### example:
		   	var a = "MAIN";
 		   	if (...) {
				a = "IF";	
			} else {
				a = "ELSE";
			}

 Even if we don't know whether if-branch or else-branch will be executed, but we know
 one of them will be executed, therefore if there exists an else branch, we need to forget
 about the main scope value
 ==>varMap:
 >{key:a, value:["IF", "ELSE"]}


same logic works for if-elseif statements (if exists else branch, ignore main scope)
#### example:
	        var a = "MAIN";
            if (...) {
				a = "IF";	
			} else if (...) {
				a = "ELSE-IF";
			}

==>varMap:
>{key:a, value:["MAIN","IF", "ELSE-IF"]}

#### example:
            var a = "MAIN";
            if (...) {
				a = "IF";	
			} else if (...) {
				a = "ELSE-IF";
			} else {
				a = "ELSE";
			}

==>varMap:
>{key:a, value:["IF", "ELSE-IF","ELSE"]}


## for blocks
for for statements we check it in the same way as if statements, base on the conditions
program might skip the for block, therefore, we should store
both possible values for variables encounter for blocks

## [REMARK]: 
for condition will always be executed, for body is conditional
i.e. variables in for condition will always be updated first
then for body will be treated as possible values. Based on static analysis, we didn't check whether the condition will be met,
therefore we need to capture both cases.

#### example:
            var a = "STRING_A";
            var i = "STRING_I"
            for (var i = 0; i>5; i++) {
				a = 0;	
			}

==>varMap:
>{key:a, value:["STRING_A", 0]} <br />
>{key:i, value:[0]}

when a variable is overwritten in the condition line, the problem became more complicated
it has 5 different cases (details see RegressionTests/testPrograms/for.js)

## KNOWN ISSUE: 
current implementation is get the code and parse it with empty varMap in order 
to get the variable name, and check if value is undefined,  however, empty map 
will cause issues with array element and object field

#### e.g. 	
            for(a[0];a[0]<2;a[0]++){}
            for(a.f;a.f<2;a.f++){}


## while blocks
different to for blocks, while blocks don't have assignment in condition, so we only need
to parse its body and update all possible values in varMap
#### example:
		   	var a = "STRING";
 		   	while (i>5) {
				a = 0;	
			}

==>varMap:
>{key:a, value:["STRING", 0]}

however, for do-while blocks, the code in body will always be executed at lease once
therefore, we just need to parse the body once and overwrite values in varMap
#### example:
		   	var a = "STRING";
 		   	do {
				a = 0;	
			} while(i>5);

==>varMap:
>{key:a, value:[0]}



## try catch finally blocks
Difference between try/catch blocks and if/for/while blocks are, try catch
has no condition, which means the previous value will always be override by either
try branch or catch branch. whilst if/for/while blocks has condition, so we 
still need to record previous value in the varMap

#### example:
            var x = 0;
			try{
				x = 1;
			}catch(e){
				x = 2;
			}

==>varMap:
>{key:x, value:[1, 2]}

however there exists finally block and if the same variable is updated in the 
finally block (exists finally block), then update varMap only store the finally 
value
#### example:
			var x = 0;
			try{
				x = 1;
			}catch(e){
				x = 2;
			}finally {
              x = 3;
        	}   
 
==>varMap:
>{key:x, value:[3]}


# SVM
### Machine Learning Matrices 1: [#features-captured, weights]
when parsing the JS code, detect features, and given each feature a
corresponding weight points (multiplied by a scope coefficient), e.g.
feature in for loop should be more malicious (i.e. has higher weight)


### Machine Learning Matrices 2: [#JS-keywords, length-of-input-codes]
count number of javascript keywords in a given piece of code
very few keywords but long code ==>? malicious.

* CASE 1:
    * [hidden codes in html comments <!-- malicious JS codes -->, and then use some other simple codes to remove the comments and execute]

* CASE 2:
    * long string manipulation





# TODO:
## (1)Build basic machine learning model using current features 
==> SVM, python scikit-learn (svm)

        from sklearn import svm
        X = [[0, 0], [1, 1]]
        y = [0, 1]
        clf = svm.SVC()
        clf.fit(X, y)
        clf.predict([[2., 2.]])
        >> array([1])
        
(x,y) ==> x : number of occurances
y : total weight

## (2) issues with error html links, e.g. "var x = http:...."

// https://github.com/facebook/flow
//==> dynamically stage, profiling on the code

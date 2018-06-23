AMJ [Analyzer for Malicious JavaScript]
================================================================
Parse the given JavaScript Codes and extract features, and then cluster the given samples into different groups.

## Usage
#### main program:
```
node main.js [-v|verbose flag]? [-w|show weighted points for SVM]? [-s source|source file path]?
````
#### unit Test
```
mocha test
```
#### regression Test
```
./testAll.sh
```
#### script for batch input files:
```
./checkFiles.sh [-s|--source] [filePath/directoryPath] [-v|--verbose]?
```
EXAMPLE:
```
./checkFiles.sh -s /Users/hongtao/Desktop/IndividualProject/jsob/samples/badstuff/malwareforum/  > Clustering/Feature_Scope_Keyword_Punctuator.csv
```
#### clustering
```
usage: cluster.py [-h] [-d] level
	python3 Clustering/cluster.py 5
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
	* pre-defined String Functions (e.g. String.fromCharCode)

* Malicious Initialization:
	* expression
	* String
	* functionExpressions

* inner blocks check:
	* if/else
	* for/for-in
	* while/do-while
	* try/catch/finally
	* switch cases
	* function body

## Data Structure used for tracking variables: varMap [Variable Map]
use the variable name as the varMap key (String type)
use a list to store all possible values, value based on the variable types
#### String, Number
{key: variable_name, value: [raw_values]}
#### ArrayExpression & NewExpression
{key: variable_name, value: [["index1", [values]],["index2",[values]]]}
#### ObjectExpression
{key: variable_name, value: [["field1", [values]],["field2",[values]]]}
#### object reference
will check the current varMap, and assign the corresponding value for the reference object as its value.
e.g. 
==>varMap:
>{key : a, value : "a"}

	var b = a;

==>varMap:

>{key : a, value : "a"}, {key : b, value : "a"}

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

## [REMARK]: forOfExpression, we check on all possible values in the array,
		var x = ["1", "2", "3"];
		for (var t of x){
			// when parsing for body, we have {key:t, value:["1", "2", "3"]}
			eval(t);
		}


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


## switch cases blocks
Switch cases blocks, might has an default case or not. Switch-with-default will update the 
main scope variable into default value if non of the case matches. 

#### example:
            var x = "main";
			switch (1) {
			    case 0:
			        x = "0";
			        break;
			    case 1:
			        x = "1";
			        break;
			    default: 
			        x = "default";
			}

==>varMap:
>{key:x, value:["0", "1", "default"]}

However for switch-without-default, main scope variable might keep its previous value.
#### example:
            var x = "main";
			switch (1) {
			    case 0:
			        x = "0";
			        break;
			    case 1:
			        x = "1";
			}

==>varMap:
>{key:x, value:["main", "0", "1"]}

Switch cases statements might share code body between cases (no break instruction at the end of case).
#### example:
            var x = "main";
			switch (1) {
			    case 0:
			        x = "0";
			    case 1:
			        x = "1";
			        break;
			    case 2:
			    	x = "2";
			}

==>varMap:
>{key:x, value:["main", "1", "2"]}

# SequenceExpression
In JavaScript, SequenceExpression will be executed from left to right, and if this happends on the right hand side of an variable inialization, the variable on the left hand side will get the value of last expression in the sequence.
#### example:
	var x = (1,2,3) //x=3
	var x,y,z;
	x = (y=1, z=2) // x=2,y=1,z=2


# Other:
// https://github.com/facebook/flow
//==> dynamically stage, profiling on the code
// unsupervised clustering

# Install Script
`./instalAMJ.sh`




//================================Setup======================================
const HashMap = require('hashmap');					  // load hashmap
const esprima = require('esprima');					  // load esprima
const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
const Functions = require('./functions'); 			  // load helper functions
const commandLineArgs = require('command-line-args'); // load command-line-args

//===================parse command line arguments============================
const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean }
]
const options = commandLineArgs(optionDefinitions)
var verbose = options.verbose;

//===============================MainProgram=================================
function parseProgram(program, verbose){
	console.log("Program:\n" + program);
	var ast = ASTUtils.parse(program);
	var varMap = new Functions.VariableMap(new HashMap());

	// iterate through each AST node
	for (var i in ast.body){
		var node = ast.body[i];
		var range = node.range;
		
		if (verbose) console.log("AST Node:\n", ASTUtils.getCode(node));
		var raw_tokens = ASTUtils.getTokens(ast,range[0],range[1]);
		if (verbose) console.log("Tokens:\n", raw_tokens);

		// TODO: use better way to check functions
		// check if this is function scope
		var functionName = "";
		if (node.type == 'FunctionDeclaration') {
			functionName = node.id.name
		}

		for (var i = 0; i < raw_tokens.length-3; i++) { 
			// TODO: other 3 tokens pattern
			// check for token patterns with length 3
		    var subTokens_3 = new Functions.Tokens(raw_tokens.slice(i, i+3));
		    if (subTokens_3.isObjAssignment()) {
		    	if (functionName.length != 0) subTokens_3._tokens[0].value += ("_"+functionName);
	    		if (verbose) console.log("isObjAssignment:\n",subTokens_3._tokens,"\n");
	    		varMap.updateObjVarMap(subTokens_3._tokens[0].value, subTokens_3._tokens[2], verbose);
		    } else if (subTokens_3.isAssignment()){
		    	if (functionName.length != 0) subTokens_3._tokens[0].value += ("_"+functionName);
	    		if (verbose) console.log("isAssignment:\n",subTokens_3._tokens,"\n");
	    		varMap.updateValueVarMap(subTokens_3._tokens[0].value, subTokens_3._tokens[2], verbose);
			}
			
			// TODO: other 4 tokens pattern
			// check for token patterns with length 4
			var subTokens_4 = new Functions.Tokens(raw_tokens.slice(i, i+4));
		    if (subTokens_4.isEval()) {
		    	if (subTokens_4._tokens[2].type == "String") {
		    		console.log("Pattern Detected: eval(STRING) ==> [eval(" + subTokens_4._tokens[2].value + ")]");
		    	} else {
		    		if (functionName.length != 0) subTokens_4._tokens[2].value += ("_"+functionName);
		    		var value = varMap.get(subTokens_4._tokens[2].value);
		    		// console.log(subTokens_4._tokens[2].value)
		    		// console.log(value)
			    	if (value.type == "String") {
			    		console.log("Pattern Detected: eval(Object->STRING) => [" + subTokens_4._tokens[2].value + "] ==> eval(" + value.value + ")");
			    	}
			    }
		    }
		}
	}
	console.log("--------------------------------------------")
}


//===============================TestProgram=================================
var program0 = 
`	eval("xxx");`;
var program1 = 
`	var a = "alert(a)";
	var b = "eval(b)";
	eval("helloworld");
	eval(a);
	eval(b)`;
var program2 = 
`	b = "alert(b)";
	a = b; 
	b = c; 
	c = a;
	a = "xxx";
	eval(c);`;
var program3 = 
`	a = b; 
	b = c; 
	c = a;
	a = "xxx";
	eval(c);`;
var program4 = 
`	a = "eval(b)"`;
var program5 =
`	var test = 1;
	function testScope() {
		var test = "LOCAL";
		eval(test);     
	}
	eval(test);`;

// // TODO1: Keyword Substitution {Object->eval(STRING)}
// var program = 
// `	var a = "alert()";
// 	b = eval; 
// 	b(a);`;
// // TODO2: function return STR  {eval(Function()->STRING)}
// var program = 
// `	function foo(){
// 		return "alert()"
// 	}
// 	b(foo());`;
// parseProgram(program0, verbose);
// parseProgram(program1, verbose);
// parseProgram(program2, verbose);
// parseProgram(program3, verbose);
// parseProgram(program4, verbose);
parseProgram(program5, verbose);


//TEST esprima-ast-utils
//var ast = ASTUtils.parseFile("./sample.js")
// console.log(ast.body[1])
// console.log(ast.body[1].id.name) // get function name 
// console.log(ASTUtils.getArgumentList(ast));
// console.log(ASTUtils.getCode(ast.body[1])) // get code for one node
// console.log(ast.body[1].range) // get range of one node
// //console.log(ast.tokens) // get tokens
// //console.log(ast.body[0]) // get one node from the AST
// console.log(ASTUtils.getTokens(ast,15,84)); // get one node from the AST
// console.log(ASTUtils.hasVarDeclaration(ast.body[1],"test")) // check if variable is declared in that node
// // get function
// console.log(ASTUtils.getFunction(ast,"testScope")) 
// console.log(ASTUtils.getFunction(ast.body[0],"testScope")) 


// //TEST function extractor !!Can't detect all functions!!
// var fs = require("fs");
// var functionExtractor = require("function-extractor"); 
// var source = fs.readFileSync("./sample.js", "utf8") 
// var functions = functionExtractor.parse(source);
// console.log(functions)


// https://github.com/facebook/flow







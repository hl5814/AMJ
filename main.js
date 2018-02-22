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
	const ast = ASTUtils.parse(program);
	const varMap = new Functions.VariableMap(new HashMap());

	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);
		if (verbose) console.log("======================\n", ast.body[i],"\n======================\n");
		if (astNode.isVariableDeclaration(i)) {
			var variableName_Type = astNode.getAllVariableNames(i);
			for (var i in variableName_Type) {
				var var_type = variableName_Type[i];
				varMap.updateVariable(var_type[0], var_type[1]);
			}
		}
		else if (astNode.isExpressionStatement(i)) {
			if (astNode.isAssignmentExpression(i)) {
				var var_value = astNode.getEqualAssignmentLeftRight(i);
				varMap.updateVariable(var_value[0], var_value[1]);
			}
			if (astNode.isEval(i)) {
				var args = astNode.getFunctionArguments(i);
				if (args.length == 1) {
					if (args[0].type == "String") {
						console.log("Pattern Detected: eval(STRING) => [" + args[0].value + "]");
					} else if (args[0].type == "Identifier") {
						var ref_value = varMap.get(args[0].value);
						if (ref_value.type == "String") {
							console.log("Pattern Detected: eval(Object->STRING) => [" + args[0].value + "] ==> eval(" + ref_value.value + ")");
						}
					}
				}
			}
		}
	}
	if (verbose) varMap.printMap();
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
var programUnescape = 
`
	var a = 2;
	var b = "test";
	var c,d = a;
	b = c;
`;


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
// parseProgram(program5, verbose);


parseProgram(program1, verbose);





// https://github.com/facebook/flow







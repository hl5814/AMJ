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
function parseProgram(program, scope, verbose){
	console.log(scope + ":\n" + program);
	const ast = ASTUtils.parse(program);
	const varMap = new Functions.VariableMap(new HashMap());

	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);

		//console.log(ast.body[i])
		if (verbose) console.log("======================\n", ast.body[i],"\n======================\n");
		if (astNode.isVariableDeclaration(i)) {
			var variableName_Type = astNode.getAllVariableNames(i);

			for (var i in variableName_Type) {
				var var_type = variableName_Type[i];
				varMap.setVariable(var_type[0], var_type[1]);
				if (verbose) varMap.printMap();
			}
		}
		else if (astNode.isExpressionStatement(i)) {
			if (astNode.isAssignmentExpression(i)) {
				var var_value = astNode.getEqualAssignmentLeftRight(i);
				varMap.updateVariable(var_value[0], var_value[1]);
			} else {
				//List of malicious pre-defined functions
				var funcNames = ["eval", "unescape"];

				var funcName = astNode.getCalleeName(i);

				var var_value = varMap.get(funcName);
				if (var_value != undefined){
					funcName = funcName + ":" + var_value.value + ""
				}
				if (funcNames.indexOf(funcName) != -1 || funcNames.indexOf(var_value.value) != -1) {
					var args = astNode.getFunctionArguments(i);
					if (args.length == 1) {
						if (args[0].type == "String") {
							console.log("Pattern Found in " + scope + ": " + funcName + "(STRING) => " + funcName + "[" + args[0].value + "]");
						} else if (args[0].type == "Identifier") {
							var ref_value = varMap.get(args[0].value);
							if (ref_value && ref_value.type == "String") {
								console.log("Pattern Found in " + scope + ": "+funcName+"(Object->STRING) => [" + args[0].value + "] ==> "+funcName+"(" + ref_value.value + ")");
							}
						} else if (args[0].type == "BinaryExpression") {
							console.log("Pattern Found in " + scope + ": "+funcName+"(BinaryExpression) => "+funcName+"[" + args[0].value + "]");
						} else if (args[0].type == "UnaryExpression") {
							console.log("Pattern Found in " + scope + ": "+funcName+"(UnaryExpression) => "+funcName+"[" + args[0].value + "]");
						} else if (args[0].type == "CallExpression") {
							console.log("Pattern Found in " + scope + ": "+funcName+"(CallExpression) => "+funcName+"[" + args[0].value + "]");
						} 
					}
				}
			}
		} 
		else if (astNode.isFunctionDeclaration(i)) {
			// TODO:function without name
			funcName = astNode.getFunctionName(i);
			varMap.setVariable(funcName, { type: 'Identifier', value: funcName });
			parseProgram(ASTUtils.getCode(ast.body[i].body).slice(1, -1), funcName, false);
		}
	}
	if (verbose) varMap.printMap();
}

//TODO:seprate test programs to another js file by default
//TODO:create a test.js file, allow program run from -f flag
//TODO:function without name
//===============================TestProgram=================================
// var program0 = 
// `	eval("xxx");`;
// var program1 = 
// `	eval("helloworld");
// 	eval(1+1);
// 	eval(foo(1+bar()))`;
// var program2 = 
// `	b = "alert(b)";
// 	a = b; 
// 	b = c; 
// 	c = a;
// 	a = "xxx";
// 	eval(c);`;
// var program3 = 
// `	a = b; 
// 	b = c; 
// 	c = a;
// 	a = "xxx";
// 	eval(c);`;
// var program4 = 
// `	var a = "test";
// 	unescape(a)`;
// var program5 =
// `	var test = 1;
// 	function testScope1() {
// 		var test = "inner1";
// 		function testScope2() {
// 			var test = "inner2";
// 			eval(test);     
// 		}
// 		eval(test);
// 	}
// 	eval(test);
// 	var b = 1;
// 	var c = "c";
// 	function foo(){var a = 1+1;};
// 	var d = c;
// 	eval(d);
// 	function bar(){var x = "2"};`;
var program6 =`
	var a = eval;
	function a(){};
	a("test");`
var program7 =`
	var a = eval;
	a("test");`


// TODO: variable scope
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
// parseProgram(program0, "Program", verbose);
// parseProgram(program1, "Program", verbose);
// parseProgram(program2, "Program", verbose);
// parseProgram(program3, "Program", verbose);
// parseProgram(program4, "Program", verbose);
parseProgram(program6, "Program", verbose);
parseProgram(program7, "Program", verbose);


// parseProgram(program1, verbose);





// https://github.com/facebook/flow







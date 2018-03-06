//================================Setup======================================

const HashMap = require('hashmap');					  // load hashmap
const esprima = require('esprima');					  // load esprima
const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
const Functions = require('./functions'); 			  // load helper functions
const commandLineArgs = require('command-line-args'); // load command-line-args
const fs = require('fs');

//===================parse command line arguments============================

const optionDefinitions = [
  { name: 'verbose',      alias: 'v', type: Boolean },
  { name: 'readFromFile', alias: 'u', type: Boolean},
  { name: 'testNumber',   alias: 't', type: Number }
]
const options = commandLineArgs(optionDefinitions)
var verbose = options.verbose;
var readFile = options.readFromFile;
var testNumber = (options.testNumber == undefined) ? -1 : options.testNumber;

//===============================MainProgram=================================

function parseProgram(program, scope, verbose){
	console.log(scope + ":\n" + program);
	const ast = ASTUtils.parse(program);
	const varMap = new Functions.VariableMap(new HashMap());
	varMap.setVariable('eval', { type: 'Function', value: 'eval' } );


	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);

		//console.log(ast.body[i])
		if (verbose && (ast.body[i].type != "Line")) console.log("======================\n", ast.body[i],"\n======================\n");
		if (astNode.isVariableDeclaration(i)) {
			var declaration_blocks = astNode.getAllDeclarationBlocks(i);
			for (var block in declaration_blocks) {
				var variableName_Type = astNode.getVariableInitValue(i, declaration_blocks[block], varMap, verbose);
				if (variableName_Type[1].type == "ArrayExpression" || 
					variableName_Type[1].type == "NewExpression") {
					var array_elems = variableName_Type[1].value;
					for (var e in array_elems) {
						varMap.setVariable(array_elems[e][0], array_elems[e][1], verbose);
					}
				} else {
					if (variableName_Type[1].type == "Expression") {
						console.log("Pattern Found in " + scope + ", Init Variable by Expression:" + variableName_Type[0] + "=" +variableName_Type[1].value);
					}
					varMap.setVariable(variableName_Type[0], variableName_Type[1], verbose);
				}
				if (verbose) varMap.printMap();
			}
		}
		else if (astNode.isExpressionStatement(i)) {
			if (astNode.isAssignmentExpression(i)) {
				var var_value = astNode.getEqualAssignmentLeftRight(i, varMap);

				varMap.updateVariable(var_value[0], var_value[1], verbose);
			} else {
				//console.log(ast.body[i].expression.callee.object);
				//console.log(ast.body[i].expression.callee.property);


				//List of malicious pre-defined functions
				var funcNames = ["eval", "unescape", "replace", "write", "atob", "btoa",
								 "setTimeout", "setInterval", "fromCharCode"];
				var funcName = astNode.getCalleeName(i);

				var var_value = varMap.get(funcName, verbose);
				var user_defined_funName = "";
				if (var_value != undefined && var_value.value != funcName){
					console.log("Malicious Function Call Catched:[", funcName, "] -> [", var_value.value, "]")
					user_defined_funName = var_value.value;
				}
				if (funcNames.indexOf(funcName) != -1 || funcNames.indexOf(user_defined_funName) != -1) {
					var args = astNode.getFunctionArguments(i, varMap);
					// JS will ignore extra parameters, if function is defined with only one parameter
					// Attacker might add more unused parameters to confuse the detector
					if (args.length >= 1) {
						if (args[0].type == "String") {
							console.log("Pattern Found in " + scope + ": " + funcName + "(STRING) => " + funcName + "[" + args[0].value + "]");
						} else if (args[0].type == "Identifier" ||
								   args[0].type == "MemberExpression") {
							var ref_value = varMap.get(args[0].value, verbose);
							//get value of nested memberexpression e.g. a="str"; Array[0] = a;
							if (ref_value && ref_value.type == "String") {
								console.log("Pattern Found in " + scope + ": "+funcName+"(Object->STRING) => [" + args[0].value + "] ==> "+funcName+"(" + ref_value.value + ")");
							} else if (ref_value && ref_value.type == "Expression") {
								console.log("Pattern Found in " + scope + ": "+funcName+"(Expr) => [" + args[0].value + "] ==> "+funcName+"(" + ref_value.value + ")");
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
	console.log("-------------------------------------------\n")
	if (verbose) varMap.printMap();
}

//===================check input source============================

if (readFile) {
	var program = fs.readFileSync("user.js", "utf8");
	parseProgram(program, "User_Program", verbose);
} else {
	var testPrograms = require('./testPrograms');
	if (testNumber == -1) {
		for (var t in testPrograms.programs) {
			parseProgram(testPrograms.programs[t], "Program"+t, verbose);
		}
	} else {
		parseProgram(testPrograms.programs[testNumber], "Program"+testNumber, verbose);
	}
	
}







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
var init_varMap = new Functions.VariableMap(new HashMap());

var funcNames = ["eval", "unescape", "replace", "document.write", "atob", "btoa",
				 "setTimeout", "setInterval", "toString", "String.fromCharCode"];
for (var f in funcNames) {
	init_varMap.setVariable(funcNames[f], [{ type: 'pre_Function', value: funcNames[f] }] );
}

function parseProgram(program, scope, varMap, verbose){
	if (verbose) console.log(scope + ":\n" + program);
	const ast = ASTUtils.parse(program);
	
	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);

		// console.log(ast.body[i])
		if (verbose && (ast.body[i].type != "Line")) console.log("======================\n", ast.body[i],"\n======================\n");
		if (astNode.isVariableDeclaration(i)) {
			var declaration_blocks = astNode.getAllDeclarationBlocks(i);
			for (var block in declaration_blocks) {
				var variableName_Type = astNode.getVariableInitValue(i, declaration_blocks[block], varMap, verbose);
				var variableName_Types = variableName_Type[1];

				for (var v in variableName_Types) {
					if (variableName_Types[v].type == "ArrayExpression" || 
						variableName_Types[v].type == "NewExpression") {
						var array_elems = variableName_Types[v].value;
						for (var e in array_elems) {
							varMap.setVariable(array_elems[e][0], array_elems[e][1], verbose);
						}
					} else {
						if (variableName_Types[v].type == "Expression") {
							console.log("=# Pattern Found in " + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + "=" +variableName_Types[v].value);
						} else if (astNode.hasFunctionExpression(i)) {
							console.log("=# Pattern Found in " + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + "=" +variableName_Types[v].value);
							var blocks = astNode.getFunctionBodyFromFunctionExpression(i);
							for (var b in blocks){
								// parse function body
								parseProgram(blocks[b], variableName_Types[v].value, varMap, verbose);
							}
						}
						varMap.setVariable(variableName_Type[0], [variableName_Types[v]], verbose);
					}
					if (verbose) varMap.printMap();
				}
			}
		}
		else if (astNode.isExpressionStatement(i)) {

			if (astNode.isAssignmentExpression(i)) {

				var var_values = astNode.getAssignmentLeftRight(i, varMap, verbose);

				for (var i in var_values[1]){
					if (var_values[1][i].type == "BitwiseOperationExpression" ||
						var_values[1][i].type == "FunctionCall") {
						console.log("=# Malicious Assigment Found in:" + scope + ", "+var_values[1][i].type +":" + var_values[0] + "=" +var_values[1][i].value);
					} else if (var_values[1][i].type == "FunctionExpression") {
						//parse function body
						parseProgram(var_values[1][i].value, var_values[1][i].value, varMap, verbose);
					}
				}

				varMap.updateVariable(var_values[0], var_values[1], verbose);
			} else if (astNode.isUpdateExpression(i)) {
				var var_value = astNode.getUpdateExpression(i, varMap, verbose);
				// no point to track ++, --
			} else if (astNode.isCallExpression(i) || astNode.isExpressionStatement(i)) {
				//console.log(ast.body[i].expression.callee.object);
				//console.log(ast.body[i].expression.callee.property);


				//List of malicious pre-defined functions
				var funcName = "";
				if (astNode._node.body[i].expression.callee) {
					funcName = astNode.getCalleeName(i, varMap);
				}
				
				var var_values = varMap.get(funcName);

				for (var v in var_values) {
					if (var_values[v].type != "pre_Function") {
						continue; 
					}

					var user_defined_funName = "";

					if (var_values != undefined && var_values[v].value != funcName && var_values[v].type == "pre_Function"){
						console.log("=# Malicious Function Call Found:[", funcName, "] -> [", var_values[v].value, "]")
						user_defined_funName = var_values[v].value;
					}
					if (funcName != funcName.substring(funcName.lastIndexOf(".")+1)){
						var args = astNode.getFunctionArguments(i, varMap);
						var argStr = "";
						for (var a in args) {
							argStr += args[a].value
						}
						console.log("=# Malicious Function Call Found:", funcName + "("+argStr+")");
					}

					
					// if (funcNames.indexOf(funcName) != -1 || funcNames.indexOf(user_defined_funName) != -1) {
					var funcNames = varMap.get(funcName);
					for (var f in funcNames) {
						//console.log(">>",funcNames[f], user_defined_funName)
						
						if (funcNames[f].type == "pre_Function" || user_defined_funName == funcNames[f].value) {

							var args = astNode.getFunctionArguments(i, varMap);

							// JS will ignore extra parameters, if function is defined with only one parameter
							// Attacker might add more unused parameters to confuse the detector
							if (args.length >= 1) {
								if (args[0].type == "String") {
									console.log("=# Pattern Found in " + scope + ": " + funcName + "(STRING) => " + funcName + "[" + args[0].value + "]");
								} else if (args[0].type == "Identifier" ||
										   args[0].type == "MemberExpression") {
									var ref_values = varMap.get(args[0].value, verbose);
									//get value of nested memberexpression e.g. a="str"; Array[0] = a;
									for (var i in ref_values) {
										if (ref_values[i] && ref_values[i].type == "String") {
											console.log("=# Pattern Found in " + scope + ": "+funcName+"(Object->STRING) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[i].value + ")");
										} else if (ref_values[i] && ref_values[i].type == "Expression") {
											console.log("=# Pattern Found in " + scope + ": "+funcName+"(Expr) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[i].value + ")");
										}
									}							
								} else if (args[0].type == "BinaryExpression" || args[0].type == "UnaryExpression" || args[0].type == "CallExpression") {
									console.log("=# Pattern Found in " + scope + ": "+funcName+"(" + args[0].type + ") => "+funcName+"[" + args[0].value + "]");
								}
							}
						}
					}
				}
			} else {
				console.log("??", astNode._node.body[i].type)
			}
		} else if (astNode.isFunctionDeclaration(i)) {
			// TODO:function without name
			funcName = astNode.getFunctionName(i);
			varMap.setVariable(funcName, [{ type: 'user_Function', value: funcName }]);
			const emptyVarMap = new Functions.VariableMap(new HashMap());
			init_varMap.copy(emptyVarMap);
			parseProgram(ASTUtils.getCode(ast.body[i].body).slice(1, -1), funcName, emptyVarMap, verbose);
		} else if (astNode.isIfStatement(i)) {
			var branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			// console.log(branchExprs);
			

			const emptyVarMap = new Functions.VariableMap(new HashMap());
			varMap.copy(emptyVarMap);

			const changeVarMap = new Functions.VariableMap(new HashMap());

			for (var b in branchExprs){
				var subVarMapList = parseProgram(branchExprs[b], "if_statements", emptyVarMap, verbose);

				//TODO check list difference method
				for (var l in subVarMapList) {
					var key = subVarMapList[l].key;
					var value = subVarMapList[l].value;

					var prevValues = varMap.get(key);
					for (var v in prevValues) {
						if (prevValues[v] != value[0]) {						
							//console.log("DIFF["+key+"] -> before:", varMap.get(key), "  now:",value);
							if (changeVarMap.get(key)) {
								var alternative_value = changeVarMap.get(key);
								changeVarMap.setVariable(key, alternative_value.concat(value));
							} else {
								changeVarMap.setVariable(key, value);
							}
						}
					}
				}

				changeVarMap.multipleUpdate(varMap);
			}
		} else if (astNode.isForStatement(i)) {
			var bodyExprs = astNode.parseForStatement(i, varMap, verbose);
			for (var b in bodyExprs){
				parseProgram(bodyExprs[b], "for_statements", varMap, verbose);
			}
		} else if (astNode.isWhileStatement(i)) {
			var bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			for (var b in bodyExprs){
				parseProgram(bodyExprs[b], "for_statements", varMap, verbose);
			}
		} 
	}
	if (verbose)  console.log("-------------------------------------------\n")
	if (verbose) varMap.printMap();
	return varMap.toList();
}

//===================check input source============================

if (readFile) {
	var program = fs.readFileSync("user.js", "utf8");
	parseProgram(program, "User_Program", init_varMap, verbose);
} else {
	var testPrograms = require('./testPrograms');
	if (testNumber == -1) {
		for (var t in testPrograms.programs) {
			parseProgram(testPrograms.programs[t], "Program"+t, init_varMap, verbose);
		}
	} else {
		parseProgram(testPrograms.programs[testNumber], "Program"+testNumber, init_varMap, verbose);
	}
	
}







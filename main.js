//================================Setup======================================
const HashMap = require('hashmap');					  // load hashmap
const esprima = require('esprima');					  // load esprima
const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
const Functions = require('./functions'); 			  // load helper functions
const commandLineArgs = require('command-line-args'); // load command-line-args
const fs = require('fs');

//===================parse command line arguments============================
const optionDefinitions = [
  { name: 'verbose',      alias: 'v', type: Number },
  { name: 'weight',	 	  alias: 'w', type: Boolean},
  { name: 'testNumber',   alias: 't', type: Number },
  { name: 'src', 		  alias: 's', type: String }
]

const options = commandLineArgs(optionDefinitions)
const calcualteWeight = options.weight; 
const testNumber = (options.testNumber == undefined) ? -1 : options.testNumber;
const verbose = (options.verbose === undefined) ? 0 : (options.verbose === null)? 1 : 2;
const filePath = options.src;

//===============================MainProgram=================================
var init_varMap = new Functions.VariableMap(new HashMap());

var funcNames = ["eval", "unescape", "replace", "document.write", "atob", "btoa",
				 "setTimeout", "setInterval", "toString", "String.fromCharCode"];
for (var f in funcNames) {
	init_varMap.setVariable(funcNames[f], [{ type: 'pre_Function', value: funcNames[f] }] );
}

// {key: featureType, value: [occurances, weight]}
var resultMap = new HashMap();
var featureMap = new HashMap();

const scopeCoefficient = {  "main" 		: 1,
							"if"    	: 1.5,
							"for"   	: 2,
							"while" 	: 2,
							"function"	: 3,
							"try"		: 2};

const featureWeight = { "InitVariable" 		: 1,
					    "Assignment"   		: 2,
						"FunctionCall" 		: 3,
						"ExpressionOp" 		: 4,
						"StringOp"	   		: 5,
						"FuncObfuscation" 	: 5};





function updateResultMap(resultMap, featureType, coef) {
	var prevValue = resultMap.get(featureType);
	if (prevValue) {
		resultMap.set(featureType, [prevValue[0]+1, prevValue[1] + coef * featureWeight[featureType]]);
	} else {
		resultMap.set(featureType, [1, coef * featureWeight[featureType]]);
	}
}

function showResult(resultMap) {
	var totalOccurances = 0;
	var totalWeight     = 0;
	console.log("Features \t|Occurances\t|TotalWeight");
	console.log("--------------------------------------------")
	resultMap.forEach(function(value, key){
		console.log(key, "\t|\t", value[0], "\t|\t", value[1]);
		totalOccurances += value[0];
		totalWeight     += value[1];
	});
	console.log("--------------------------------------------")
	console.log("Total \t\t|\t", totalOccurances, "\t|\t", totalWeight);
	console.log("POINT:",totalOccurances+","+totalWeight)
}


function parseProgram(program, scope, coefficient, varMap, hasReturn, verbose){
	// console.log(scope + ":\n\n>>>" + program, "<<<\n\n\n");
	var ast;
	if (hasReturn) {
		ast = ASTUtils.parseWrap(program);
	} else {
		ast = ASTUtils.parse(program);
	}
	hasReturn = false;

	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);

		// console.log(ast.body[i])
		if (verbose>1 && (ast.body[i].type != "Line")) console.log("======================\n", ast.body[i],"\n======================\n");
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
							if (verbose>0) console.log("FEATURE[InitVariable] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + "=" +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariable", coefficient);
						} else if (astNode.hasFunctionExpression(i)) {
							if (verbose>0) console.log("FEATURE[InitVariable] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + "=" +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariable", coefficient);
							var blocks = astNode.getFunctionBodyFromFunctionExpression(i);
							for (var b in blocks){
								// parse function body
								parseProgram(blocks[b], variableName_Types[v].value, scopeCoefficient["function"], varMap, hasReturn, verbose);
							}
						}
						varMap.setVariable(variableName_Type[0], [variableName_Types[v]], verbose);
					}
					if (verbose>1) varMap.printMap();
				}
			}
		}
		else if (astNode.isExpressionStatement(i)) {

			if (astNode.isAssignmentExpression(i)) {

				var var_values = astNode.getAssignmentLeftRight(i, varMap, verbose);

				for (var i in var_values[1]){
					if (var_values[1][i].type == "BitwiseOperationExpression" ||
						var_values[1][i].type == "FunctionCall") {
						if (verbose>0) console.log("FEATURE[Assignment] in :" + scope + ", "+var_values[1][i].type +":" + var_values[0] + "=" +var_values[1][i].value);
						updateResultMap(resultMap, "Assignment", coefficient);
					} else if (var_values[1][i].type == "FunctionExpression") {
						//parse function body
						parseProgram(var_values[1][i].value, var_values[1][i].value, scopeCoefficient["function"], varMap, hasReturn, verbose);
					}
				}

				varMap.updateVariable(var_values[0], var_values[1], verbose);
			} else if (astNode.isUpdateExpression(i)) {
				var var_value = astNode.getUpdateExpression(i, varMap, verbose);
				// no point to track ++, --
			} else if (astNode.isCallExpression(i) || astNode.isExpressionStatement(i)) {

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
						if (verbose>0) console.log("FEATURE[FuncObfuscation] :[", funcName, "] -> [", var_values[v].value, "]")
						updateResultMap(resultMap, "FuncObfuscation", coefficient);
						user_defined_funName = var_values[v].value;
					}
					if (funcName != funcName.substring(funcName.lastIndexOf(".")+1)){
						var args = astNode.getFunctionArguments(i, varMap);
						var argStr = "";
						for (var a in args) {
							argStr += args[a].value
						}
						if (verbose>0) console.log("FEATURE[FunctionCall] :", funcName + "("+argStr+")");
						updateResultMap(resultMap, "FunctionCall", coefficient);
					}

					
					// if (funcNames.indexOf(funcName) != -1 || funcNames.indexOf(user_defined_funName) != -1) {
					var funcNames = varMap.get(funcName);
					for (var f in funcNames) {
						if (funcNames[f].type == "pre_Function" || user_defined_funName == funcNames[f].value) {

							var args = astNode.getFunctionArguments(i, varMap);

							// JS will ignore extra parameters, if function is defined with only one parameter
							// Attacker might add more unuse d parameters to confuse the detector
							if (args.length >= 1) {
								if (args[0].type == "String") {
									if (verbose>0) console.log("FEATURE[StringOp] in :" + scope + ": " + funcName + "(STRING) => " + funcName + "[" + args[0].value + "]");
									updateResultMap(resultMap, "StringOp", coefficient);
								} else if (args[0].type == "Identifier" ||
										   args[0].type == "MemberExpression") {
									var ref_values = varMap.get(args[0].value, verbose);

									//get value of nested memberexpression e.g. a="str"; Array[0] = a;
									for (var i in ref_values) {
										if (ref_values[i] && ref_values[i].type == "String") {
											if (verbose>0) console.log("FEATURE[StringOp] in :" + scope + ": "+funcName+"(Object->STRING) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[i].value + ")");
											updateResultMap(resultMap, "StringOp", coefficient);
										} else if (ref_values[i] && ref_values[i].type == "Expression") {
											if (verbose>0) console.log("FEATURE[StringOp] in :" + scope + ": "+funcName+"(Expr) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[i].value + ")");
											updateResultMap(resultMap, "StringOp", coefficient);
										}
									}							
								} else if (args[0].type == "BinaryExpression" || args[0].type == "UnaryExpression" || args[0].type == "CallExpression") {
									if (verbose>0) console.log("FEATURE[ExpressionOp] in :" + scope + ": "+funcName+"(" + args[0].type + ") => "+funcName+"[" + args[0].value + "]");
									updateResultMap(resultMap, "ExpressionOp", coefficient);
								}
							}
						}
					}
				}
			} else {
				console.log("??", astNode._node.body[i].type)
			}
		} else if (astNode.isFunctionDeclaration(i)) {
			// set hasReturn flag to true for parsing function body
			
			ASTUtils.traverse(ast.body[i].body, function(node, parent){
				if (node.type == "ReturnStatement"){
					hasReturn = true;
				}
			});

			funcName = astNode.getFunctionName(i);
			varMap.setVariable(funcName, [{ type: 'user_Function', value: funcName }]);
			const emptyVarMap = new Functions.VariableMap(new HashMap());
			init_varMap.copy(emptyVarMap);
			parseProgram(ASTUtils.getCode(ast.body[i].body).slice(1, -1), funcName, scopeCoefficient["function"], emptyVarMap, hasReturn, verbose);
		} else if (astNode.isIfStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" || 
					node.type == "ContinueStatement" ||
					node.type == "ReturnStatement") {
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
				}
			})

			var branchExprs = astNode.parseIfStatement(i, varMap, verbose);

			const emptyVarMap = new Functions.VariableMap(new HashMap());
			varMap.copy(emptyVarMap);
			const changeVarMap = new Functions.VariableMap(new HashMap());


			for (var b in branchExprs){
				var subVarMapList = parseProgram(branchExprs[b], "if_statements", scopeCoefficient["if"], emptyVarMap, hasReturn, verbose);

				
				//TODO check list difference method
				for (var l in subVarMapList) {
					var key = subVarMapList[l].key;
					var value = subVarMapList[l].value;
					var prevValues = varMap.get(key);
					if (prevValues === undefined) {
						varMap.setVariable(key, value);
					} else {
						for (var v in prevValues) {
							if (prevValues[v] != value[0]) {					
								// console.log("DIFF["+key+"] -> before:", varMap.get(key), "  now:",value);
								if (changeVarMap.get(key)) {
									var typeSet = changeVarMap.get(key);
									if (!typeSet.has(value)) {
										typeSet.add(value);
										changeVarMap.setVariable(key, typeSet);
									}
								}  else {
									var typeSet = new Set();
									typeSet.add(varMap.get(key));
									typeSet.add(value);
									changeVarMap.setVariable(key, typeSet);
								}
							}
						}
					}
				}
				changeVarMap.multipleUpdate(varMap);
			}
		} else if (astNode.isForStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" || 
					node.type == "ContinueStatement" ||
					node.type == "ReturnStatement") {
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
				}
			})

			var bodyExprs = astNode.parseForStatement(i, varMap, verbose);

			const emptyVarMap = new Functions.VariableMap(new HashMap());
			varMap.copy(emptyVarMap);
			const changeVarMap = new Functions.VariableMap(new HashMap());

			for (var b in bodyExprs){
				var subVarMapList = parseProgram(bodyExprs[b], "for_statements", scopeCoefficient["for"], emptyVarMap, hasReturn, verbose);
				//TODO check list difference method
				for (var l in subVarMapList) {
					var key = subVarMapList[l].key;
					var value = subVarMapList[l].value;
					var prevValues = varMap.get(key);
					if (prevValues === undefined) {
						varMap.setVariable(key, value);
					} else {
						for (var v in prevValues) {
							if (prevValues[v] != value[0]) {					
								// console.log("DIFF["+key+"] -> before:", varMap.get(key), "  now:",value);
								if (changeVarMap.get(key)) {
									var typeSet = changeVarMap.get(key);
									if (!typeSet.has(value)) {
										typeSet.add(value);
										changeVarMap.setVariable(key, typeSet);
									}
								}  else {
									var typeSet = new Set();
									typeSet.add(varMap.get(key));
									typeSet.add(value);
									changeVarMap.setVariable(key, typeSet);
								}
							}
						}
					}
				}
				changeVarMap.multipleUpdate(varMap);
			}
		} else if (astNode.isWhileStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" || 
					node.type == "ContinueStatement" ||
					node.type == "ReturnStatement") {
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
				}
			})

			var bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			
			const emptyVarMap = new Functions.VariableMap(new HashMap());
			varMap.copy(emptyVarMap);
			const changeVarMap = new Functions.VariableMap(new HashMap());

			for (var b in bodyExprs){
				var subVarMapList = parseProgram(bodyExprs[b], "while_statements", scopeCoefficient["while"], emptyVarMap, hasReturn, verbose);
				//TODO check list difference method
				for (var l in subVarMapList) {
					var key = subVarMapList[l].key;
					var value = subVarMapList[l].value;
					var prevValues = varMap.get(key);
					if (prevValues === undefined) {
						varMap.setVariable(key, value);
					} else {
						for (var v in prevValues) {
							if (prevValues[v] != value[0]) {					
								// console.log("DIFF["+key+"] -> before:", varMap.get(key), "  now:",value);
								if (changeVarMap.get(key)) {
									var typeSet = changeVarMap.get(key);
									if (!typeSet.has(value)) {
										typeSet.add(value);
										changeVarMap.setVariable(key, typeSet);
									}
								}  else {
									var typeSet = new Set();
									typeSet.add(varMap.get(key));
									typeSet.add(value);
									changeVarMap.setVariable(key, typeSet);
								}
							}
						}
					}
				}
				changeVarMap.multipleUpdate(varMap);
			}
		} else if (astNode.isTryStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" || 
					node.type == "ContinueStatement" ||
					node.type == "ReturnStatement") {
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
				}
			})

			var bodyExprs = astNode.parseTryStatement(i, varMap, verbose);

			const emptyVarMap = new Functions.VariableMap(new HashMap());
			varMap.copy(emptyVarMap);

			//try branch
			var tryVarMapList = parseProgram(bodyExprs[0], "Try_statements", scopeCoefficient["try"], emptyVarMap, hasReturn, verbose);
			var catchVarMapList = parseProgram(bodyExprs[1], "Try_statements", scopeCoefficient["try"], emptyVarMap, hasReturn, verbose);

			var diffMap = new Functions.VariableMap(new HashMap());


			//check variables exists in try branch
			tryVarMapList.forEach(function(val1) {

				var changedInCatchBranch = false;
				catchVarMapList.forEach(function(val2){
					// variable exists in both try/catch branches
					if (val2.key == val1.key && val2.value != val1.value) {
						var typeSet = new Set();
						typeSet.add(val1.value);
						typeSet.add(val2.value);
						diffMap.setVariable(val1.key, typeSet);
						changedInCatchBranch = true;
					}
				});

				if (!changedInCatchBranch) {
					var prevValues = varMap.get(val1.key);
					if (prevValues) {
						if (prevValues != val1.value) {
							var typeSet = new Set();
							typeSet.add(prevValues);
							typeSet.add(val1.value);
							diffMap.setVariable(val1.key, typeSet);
						}
					} else {
						var typeSet = new Set();
						typeSet.add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					}
					
				}
			});

			//check variables exists in catch branch
			catchVarMapList.forEach(function(val1){
				if (diffMap.get(val1.key) === undefined) {
					var prevValues = varMap.get(val1.key);
					if (prevValues) {
						if (prevValues.value != val1.value) {
							var typeSet = new Set();
							typeSet.add(prevValues);
							typeSet.add(val1.value);
							diffMap.setVariable(val1.key, typeSet);
						}
					} else {
						var typeSet = new Set();
						typeSet.add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					}
				}
			});

			

			//now check if there exists finally block
			if (bodyExprs.length == 3) {
				//finally branch
				var finallyVarMapList = parseProgram(bodyExprs[2], "Try_statements", scopeCoefficient["try"], emptyVarMap, hasReturn, verbose);
				// diffMap.multipleUpdate(varMap);
				// diffMap.printMap()
				// check variables exists in diffMap branch
				finallyVarMapList.forEach(function(val1){
					if (diffMap.get(val1.key) === undefined) {
						var prevValues = varMap.get(val1.key);
						if (prevValues) {
							var typeSet = new Set();
							typeSet.add(val1.value);
							diffMap.setVariable(val1.key, typeSet);
						} else {
							var typeSet = new Set();
							typeSet.add(val1.value);
							diffMap.setVariable(val1.key, typeSet);
						}
					} else {
						var typeSet = new Set();
						typeSet.add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					}
				});
				diffMap.multipleUpdate(varMap);


			} else {
				diffMap.multipleUpdate(varMap);
			}
		}
	}
	if (verbose>1)  console.log("-------------------------------------------\n")
	if (verbose>1) varMap.printMap();
	return varMap.toList();
}

//===================check input source============================

if (filePath !== undefined) {
	var file = fs.readFileSync("user.js", "utf8");
	if (filePath !== null) 
		var file = fs.readFileSync(filePath, "utf8");

	var match = file.match('<[Ss][Cc][Rr][Ii][Pp][Tt][^>]*>(?:[^<]+|<(?!/[Ss][Cc][Rr][Ii][Pp][Tt]>))+');
	var scriptCodes = "";
	if (match !== null) {
		while (match !== null) {
			var matchLength = match[0].length;
			var scriptBlock = match[0].substring(match[0].indexOf(">")+1,match[0].length);
			var removeHTMLCommentsMatch = scriptBlock.replace(/<!--[\s\S]*?-->/g, "");
			scriptCodes = scriptCodes + removeHTMLCommentsMatch;
			file = file.substring(matchLength+1, file.length);
			match = file.match('<[Ss][Cc][Rr][Ii][Pp][Tt][^>]*>(?:[^<]+|<(?!/[Ss][Cc][Rr][Ii][Pp][Tt]>))+');
		}
	} else {
		var scriptCodes = file.replace(/<!--[\s\S]*?-->/g, "")
	}
	var program = scriptCodes;
	parseProgram(program, "User_Program", scopeCoefficient["main"], init_varMap, false, verbose);
} else {
	var testPrograms = require('./testPrograms');
	if (testNumber == -1) {
		for (var t in testPrograms.programs) {
			parseProgram(testPrograms.programs[t], "Program"+t, scopeCoefficient["main"], init_varMap, false, verbose);
		}
	} else {
		parseProgram(testPrograms.programs[testNumber], "Program"+testNumber, scopeCoefficient["main"], init_varMap, false, verbose);
	}
	
}

if (calcualteWeight && resultMap.size > 0) showResult(resultMap);

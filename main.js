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
  { name: 'src', 		  alias: 's', type: String }
]

const options = commandLineArgs(optionDefinitions)
const calcualteWeight = options.weight; 
const verbose = (options.verbose === undefined) ? 0 : (options.verbose === null)? 1 : 2;
const filePath = options.src;

//===============================MainProgram=================================
var init_varMap = new Functions.VariableMap(new HashMap());

var funcNames = ["eval", "unescape", "replace", "document.write", "atob", "btoa",
				 "setTimeout", "setInterval", "toString", "String.fromCharCode",
				 "parseInt", "alert", "console.log", "Array","charCodeAt"];
for (var f in funcNames) {
	init_varMap.setVariable(funcNames[f], [{ type: 'pre_Function', value: funcNames[f] }] );
}

Set.prototype.my_add=function(values){
	var hasSame = false;
	var toAddList = [];

	for (var v in values) {
		var exists = false;
		this.forEach(function(item) { 
			if (values[v].key == item[0].key && values[v].value == item[0].value) {
				exists = true;
			}
		});

		if (!exists) {
			this.add([values[v]]);
		}
	}
}

// {key: featureType, value: [occurances, weight]}
var resultMap = new HashMap();
var featureMap = new HashMap();

const scopeCoefficient = {  "test"      : 0,
							"main" 		: 1,
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
						"FuncObfuscation" 	: 5,
						"UndefinedFunction"	: 5,
						"ObjectOp"			: 2};





function updateResultMap(resultMap, featureType, coefScope) {
	var prevValue = resultMap.get(featureType);
	var coef = scopeCoefficient[coefScope];
	if (prevValue) {
		resultMap.set(featureType, [prevValue[0]+1, prevValue[1] + coef * featureWeight[featureType]]);
	} else {
		resultMap.set(featureType, [1, coef * featureWeight[featureType]]);
	}
	// console.log("--,"+featureType+","+programTokens)
}

function showResult(resultMap, codeLength) {
	var totalOccurances = 0;
	var totalWeight     = 0;
	//console.log("Features,Occurances,TotalWeight");

	resultMap.forEach(function(value, key){
		//console.log("--,"+key+","+value[0]+","+value[1]);
		totalOccurances += value[0];
		totalWeight     += value[1];
	});
	// console.log("Total,"+totalOccurances);
	// console.log("Weight,"+totalWeight);
	// console.log("Length,"+codeLength);
	// console.log("Tokens,"+programTokens);
	//console.log("POINT:",totalOccurances/codeLength+","+totalWeight/codeLength)
}

var programTokens = 0;
function parseProgram(program, scope, coefficient, varMap, hasReturn, verbose){

	if (program.replace(/\s+/, "") == "") return varMap.toList();
	var ast;
	if (hasReturn) {
		ast = ASTUtils.parseWrap(program);
	} else {
		ast = ASTUtils.parse(program);
	}
	hasReturn = false;
	if (scope == "User_Program") programTokens = ast.tokens.length;
	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);

		
		if (verbose>1 && (ast.body[i].type != "Line")) console.log("======================\n", ast.body[i],"\n======================\n");
		
		// variable declaration, e.g. var x = ???;
		if (astNode.isVariableDeclaration(i)) {
			var declaration_blocks = astNode.getAllDeclarationBlocks(i);
			for (var block in declaration_blocks) {
				var variableName_Type = astNode.getVariableInitValue(i, declaration_blocks[block], varMap, verbose);
				var variableName_Types = variableName_Type[1];
				for (var v in variableName_Types) {
					if (variableName_Types[v].type == "ArrayExpression" || 
						variableName_Types[v].type == "NewExpression") {
						// var array_elems = variableName_Types[v].value;
						// for (var e in array_elems) {
						// 	varMap.setVariable(array_elems[e][0], array_elems[e][1], verbose);
						// }
						varMap.setVariable(variableName_Type[0], [variableName_Types[v]], verbose);
					} else if (variableName_Types[v].type == "pre_Function"){
						if (verbose>0) console.log("FEATURE[FuncObfuscation] :[", variableName_Type[0], "] -> [", variableName_Types[v].value, "]")
						updateResultMap(resultMap, "FuncObfuscation", coefficient);
					} else {
						if (variableName_Types[v].type == "Expression") {
							if (verbose>0) console.log("FEATURE[InitVariable] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + "=" +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariable", coefficient);
							ASTUtils.traverse(ast.body[i], function(node){
								if (node.type == "CallExpression"){
									if (node.callee.type == "Identifier" && varMap.get(node.callee.name) === undefined) {
										if (verbose>0) console.log("FEATURE[UndefinedFunction] in :" + scope + ":" + ASTUtils.getCode(node));
										updateResultMap(resultMap, "UndefinedFunction", coefficient);
									} else if (node.callee.type == "FunctionExpression"){
										var currentBlock = ASTUtils.getCode(node.callee);
										// parse function body
										parseProgram(currentBlock, variableName_Types[v].value, "function", varMap, hasReturn, verbose);
									}
								}
							});
						} else if (astNode.hasFunctionExpression(i)) {
							//FunctionExpression
							ASTUtils.traverse(ast.body[i], function(node){
								if (node.type == "FunctionExpression"){
									if (verbose>0) console.log("FEATURE[InitVariable] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + "=" +variableName_Types[v].value);
									var blocks = astNode.getFunctionBodyFromFunctionExpression(i);
									for (var b in blocks){
										// parse function body
										parseProgram(blocks[b], variableName_Types[v].value, "function", varMap, hasReturn, verbose);
									}
									updateResultMap(resultMap, "InitVariable", coefficient);
								} 
							});
						} else if (variableName_Types[v].type == "ObjectExpression") {
							varMap.setVariable(variableName_Type[0], [variableName_Types[v].value], verbose);
						}
						varMap.setVariable(variableName_Type[0], [variableName_Types[v]], verbose);
					}
				}
			}
		}
		// expressions, e.g. x = ???, eval(???).
		else if (astNode.isExpressionStatement(i)) {
			if (astNode.isAssignmentExpression(i)) {
				var var_values = astNode.getAssignmentLeftRight(i, varMap, verbose);

				for (var v in var_values[1]){
					if (var_values[1][v].type == "BitwiseOperationExpression" ||
						var_values[1][v].type == "FunctionCall") {
						if (verbose>0) console.log("FEATURE[Assignment] in :" + scope + ", "+var_values[1][v].type +":" + var_values[0] + "=" +var_values[1][v].value);
						updateResultMap(resultMap, "Assignment", coefficient);
						ASTUtils.traverse(ast.body[i], function(node){
							if (node.type == "CallExpression"){
								if (node.callee.type == "MemberExpression") {
									var callee = node.callee.property.name;
								} else {
									var callee = node.callee.name;
								}
								if (callee !== undefined && varMap.get(callee) === undefined) {
									if (verbose>0) console.log("FEATURE[UndefinedFunction] in :" + scope + ":" + callee);
									updateResultMap(resultMap, "UndefinedFunction", coefficient);
								} else {
									var types = varMap.get(callee);
									for (var t in types) {
										if (types[t].type == "pre_Function") {
											if (verbose>0) console.log("FEATURE[FunctionCall] :", ASTUtils.getCode(node));
											updateResultMap(resultMap, "FunctionCall", coefficient);
										}
									}
								}
							}
						});
						
					} else if (var_values[1][v].type == "FunctionExpression") {
						// parse function body
						// main scope variable should be parsed into the function body, however 
						// function body scope variable shoundn't affect the main scope therefore
						// use the new @eVarMap instead of @varMap itself
						var eVarMap = new Functions.VariableMap(new HashMap());
						varMap.copy(eVarMap);
						parseProgram(var_values[1][v].value, var_values[1][v].value, "function", eVarMap, hasReturn, verbose);
					} else {
						ASTUtils.traverse(ast.body[i], function(node){
							if (node.type == "AssignmentExpression") {
								var var_value = astNode.checkStaticMemberFunctionCall(node, varMap);
								if (var_value !== undefined) {
									if (verbose>0) console.log("FEATURE[FuncObfuscation] :[", var_value[0], "] -> [", var_value[1].value, "]")
									updateResultMap(resultMap, "FuncObfuscation", coefficient);
								}
							} else if (node.type == "CallExpression"){
								var callee = node.callee.name;
								if (node.callee.name !== undefined && varMap.get(callee) === undefined) {
									if (verbose>0) console.log("FEATURE[UndefinedFunction] in :" + scope + ":" + callee);
									updateResultMap(resultMap, "UndefinedFunction", coefficient);
								}
								parseProgram(ASTUtils.getCode(node), "CallExpression", "function", varMap, hasReturn, verbose);
							}
						});
					}
				}

				varMap.updateVariable(var_values[0], var_values[1], verbose);

			} else if (astNode.isUpdateExpression(i)) {

				var var_value = astNode.getUpdateExpression(i, varMap, verbose);
				// ++, --, etc.
			
			} else {
				// (astNode.isCallExpression(i)) and the rest expressions

				if (astNode._node.body[i].expression.type == "Identifier") {
					var var_values = varMap.get(astNode._node.body[i].expression.name);
					if (var_values === undefined) {
						varMap.updateVariable(astNode._node.body[i].expression.name, [{ type: 'undefined', value: 'undefined' }]);
					}
					continue;
				}

				//List of malicious pre-defined functions
				var funcName = "";
				if (astNode._node.body[i].expression.callee) {
					funcName = astNode.getCalleeName(i, varMap);
				}
				
				var var_values = varMap.get(funcName);
				if (var_values === undefined) {
					ASTUtils.traverse(ast.body[i], function(node){
						if (node.type == "CallExpression"){
							var callee = node.callee.name;
							if (node.callee.name !== undefined && varMap.get(callee) === undefined) {
								if (verbose>0) console.log("FEATURE[UndefinedFunction] in :" + scope + ":" + callee);
								updateResultMap(resultMap, "UndefinedFunction", coefficient);
							}
						}
					});
				}

				for (var v in var_values) {
					if (var_values[v].type != "pre_Function" && var_values[v].type != "user_Function" ) {
						continue; 
					}

					var user_defined_funName = "";

					if (var_values != undefined && var_values[v].value != funcName && var_values[v].type == "pre_Function"){
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

					var funcNames = varMap.get(funcName);

					for (var f in funcNames) {

						if (funcNames[f].type == "pre_Function" || user_defined_funName == funcNames[f].value
							|| funcNames[f].type == "user_Function") {
							var args = astNode.getFunctionArguments(i, varMap);

							// JS will ignore extra parameters, if function is defined with only one parameter
							// Attacker might add more unuse d parameters to confuse the detector
							if (args.length >= 1) {
								if (args[0].type == "String") {
									if (verbose>0) console.log("FEATURE[StringOp] in :" + scope + ": " + funcName + "(STRING) => " + funcName + "[" + args[0].value + "]");
									updateResultMap(resultMap, "StringOp", coefficient);
								} else if (args[0].type == "Identifier" ||
										   args[0].type == "ArrayMemberExpression" || 
										   args[0].type == "FieldMemberExpression" ) {

									if (args[0].type == "ArrayMemberExpression") {

										var object = args[0].value[0];
										var indices = args[0].value[1];
										var ref_values = [];
										
										
										var r_vs = varMap.get(object);
										for (var inx in indices){

											// skip " when handling object field access aka o["f"] => o.f
											// indices will be `"f"` instead of [{type:"Numeric", value:2}]
											if (indices[inx] == "") continue;
											index = indices[inx].value;
											for (var r in r_vs){
												var fields = r_vs[r].value[index];
												if (r_vs[r].type == "ObjectExpression") {
													var field = r_vs[r].value[index.replace(/"/g,"")];
													if (field !== undefined) {
														ref_values = ref_values.concat(field);
													} 
												} else if (r_vs[r].type == "ArrayExpression" ||
													r_vs[r].type == "NewExpression") {
													if (index !== undefined) {
														ref_values = ref_values.concat(r_vs[r].value[index][1]);
													} 
												}
											}
										}
										
									} else if (args[0].type == "FieldMemberExpression") {
										var object = args[0].value[0];
										var fields = args[0].value[1];

										var r_vs = varMap.get(object);
										var ref_values = [];
										for (var f in fields) {
											var field = fields[f];
											for (var r in r_vs){
												if (r_vs[r].type == "ObjectExpression") {
													if (field !== undefined) {
														ref_values = ref_values.concat(r_vs[r].value[field]);
													} 
												}
											}
										}
									} else {
										var ref_values = varMap.get(args[0].value, verbose);
									}

									
									if (ref_values.length == 0)  {
										if (verbose>0) console.log("FEATURE[ObjectOp] in :" + scope + ": "+ASTUtils.getCode(ast.body[i]));
										updateResultMap(resultMap, "ObjectOp", coefficient);
									}
									//get value of nested memberexpression e.g. a="str"; Array[0] = a;
									for (var ref in ref_values) {
										if (ref_values[ref] && ref_values[ref].type == "String") {
											if (verbose>0) console.log("FEATURE[StringOp] in :" + scope + ": "+funcName+"(Object->STRING) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[ref].value + ")");
											updateResultMap(resultMap, "StringOp", coefficient);
										} else if (ref_values[ref] && ref_values[ref].type == "Expression") {
											if (verbose>0) console.log("FEATURE[StringOp] in :" + scope + ": "+funcName+"(Expr) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[ref].value + ")");
											updateResultMap(resultMap, "StringOp", coefficient);
										}
									}							
								} else if (args[0].type == "BinaryExpression" || args[0].type == "UnaryExpression" || args[0].type == "CallExpression") {
									if (verbose>0) console.log("FEATURE[ExpressionOp] in :" + scope + ": "+funcName+"(" + args[0].type + ") => "+funcName+"[" + args[0].value + "]");
									updateResultMap(resultMap, "ExpressionOp", coefficient);
									ASTUtils.traverse(ast.body[i], function(node){
										if (node.type == "CallExpression"){
											var callee = node.callee.name;
											if (node.callee.name !== undefined && varMap.get(callee) === undefined) {
												if (verbose>0) console.log("FEATURE[UndefinedFunction] in :" + scope + ":" + callee);
												updateResultMap(resultMap, "UndefinedFunction", coefficient);
											}
										}
									});
								}
							}
						}
					}
				}
			} 
		} else if (astNode.isFunctionDeclaration(i)) {
			var params = astNode.getFunctionParams(i, varMap);

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
			parseProgram(ASTUtils.getCode(ast.body[i].body).slice(1, -1), funcName, "function", emptyVarMap, hasReturn, verbose);
		} else if (astNode.isIfElseStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" ||  node.type == "ContinueStatement" || node.type == "ReturnStatement")
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
			})

			var branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			const diffMap = new Functions.VariableMap(new HashMap());

			for (var b in branchExprs){
				var eVarMap = new Functions.VariableMap(new HashMap());
				varMap.copy(eVarMap);
				var ifbranchVarMapList = parseProgram(branchExprs[b], "if_statements", "if", eVarMap, hasReturn, verbose);

				ifbranchVarMapList.forEach(function(val1) {
					// variable in @varMap
					var var_values = varMap.get(val1.key);

					// value different as @varMap ||
					// new value created in if branches
					if ((var_values !== undefined && var_values != val1.value) ||
						 var_values === undefined) {
						var prevValues = diffMap.get(val1.key);

						// check if value already in @diffMap
						if (prevValues) { 
							var setIter = prevValues.values();
							prevValues.my_add(val1.value);
							diffMap.setVariable(val1.key, prevValues);
						} else {
							var typeSet = new Set();
							typeSet.my_add(val1.value);
							diffMap.setVariable(val1.key, typeSet);
						}
					} 
				});
			}
			diffMap.multipleUpdate(varMap);
		}else if (astNode.isIfStatement(i)) {

			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" ||  node.type == "ContinueStatement" || node.type == "ReturnStatement")
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
			})

			var branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			const diffMap = new Functions.VariableMap(new HashMap());

		
			for (var b in branchExprs){
				var eVarMap = new Functions.VariableMap(new HashMap());
				varMap.copy(eVarMap);
				var ifbranchVarMapList = parseProgram(branchExprs[b], "if_statements", "if", eVarMap, hasReturn, verbose);

				ifbranchVarMapList.forEach(function(val1) {
					// variable already in diffMap
					var prevBranch = diffMap.get(val1.key);
					if (prevBranch) {
						prevBranch.my_add(val1.value);
						diffMap.setVariable(val1.key, prevBranch);
					} else {
						var prevValues = varMap.get(val1.key);
						var typeSet = new Set();
						// if variable exists in main program, add the prev_value
						if (prevValues && prevValues != val1.value) typeSet.my_add(prevValues);

						typeSet.my_add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					}
				});
			}
			diffMap.multipleUpdate(varMap);

		} else if (astNode.isForStatement(i) || astNode.isForInStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" ||  node.type == "ContinueStatement" || node.type == "ReturnStatement")
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
			})

			var bodyExprs = astNode.parseForStatement(i, varMap, verbose);
			const diffMap = new Functions.VariableMap(new HashMap());


			// parse for condition with empty varMap?? why empty varMap
			var eVarMap = new Functions.VariableMap(new HashMap());
			var subVarMapList = parseProgram(bodyExprs[0], "for_statements", "for", varMap, hasReturn, verbose);
			
			subVarMapList.forEach(function(val1) {
				var prevValues = varMap.get(val1.key);
				var typeSet = new Set();
				if (prevValues && astNode.isForInStatement(i)) {
					typeSet.my_add([ { type: 'Literal', value: '0' } ]);
				} else if (prevValues && astNode.isForStatement(i)){
					if (val1.value[0].type == "undefined" && val1.value[0].value == "undefined") {
						typeSet.my_add(prevValues);
					} else {
						typeSet.my_add(val1.value);
					}
				}
				diffMap.setVariable(val1.key, typeSet);
			});

			diffMap.multipleUpdate(varMap);

			// parse for body with current varMap
			var eVarMap2 = new Functions.VariableMap(new HashMap());
			varMap.copy(eVarMap2);

			subVarMapList = parseProgram(bodyExprs[1], "for_statements", "for", eVarMap2, hasReturn, verbose);
			subVarMapList.forEach(function(val1) {
				var prevValues = varMap.get(val1.key);
				var typeSet = new Set();
				// if variable exists in main program, add the prev_value
				if (prevValues && prevValues != val1.value) typeSet.my_add(prevValues);

				typeSet.my_add(val1.value);
				diffMap.setVariable(val1.key, typeSet);
			});
			diffMap.multipleUpdate(varMap);
		} else if (astNode.isWhileStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" ||  node.type == "ContinueStatement" || node.type == "ReturnStatement")
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
			})

			var bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			const diffMap = new Functions.VariableMap(new HashMap());

			for (var b in bodyExprs){
				var eVarMap = new Functions.VariableMap(new HashMap());
				varMap.copy(eVarMap);

				var subVarMapList = parseProgram(bodyExprs[b], "while_statements", "while", eVarMap, hasReturn, verbose);

				subVarMapList.forEach(function(val1) {
					var prevValues = varMap.get(val1.key);
					var typeSet = new Set();

					// if variable exists in main program, add the prev_value
					if (prevValues && prevValues != val1.value) typeSet.my_add(prevValues);

					typeSet.my_add(val1.value);
					diffMap.setVariable(val1.key, typeSet);
				});
			}
			diffMap.multipleUpdate(varMap);

		} else if (astNode.isDoWhileStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" ||  node.type == "ContinueStatement" || node.type == "ReturnStatement")
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
			})
			var bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			// update varMap directly since the body code will always be executed in do-while
			parseProgram(bodyExprs[0], "while_statements", "while", varMap, hasReturn, verbose);
		} else if (astNode.isTryStatement(i)) {
			ASTUtils.traverse(astNode._node, function(node, parent){
				if (node.type == "BreakStatement" ||  node.type == "ContinueStatement" || node.type == "ReturnStatement")
					ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
			})

			var bodyExprs = astNode.parseTryStatement(i, varMap, verbose);

			const eVarMap1 = new Functions.VariableMap(new HashMap());
			const eVarMap2 = new Functions.VariableMap(new HashMap());
			varMap.copy(eVarMap1);
			varMap.copy(eVarMap2);

			var tryVarMapList = parseProgram(bodyExprs[0], "Try_statements", "try", eVarMap1, hasReturn, verbose);
			var catchVarMapList = parseProgram(bodyExprs[1], "Catch_statements", "try", eVarMap2, hasReturn, verbose);
			
			var diffMap = new Functions.VariableMap(new HashMap());


			//check variables exists in try branch
			tryVarMapList.forEach(function(val1) {

				var changedInCatchBranch = false;
				catchVarMapList.forEach(function(val2){
					// variable exists in both try/catch branches with different values
					if (val2.key == val1.key && val2.value != val1.value) {
						var typeSet = new Set();
						typeSet.my_add(val1.value);
						typeSet.my_add(val2.value);
						diffMap.setVariable(val1.key, typeSet);
						changedInCatchBranch = true;
					}
				});

				// this variable only exists in try branch but NOT in catch branch
				if (!changedInCatchBranch) {
					var prevValues = varMap.get(val1.key);
					var typeSet = new Set();
					// if variable exists in main program, add the prev_value
					if (prevValues && prevValues != val1.value) {
						typeSet.my_add(prevValues);
					} 
					typeSet.my_add(val1.value);
					diffMap.setVariable(val1.key, typeSet);
				}
			});

			// check variables only exists in catch branch but NOT in try branch
			catchVarMapList.forEach(function(val1){

				// if varible exists in try branch must be in diffMap
				// i.e. all keys that didn't exists in diffMap are new variables
				if (diffMap.get(val1.key) === undefined) {
					var prevValues = varMap.get(val1.key);
					var typeSet = new Set();
					// if variable exists in main program, add the prev_value
					if (prevValues && prevValues.value != val1.value) {
							typeSet.my_add(prevValues);
					} 
					typeSet.my_add(val1.value);
					diffMap.setVariable(val1.key, typeSet);
				}
			});

			// check if there exists finally block
			if (bodyExprs.length == 3) {
				//finally branch
				const eVarMap3 = new Functions.VariableMap(new HashMap());
				
				// use empty varMap to parse finally block
				// @finallyVarMapList : contains all new declaried variable in finally block
				var finallyVarMapList = parseProgram(bodyExprs[2], "test", "test", eVarMap3, hasReturn, false);
				
				// copy variables from @diffMap, parse finally block for detecting malicious patterns
				diffMap.multipleUpdate(eVarMap3);
				parseProgram(bodyExprs[2], "Finally_statements", "try", eVarMap3, hasReturn, verbose);

				// for all @val in @finallyVarMapList, added to @diffMap regradless their previous value
				finallyVarMapList.forEach(function(val1){
					var typeSet = new Set();
					typeSet.my_add(val1.value);
					diffMap.setVariable(val1.key, typeSet);
				});

				// copy @diffMap values to @varMap
				diffMap.multipleUpdate(varMap);
			} else {
				diffMap.multipleUpdate(varMap);
			}
		}
	}
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
	parseProgram(program, "User_Program", "main", init_varMap, false, verbose);
	if (calcualteWeight && resultMap.size > 0) showResult(resultMap, program.length);
} 



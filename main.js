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
	console.log("POINT:",totalOccurances+","+totalWeight)
}

var programTokens = 0;
function parseProgram(program, scope, coefficient, varMap, verbose){

	if (program.replace(/\s+/, "") == "") return varMap.toList();
	var ast = ASTUtils.parse(program);

	if (scope == "User_Program") programTokens = ast.tokens.length;
	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);

		if (verbose>1 && (ast.body[i].type != "Line")) console.log("======================\n", ast.body[i],"\n======================\n");
		
		/* Variable Declaration */
		if (astNode.isVariableDeclaration(i)) {
			var declaration_blocks = astNode.getAllDeclarationBlocks(i);
			for (var block in declaration_blocks) {
				var variableName_Type = astNode.getVariableInitValue(i, declaration_blocks[block], varMap, verbose);
				var variableName_Types = variableName_Type[1];
				for (var v in variableName_Types) {
					if (variableName_Types[v].type == "ArrayExpression" || 
						variableName_Types[v].type == "NewExpression") {
						varMap.setVariable(variableName_Type[0], [variableName_Types[v]], verbose);
					} else if (variableName_Types[v].type == "pre_Function"){
						// e.g. var myVariable = eval;	
						if (verbose>0) console.log("FEATURE[FuncObfuscation] :[", variableName_Type[0], "] -> [", variableName_Types[v].value, "]")
						updateResultMap(resultMap, "FuncObfuscation", coefficient);
					} else {
						if (variableName_Types[v].type == "Expression") {
							if (verbose>0) console.log("FEATURE[InitVariable] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + "=" +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariable", coefficient);
							ASTUtils.traverse(ast.body[i], function(node){
								if (node.type == "CallExpression"){
									if (node.callee.type == "FunctionExpression"){
										var currentBlock = ASTUtils.getCode(node.callee);
										// parse function body
										parseProgram(currentBlock, variableName_Types[v].value, "function", varMap, verbose);
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
										parseProgram(blocks[b], variableName_Types[v].value, "function", varMap, verbose);
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
								if (callee !== undefined ) {
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
						var eVarMap = new Functions.VariableMap(varMap._varMap);
						parseProgram(var_values[1][v].value, var_values[1][v].value, "function", eVarMap, verbose);
					} else {
						ASTUtils.traverse(ast.body[i], function(node){
							if (node.type == "AssignmentExpression") {
								var var_value = astNode.checkStaticMemberFunctionCall(node, varMap);
								if (var_value !== undefined) {
									if (verbose>0) console.log("FEATURE[FuncObfuscation] :[", var_value[0], "] -> [", var_value[1].value, "]")
									updateResultMap(resultMap, "FuncObfuscation", coefficient);
								}
							} else if (node.type == "CallExpression"){
								parseProgram(ASTUtils.getCode(node), "CallExpression", "function", varMap, verbose);
							}
						});
					}
				}

				varMap.updateVariable(var_values[0], var_values[1], verbose);

			} else if (astNode.isUpdateExpression(i)) {
				var var_value = astNode.getUpdateExpression(i, varMap, verbose);
				// ++, --, etc.
			} else {
				// single identifier expressions, (e.g. x;) skip to next expression
				if (astNode._node.body[i].expression.type == "Identifier") {
					var var_values = varMap.get(astNode._node.body[i].expression.name);
					if (var_values === undefined) {
						varMap.updateVariable(astNode._node.body[i].expression.name, [{ type: 'undefined', value: 'undefined' }]);
					}
					continue;
				}


				var funcName = "";
				// if expression is function call
				if (astNode._node.body[i].expression.callee) {
					funcName = astNode.getCalleeName(i, varMap);
				}
				
				var funcNames = varMap.get(funcName);
				// if (var_values === undefined) {
				// 	ASTUtils.traverse(ast.body[i], function(node){
				// 		if (node.type == "CallExpression"){
				// 			var callee = node.callee.name;
				// 			if (node.callee.name !== undefined && varMap.get(callee) === undefined) {
				// 				if (verbose>0) console.log("FEATURE[UndefinedFunction] in :" + scope + ":" + callee);
				// 				updateResultMap(resultMap, "UndefinedFunction", coefficient);
				// 			}
				// 		}
				// 	});
				// }
				for (var f in funcNames) {
					if (funcNames[f].type != "pre_Function" && funcNames[f].type != "user_Function" ) {
						continue; 
					}

					var user_defined_funName = "";

					if (funcNames[f] != undefined && funcNames[f].value != funcName && funcNames[f].type == "pre_Function"){
						user_defined_funName = funcNames[f].value;
					}

					if (funcNames[f].type == "pre_Function" || funcNames[f].type == "user_Function") {
						var args = astNode.getFunctionArguments(i, varMap);

						// JS will ignore extra parameters, if function is defined with only one parameter
						// Attacker might add more unuse d parameters to confuse the detector
						if (args.length >= 1) {
							if (args[0].type == "String") {
								if (verbose>0) console.log("FEATURE[StringOp] in :" + scope + ": " + funcNames[f].type + ":" + funcName + "(STRING) => " + funcNames[f].value + "[" + args[0].value + "]");
								updateResultMap(resultMap, "StringOp", coefficient);
							} else if (args[0].type == "Identifier" ||
									   args[0].type == "ArrayMemberExpression" || 
									   args[0].type == "FieldMemberExpression" ) {
								// pre-processing 
								if (args[0].type == "ArrayMemberExpression") {

									const object  = args[0].value[0];
									const indices = args[0].value[1];
									const r_vs = varMap.get(object);

									var ref_values = [];
									for (var inx in indices){
										// skip " when handling object field access aka o["f"] => o.f
										// indices will be `"f"` instead of [{type:"Numeric", value:2}]
										if (indices[inx] == "") continue;
										index = indices[inx].value;
										for (var r in r_vs){
											const fields = r_vs[r].value[index];

											if (r_vs[r].type == "ObjectExpression") {
												const field = r_vs[r].value[index.replace(/"/g,"")];
												if (field !== undefined) {
													ref_values = ref_values.concat(field);
												} 
											} else if (r_vs[r].type == "ArrayExpression" || r_vs[r].type == "NewExpression") {
												if (index !== undefined) {
													ref_values = ref_values.concat(r_vs[r].value[index][1]);
												} 
											}
										}
									}
								} else if (args[0].type == "FieldMemberExpression") {
									const object = args[0].value[0];
									const fields = args[0].value[1];
									const r_vs = varMap.get(object);

									var ref_values = [];
									for (var f in fields) {
										const field = fields[f];
										for (var r in r_vs){
											if (r_vs[r].type == "ObjectExpression" && field !== undefined) {
												ref_values = ref_values.concat(r_vs[r].value[field.value]);
											}
										}
									}
								} else {
									/* args[0].type == "Identifier" */
									var ref_values = varMap.get(args[0].value, verbose);
								}

								if (ref_values.length == 0)  {
									if (verbose>0) console.log("FEATURE[ObjectOp] in :" + scope + ": "+ASTUtils.getCode(ast.body[i]));
									updateResultMap(resultMap, "ObjectOp", coefficient);
									continue;
								}

								// ref_values are all possible values for one variable, e.g. {key:a, value:["Str1",0,"Str2"]}
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
							} else {
								// args[0].type == "Numeric"
							}
						}
					}
					
				}
			} 
		} else if (astNode.isFunctionDeclaration(i)) {
			astNode.removeJumpInstructions(i);

			// if node type is FunctionDeclaration, it must has function Name
			funcName = astNode.getFunctionName(i);
			varMap.setVariable(funcName, [{ type: 'user_Function', value: funcName }]);
			var emptyVarMap = new Functions.VariableMap(varMap._varMap);

			// assume all function parameters might be String type when parsing function body
			astNode.updateFunctionParams(i, emptyVarMap);
			parseProgram(ASTUtils.getCode(ast.body[i].body).slice(1, -1), funcName, "function", emptyVarMap, verbose);
		} else if (astNode.isIfElseStatement(i)) {
			astNode.removeJumpInstructions(i);
			
			const branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());

			for (var b in branchExprs){
				var eVarMap = new Functions.VariableMap(varMap._varMap);
				const ifbranchVarMapList = parseProgram(branchExprs[b], "if_statements", "if", eVarMap, verbose);

				ifbranchVarMapList.forEach(function(val1) {
					// variable in @varMap
					var var_values = varMap.get(val1.key);

					// value updated in if-branch OR new value created in if-branche
					if (var_values != val1.value) {
						var prevValues = diffMap.get(val1.key);

						// check if value already in @diffMap
						if (prevValues) { 
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
			astNode.removeJumpInstructions(i);

			const branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());

			for (var b in branchExprs){
				var eVarMap = new Functions.VariableMap(varMap._varMap);
				const ifbranchVarMapList = parseProgram(branchExprs[b], "if_statements", "if", eVarMap, verbose);

				ifbranchVarMapList.forEach(function(val1) {
					var prevBranch = diffMap.get(val1.key);

					// check if value already in @diffMap
					if (prevBranch) {
						prevBranch.my_add(val1.value);
						diffMap.setVariable(val1.key, prevBranch);
					} else {
						const prevValues = varMap.get(val1.key);
						var typeSet = new Set();

						// if variable exists in main program and been updated in if-branch, add the prev_value
						if (prevValues && prevValues != val1.value) typeSet.my_add(prevValues);

						typeSet.my_add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					}
				});
			}
			diffMap.multipleUpdate(varMap);

		} else if (astNode.isForStatement(i) || astNode.isForInStatement(i)) {
			astNode.removeJumpInstructions(i);

			const bodyExprs = astNode.parseForStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());

			// parse for condition
			const subVarMapList1 = parseProgram(bodyExprs[0], "for_statements", "for", varMap, verbose);
			subVarMapList1.forEach(function(val1) {
				var typeSet = new Set();
				if (astNode.isForInStatement(i)) {
					typeSet.my_add([ { type: 'Numeric', value: '0' } ]);
				} else if (astNode.isForStatement(i)){
					if (val1.value[0].type == "undefined" && val1.value[0].value == "undefined") {
						typeSet.my_add(varMap.get(val1.key));
					} else {
						typeSet.my_add(val1.value);
					}
				} 
				diffMap.setVariable(val1.key, typeSet);
			});
			diffMap.multipleUpdate(varMap);

			// parse for body with current varMap
			var eVarMap = new Functions.VariableMap(varMap._varMap);

			const subVarMapList2 = parseProgram(bodyExprs[1], "for_statements", "for", eVarMap, verbose);
			subVarMapList2.forEach(function(val1) {
				var prevValues = varMap.get(val1.key);
				var typeSet = new Set();

				// if variable exists in main program and been updated in for-body, add the prev_value
				if (prevValues && prevValues != val1.value) typeSet.my_add(prevValues);

				typeSet.my_add(val1.value);
				diffMap.setVariable(val1.key, typeSet);
			});
			diffMap.multipleUpdate(varMap);

		} else if (astNode.isWhileStatement(i)) {
			astNode.removeJumpInstructions(i);

			const bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());
			var eVarMap = new Functions.VariableMap(varMap._varMap);

			const subVarMapList = parseProgram(bodyExprs[0], "while_statements", "while", eVarMap, verbose);
			subVarMapList.forEach(function(val1) {
				const prevValues = varMap.get(val1.key);
				var typeSet = new Set();

				// if variable exists in main program and been updated in while-body, add the prev_value
				if (prevValues && prevValues != val1.value) typeSet.my_add(prevValues);

				typeSet.my_add(val1.value);
				diffMap.setVariable(val1.key, typeSet);
			});
			diffMap.multipleUpdate(varMap);

		} else if (astNode.isDoWhileStatement(i)) {
			astNode.removeJumpInstructions(i);

			const bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			// update varMap directly since the body code will always be executed at least once in do-while
			parseProgram(bodyExprs[0], "while_statements", "while", varMap, verbose);
		} else if (astNode.isTryStatement(i)) {
			astNode.removeJumpInstructions(i);

			const bodyExprs = astNode.parseTryStatement(i, varMap, verbose);

			var eVarMap1 = new Functions.VariableMap(varMap._varMap);
			var eVarMap2 = new Functions.VariableMap(varMap._varMap);

			const tryVarMapList   = parseProgram(bodyExprs[0], "Try_statements",   "try", eVarMap1, verbose);
			const catchVarMapList = parseProgram(bodyExprs[1], "Catch_statements", "try", eVarMap2, verbose);
			
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
				var eVarMap3 = new Functions.VariableMap(new HashMap());
				
				// use empty varMap to parse finally block
				// @finallyVarMapList : contains all new declaried variable in finally block
				const finallyVarMapList = parseProgram(bodyExprs[2], "test", "test", eVarMap3, false);
				
				// copy variables from @diffMap, parse finally block for detecting malicious patterns
				diffMap.multipleUpdate(eVarMap3);
				parseProgram(bodyExprs[2], "Finally_statements", "try", eVarMap3, verbose);

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
	if (verbose>1 && scope == "User_Program") varMap.printMap();
	return varMap.toList();
}

//===================check input source============================

if (filePath !== undefined && filePath !== null) {
	var sourcefile = fs.readFileSync(filePath, "utf8");

	// extract all scattered <script>blocks</script>
	var match = sourcefile.match('<[Ss][Cc][Rr][Ii][Pp][Tt][^>]*>(?:[^<]+|<(?!/[Ss][Cc][Rr][Ii][Pp][Tt]>))+');
	var scriptCodes = "";
	if (match !== null) {
		while (match !== null) {
			const matchLength = match[0].length;
			const scriptBlock = match[0].substring(match[0].indexOf(">")+1,match[0].length);

			// ignore all HTML comments <!-- COMMENTs -->
			scriptCodes = scriptCodes + scriptBlock.replace(/<!--[\s\S]*?-->/g, "");
			sourcefile = sourcefile.substring(matchLength+1, sourcefile.length);
			match = sourcefile.match('<[Ss][Cc][Rr][Ii][Pp][Tt][^>]*>(?:[^<]+|<(?!/[Ss][Cc][Rr][Ii][Pp][Tt]>))+');
		}
	} else {
		// file only contains JS codes
		scriptCodes = sourcefile.replace(/<!--[\s\S]*?-->/g, "");
	}

	parseProgram(scriptCodes, "User_Program", "main", init_varMap, verbose);
	if (calcualteWeight && resultMap.size > 0) showResult(resultMap, scriptCodes.length);
} 



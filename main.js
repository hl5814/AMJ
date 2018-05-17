//================================Setup======================================
const HashMap = require('hashmap');					  // load hashmap
const esprima = require('esprima');					  // load esprima
const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
const Functions = require('./functions'); 			  // load helper functions
const commandLineArgs = require('command-line-args'); // load command-line-args
const fs = require('fs');

//===================parse command line arguments============================
const optionDefinitions = [
  { name: 'verbose',      	alias: 'v', type: Number },
  { name: 'weight',	 	  	alias: 'w', type: Boolean},
  { name: 'src', 		  	alias: 's', type: String },
  { name: 'header',		   	alias: 'h', type: Boolean}
]

const options = commandLineArgs(optionDefinitions)
const calcualteWeight = options.weight; 
const verbose = (options.verbose === undefined) ? 0 : (options.verbose === null)? 1 : 2;
const showHeader = options.header;
const filePath = options.src;

//===============================MainProgram=================================
var init_varMap = new Functions.VariableMap(new HashMap());

var funcNames = ["eval", "unescape", "replace", "write", "document.write", "document.writeln", "document.createElement",
				 "atob", "btoa", "setTimeout", "setInterval", "toString", "String.fromCharCode", "fromCharCode",
				 "parseInt", "alert", "Array","charCodeAt" , "substr", "substring", "concat","join"];

for (var f in funcNames) {
	init_varMap.setVariable(funcNames[f], [{ type: 'pre_Function', value: funcNames[f] }] );
}
init_varMap.setVariable("String", [{ type: 'ObjectExpression', value: {"fromCharCode": [{type: 'pre_Function', value: "fromCharCode"}]} }] );
init_varMap.setVariable("document", [{ type: 'ObjectExpression', value: {"createElement": [{type: 'pre_Function', value: "createElement"}],
																		 "write": [{type: 'pre_Function', value: "write"}],
																		 "writeln": [{type: 'pre_Function', value: "writeln"}]} }] );



function listEqual(list1, list2) {
	if (list1.length != list2.length) return false;
	for (var i in list1) {
		if (list1[i].type != list2[i].type ||
			list1[i].value != list2[i].value)
			return false;  
	}
	return true;
}

Set.prototype.my_add=function(values){
	var hasSame = false;
	var toAddList = [];
	for (var v in values) {
		var exists = false;
		this.forEach(function(item) { 
			if (values[v].type == "ArrayExpression") {
				for (var val in values[v].value) {
					if (item[0].value[val] === undefined) continue;
					if (values[v].value[val][0] != item[0].value[val][0] ||
						values[v].value[val][1] != item[0].value[val][1]) {
						if (values[v].value[val][0] == item[0].value[val][0]) {
							if (item[0].value[val][1] === undefined) continue;
							item[0].value[val][1].push(values[v].value[val][1][0]);
						}
						exists = false;
						break;
					}
				}
				exists = true;
			} else if (values[v].type == "ObjectExpression") {
				for (var val in values[v].value) {
					if (item[0].value[val] === undefined) continue;
					if (values[v].value[val][0] != item[0].value[val][0]) {
						item[0].value[val].push(values[v].value[val][0]);
						exists = false;
						break;
					}
				}
				exists = true;
			} else if (values[v].type == item[0].type && values[v].value == item[0].value) {
				exists = true;
			}
		});

		if (!exists) {
			this.add([values[v]]);
		}
	}
}

var resultMap = new HashMap();

const FEATURES = [	"InitVariableWithFunctionExpression",
					"InitVariableWithExpression",
					"InitVariableWithThisExpression",
					"InitVariableWithUnaryExpression",
					"InitVariableWithBinaryExpression",
					"InitVariableWithCallExpression",
					"InitVariableWithLogicalExpression",
					"AssignWithFuncCall",
					"AssignWithLogicalExpression",
					"AssignWithBitOperation",
					"AssignWithThisExpression",
					"FunctionObfuscation",
					"StringConcatation",
					"ArrayConcatation",
					"DecodeString_OR_DOM_FunctionCall",
					"FuncCallOnBinaryExpr",
					"FuncCallOnUnaryExpr",
					"FuncCallOnStringVariable",
					"FuncCallOnCallExpr",
					"FuncCallOnNonLocalArray",
					"FuncCallOnUnkonwnArrayIndex",
					"HtmlCommentInScriptBlock",
					"AssigningToThis",
					"ConditionalCompilationCode",
					"DotNotationInFunctionName",
					"LongArray",
					"LongExpression"]

const SCOPES = [	"in_test",
					"in_main",
					"in_if",
					"in_loop",
					"in_function",
					"in_try",
					"in_switch",
					"in_return",
					"in_file"];

const KEYWORDS = [	"break", "case", "catch", "continue", "debugger", "default", 
					"delete", "do", "else", "finally", "for", "function", "if", 
					"in", "instanceof", "new", "return", "switch", "this", "throw",
					"try", "typeof", "var", "const", "void", "while", "with","document","MY_MJSA_THIS"];

const PUNCTUATORS = [	"!","!=","!==","%","%=","&","&&","&=","(",")","*","*=","+",
						"++","+=",",","-","--","-=",".","/","/=",":",";","<","<<","<<=",
						"<=","=","==","===",">",">=",">>",">>=",">>>",">>>=","?","[","]",
						"^","^=","{","|","|=","||","}","~"];

const LENGTH = ["TokenPerFile", "CommentPerFile"]

for (const k of KEYWORDS) {
	resultMap.set(k, 0);
}
for (const p of PUNCTUATORS) {
	resultMap.set(p, 0);
}

for (const f of FEATURES) {
	resultMap.set(f, 0);
}
for (const s of SCOPES) {
	resultMap.set(s, 0);
}
for (const l of LENGTH) {
	resultMap.set(l, 0);
}


var FILE_LENGTH = 0;
var COMMENT_LENGTH = 0;

var FEATURE_TOTAL = 0;
var SCOPE_TOTAL = 0;
var KEYWORD_TOTAL = 0;
var PUNCTUATOR_TOTAL = 0;

function updateResultMap(resultMap, featureType, scope, point=1) {
	var prevValue = resultMap.get(featureType);
	resultMap.set(featureType, prevValue+point);
	FEATURE_TOTAL++;

	for (var s of scope) {
		prevValue = resultMap.get(s);
		resultMap.set(s, prevValue+point);
		SCOPE_TOTAL++;
	}
}

function showResult(resultMap) {
	var resultArray = [];
	var h = "";
	if (FILE_LENGTH > 0) {
		resultMap.set("CommentPerFile", (COMMENT_LENGTH/FILE_LENGTH).toFixed(4));
	}
	resultMap.forEach(function(value, key){
		h +=  "," + '"' + key + '"';
		if (KEYWORDS.indexOf(key) > -1) {
			var val = (value > 0) ? (value/KEYWORD_TOTAL).toFixed(4) : 0;
		} else if (PUNCTUATORS.indexOf(key) > -1) {
			var val = (value > 0) ? (value/PUNCTUATOR_TOTAL).toFixed(4)  : 0;
		} else if (FEATURES.indexOf(key) > -1) {
			var val = (value > 0) ? (value/FEATURE_TOTAL).toFixed(4)  : 0;
		} else if (SCOPES.indexOf(key) > -1) {
			var val = (value > 0) ? (value/SCOPE_TOTAL).toFixed(4)  : 0;
		} else {
			var val = value;
		}
		resultArray.push(val);
	});
	console.log(`"`+filePath+`",`+resultArray)
}

function printHeader(resultMap) {
	var header = [];
	resultMap.forEach(function(value, key){
		header.push(`"`+key+`"`);
	});
	console.log("header,"+header);
}


function parseProgram(program, scope, coefficient, varMap, verbose){
	// TODO: check program === null, program == undefined
	if (program === null || program === undefined) {
		console.log("!!!!!!!!!!!!! program null or undefined: ", program)
	}
	if (program === null || program === undefined || program.replace(/\s+/g, "") == "") return varMap.toList();
	var ast = ASTUtils.parse(program);
	// parse main program tokens
	if (scope == "User_Program") {
		resultMap.set("TokenPerFile", (ast.tokens.length/FILE_LENGTH).toFixed(4));
		for (const pt of ast.tokens) {
			if (pt.type == "Keyword") {
				var prevValue = resultMap.get(pt.value);
				resultMap.set(pt.value, prevValue+1);
				KEYWORD_TOTAL++;
			} else if (pt.type == "Punctuator") {
				var prevValue = resultMap.get(pt.value);
				resultMap.set(pt.value, prevValue+1);
				PUNCTUATOR_TOTAL++;
			} else if (pt.type == "Identifier") {
				if (pt.value == "document") {
					var prevValue = resultMap.get(pt.value);
					resultMap.set(pt.value, prevValue+1);
					KEYWORD_TOTAL++;
				}
			}
			
		}
	}

	// iterate through each AST node
	for (var i in ast.body){
		var astNode = new Functions.AST(ast);

		if (verbose>1 && (ast.body[i].type != "Line")) {
			console.log("======================\n", ast.body[i],"\n======================\n");
		}

		if (ast.body[i].type == "Line" || ast.body[i].type == "Block") {
			var commentLine = ASTUtils.getCode(ast.body[i]);
			COMMENT_LENGTH += commentLine.length;
			var hasAt = commentLine.match(/@cc_on|@if|@end|@_win32|@_win64/);
			if (hasAt !== null) {
				if (verbose>0) console.log("FEATURE[ConditionalCompilationCode]");
				updateResultMap(resultMap, "ConditionalCompilationCode", coefficient);
			}
		}


		var stringConcat = astNode.checkStringConcatnation(i,varMap);
		if (stringConcat != "") {
			if (verbose>0) console.log("FEATURE[StringConcatation] :" + stringConcat);
			updateResultMap(resultMap, "StringConcatation", coefficient);
		}

		var tokenLength = astNode.getRangeLengthOfExpression(i, ast);
		if (tokenLength > 5000) {
			if (verbose>0) console.log("FEATURE[LongExpression] : Expression with " + tokenLength + " tokens.");
			updateResultMap(resultMap, "LongExpression", coefficient);
			continue;
		}


		/* Variable Declaration */
		if (astNode.isVariableDeclaration(i)) {
			ASTUtils.traverse(ast.body[i], function(node, parent){
				if (node.type == "SequenceExpression") {
					var exprs = node.expressions;
					var codes = ASTUtils.getCode(node)
					var startIndex = 0;
					for (const exp of exprs) {
						parseProgram(ASTUtils.getCode(exp), scope, coefficient, varMap, verbose);
					}
				}
			});
			var declaration_blocks = astNode.getAllDeclarationBlocks(i);
			for (var block in declaration_blocks) {
				var variableName_Type = astNode.getVariableInitValue(declaration_blocks[block].id.name, declaration_blocks[block].init, varMap, verbose);
				var variableName_Types = variableName_Type[1];

				varMap.setVariable(variableName_Type[0], variableName_Types, verbose)
				for (var v in variableName_Types) {
					if (variableName_Types[v] === undefined) {
						console.log(ast.body[i].declarations)
						continue;
					}
					if (variableName_Types[v].type == "ArrayExpression" || 
						variableName_Types[v].type == "NewExpression") {
						
						var numElements = astNode.getNumberOfElementsInArrayExpression(i, ast);
						if (numElements > 1000){
							if (verbose>0) console.log("FEATURE[LongArray] : " + variableName_Type[0] + " contains " + numElements + " objects");
							updateResultMap(resultMap, "LongArray", coefficient);
						}
					} else if (variableName_Types[v].type == "pre_Function"){
						// e.g. var myVariable = eval;	
						if (verbose>0) console.log("FEATURE[FunctionObfuscation] :[", variableName_Type[0], "] -> [", variableName_Types[v].value, "]")
						updateResultMap(resultMap, "FunctionObfuscation", coefficient);
					} else if (astNode.hasFunctionExpression(i)) {
						//FunctionExpression
						ASTUtils.traverse(ast.body[i], function(node, parent){
							if (node.type == "FunctionExpression"){
								if (verbose>0) console.log("FEATURE[InitVariableWithFunctionExpression] in :" + scope + " :" + ASTUtils.getCode(parent));
							
								var emptyVarMap = new Functions.VariableMap(varMap._varMap);
								// assume all function parameters might be String type when parsing function body
								astNode.updateFunctionParams(i, emptyVarMap);
								
								var returnStatement = astNode.getReturnInstructions(i, emptyVarMap, ast);

								astNode.removeJumpInstructions(i, ast);
								// parse function body
								var coef = coefficient.slice();
								coef.push("in_function");
								parseProgram(ASTUtils.getCode(node.body).slice(1,-1), variableName_Types[v].value, coef, emptyVarMap, verbose);
								coef.push("in_return")
								for (var returnS of returnStatement) {
									// parse return statement
									parseProgram(returnS, "ReturnStatement in " + variableName_Types[v].value, coef, emptyVarMap, verbose);
								}

								updateResultMap(resultMap, "InitVariableWithFunctionExpression", coefficient);
							} 
						});
					} else if (variableName_Types[v].type == "Expression" || variableName_Types[v].type == "BinaryExpression" || 
							   variableName_Types[v].type == "UnaryExpression" || variableName_Types[v].type == "CallExpression" || 
							   variableName_Types[v].type == "LogicalExpression" || variableName_Types[v].type == "ThisExpression") {
						ASTUtils.traverse(ast.body[i], function(node){
							if (node.type == "CallExpression" && node.callee.type == "MemberExpression" && node.callee.object.type == "Identifier") {
								var object = node.callee.object.name;
								var obj_type = varMap.get(object);
								var property = node.callee.property.name;
								var funcNames = varMap.get(property);
								if (funcNames !== undefined && obj_type !== undefined) {
									for (const f of funcNames){
										if (f.type == "pre_Function" && f.value == "concat") {
											for (var ot of obj_type) {
												if (ot.type == "ArrayExpression") {
													if (verbose>0) console.log("FEATURE[ArrayConcatation] in :" + scope + " :" + variableName_Type[0] + "=" +variableName_Types[v].value);
													updateResultMap(resultMap, "ArrayConcatation", coefficient);
												} else if (ot.type == "String") {
													if (verbose>0) console.log("FEATURE[StringConcatation] in :" + scope + " :" + variableName_Type[0] + "=" +variableName_Types[v].value);
													updateResultMap(resultMap, "StringConcatation", coefficient);
												}
											}
										}
									}
								}
							}
						});

						if (variableName_Types[v].type == "BinaryExpression") {
							if (verbose>0) console.log("FEATURE[InitVariableWithBinaryExpression] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariableWithBinaryExpression", coefficient);
						} else if (variableName_Types[v].type == "ThisExpression") {
							if (verbose>0) console.log("FEATURE[InitVariableWithThisExpression] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariableWithThisExpression", coefficient);
						} else if (variableName_Types[v].type == "UnaryExpression") {
							if (verbose>0) console.log("FEATURE[InitVariableWithUnaryExpression] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariableWithUnaryExpression", coefficient);
						} else if (variableName_Types[v].type == "CallExpression"){
							if (verbose>0) console.log("FEATURE[InitVariableWithCallExpression] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariableWithCallExpression", coefficient);
						} else if (variableName_Types[v].type == "LogicalExpression"){
							if (verbose>0) console.log("FEATURE[InitVariableWithLogicalExpression] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariableWithLogicalExpression", coefficient);
						} else {
							if (verbose>0) console.log("FEATURE[InitVariableWithExpression] in :" + scope + ", Init Variable by "+variableName_Types[v].type +":" + variableName_Type[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "InitVariableWithExpression", coefficient);
						}		
					//else
					}
				}
			}
		}
		else if (astNode.isExpressionStatement(i)) {
			if (astNode.isAssignmentExpression(i)) {
				ASTUtils.traverse(ast.body[i], function(node, parent){
					if (node.type == "SequenceExpression") {
						var exprs = node.expressions;
						var codes = ASTUtils.getCode(node)
						var startIndex = 0;
						for (const exp of exprs) {
							parseProgram(ASTUtils.getCode(exp), scope, coefficient, varMap, verbose);
						}
					} 
				});
				var var_values = astNode.getAssignmentLeftRight(i, varMap, verbose);
				if (var_values[0] == "MY_MJSA_THIS") {
					var prevValue = resultMap.get("MY_MJSA_THIS");
					resultMap.set("MY_MJSA_THIS", prevValue+1);
					KEYWORD_TOTAL++;
					if (verbose>0) console.log("FEATURE[AssigningToThis]");
					updateResultMap(resultMap, "AssigningToThis", coefficient);
				}

				for (var v in var_values[1]){
					if (var_values[1][v].type == "BitwiseOperationExpression" ||
						var_values[1][v].type == "FunctionCall") {
						if (var_values[1][v].type == "BitwiseOperationExpression") {
							if (verbose>0) console.log("FEATURE[AssignWithBitOperation] in :" + scope + ", "+var_values[1][v].type +":" + var_values[0] + "=" +var_values[1][v].value);
							updateResultMap(resultMap, "AssignWithBitOperation", coefficient);
						} else {
							if (verbose>0) console.log("FEATURE[AssignWithFuncCall] in :" + scope + ", "+var_values[1][v].type +":" + var_values[0] + "=" +var_values[1][v].value);
							updateResultMap(resultMap, "AssignWithFuncCall", coefficient);
						}
						ASTUtils.traverse(ast.body[i], function(node){
							if (node.type == "CallExpression"){
								if (node.callee.type == "MemberExpression") {
									var callee = node.callee.property.name;
								} else {
									var callee = node.callee.name;
								}
								if (callee !== undefined ) {
									var types = varMap.get(callee);
									if (types !== undefined) {
										for (var t in types) {
											if (types[t].type == "pre_Function") {
												if (types[t].value == "concat") {
													var object = node.callee.object.name;
													var obj_type = varMap.get(object);
													if (obj_type !== undefined) {
														for (var ot of obj_type) {
															if (ot.type == "ArrayExpression") {
																if (verbose>0) console.log("FEATURE[ArrayConcatation] in :" + scope + " :" + var_values[0] + "=" +var_values[1][v].value);
																updateResultMap(resultMap, "ArrayConcatation", coefficient);
															} else if (ot.type == "String") {
																if (verbose>0) console.log("FEATURE[StringConcatation] in :" + scope + " :" + var_values[0] + "=" +var_values[1][v].value);
																updateResultMap(resultMap, "StringConcatation", coefficient);
															}
														}
													}
												} else {
													if (verbose>0) console.log("FEATURE[DecodeString_OR_DOM_FunctionCall] :", ASTUtils.getCode(node));
													updateResultMap(resultMap, "DecodeString_OR_DOM_FunctionCall", coefficient);
												}
											}
										}
									}
								}
							}
						});
						
					} else if (var_values[1][v].type == "FunctionExpression") {
						ASTUtils.traverse(ast.body[i], function(node){
							if (node.type == "FunctionExpression"){
								var emptyVarMap = new Functions.VariableMap(varMap._varMap);
								// assume all function parameters might be String type when parsing function body
								astNode.updateFunctionParams(i, emptyVarMap);
								
								var returnStatement = astNode.getReturnInstructions(i, emptyVarMap, ast);
								astNode.removeJumpInstructions(i, ast);

								// parse function body
								var coef = coefficient.slice();
								coef.push("in_function");
								parseProgram(ASTUtils.getCode(node.body).slice(1,-1), var_values[1][v].value, coef, emptyVarMap, verbose);
								coef.push("in_return");
								for (var returnS of returnStatement) {
									// parse return statement
									parseProgram(returnS, "ReturnStatement in " + var_values[1][v].value, coef, emptyVarMap, verbose);
								}
							} 
						});
					} else {

						ASTUtils.traverse(ast.body[i], function(node, parent){
							if (node.type == "ArrayExpression"){
								if (node.elements.length > 1000){
									if (verbose>0) console.log("FEATURE[LongArray] : " + var_values[0] + " contains " + node.elements.length + " objects");
									updateResultMap(resultMap, "LongArray", coefficient);
								}
							}

							if (node.type == "ThisExpression"){
								if (verbose>0) console.log("FEATURE[AssignWithThisExpression] : " + ASTUtils.getCode(parent));
								updateResultMap(resultMap, "AssignWithThisExpression", coefficient);
							}

							if (node.type == "LogicalExpression"){
								if (verbose>0) console.log("FEATURE[AssignWithLogicalExpression] : " + ASTUtils.getCode(parent));
								updateResultMap(resultMap, "AssignWithLogicalExpression", coefficient);
							}
							
							if (node.type == "AssignmentExpression") {
								var var_value = astNode.checkStaticMemberFunctionCall(node, varMap);
								if (var_value !== undefined) {
									if (verbose>0) console.log("FEATURE[FunctionObfuscation] :[", var_value[0], "] -> [", var_value[1].value, "]")
									updateResultMap(resultMap, "FunctionObfuscation", coefficient);
								}
							}
							if (node.type == "CallExpression"){
								var callee;

								if (node.callee.type == "MemberExpression") {
									callee = node.callee.property.name;
								} else if (node.callee.type == "FunctionExpression") {
									astNode.removeJumpInstructions(i, ast);
									// e.g. x = a[...] + (function foo(){...}());
									// remove the call bracket at the end of function expression
									// i.e. function a(){...}()
									var coef = coefficient.slice();
									coef.push("in_function")
									var funcBody = ASTUtils.getCode(node);
									parseProgram(funcBody.slice(funcBody.indexOf("{"),funcBody.lastIndexOf("}")+1), "CallExpression", coef, varMap, verbose);
									callee = node.callee.name;
								} else {
									callee = node.callee.name;
								}
								if (callee !== undefined ) {
									var types = varMap.get(callee);
									for (var t in types) {
										if (types[t].type == "pre_Function") {
											if (verbose>0) console.log("FEATURE[DecodeString_OR_DOM_FunctionCall] :", ASTUtils.getCode(node));
											updateResultMap(resultMap, "DecodeString_OR_DOM_FunctionCall", coefficient);
										}
									}
								}
								
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
								if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable] in :" + scope + ": " + funcNames[f].type + ":" + funcName + "(STRING) => " + funcNames[f].value + "(" + args[0].value + ")");
								updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
							} else if (args[0].type == "Identifier" ||
									   args[0].type == "ArrayMemberExpression" || 
									   args[0].type == "FieldMemberExpression" ) {
								// pre-processing 
								if (args[0].type == "ArrayMemberExpression") {
									var object  = args[0].value[0];
									var indices = args[0].value[1];
									var r_vs;

									if (object instanceof Array) {
										var indx = [];
										while (object instanceof Array) {
											var obj = varMap.get(object[0]);
											indx = indx.concat(object[1]);
											object = object[0];
										}
										try {
											for (var ii = indx.length-1; ii >=0;ii--){
												var objIndex = indx[ii].value;
												// console.log("objIndex:", objIndex)
												if (obj !== undefined) {
													if (obj[0].type == "ObjectExpression") {
														objIndex = objIndex.replace(/"/g,"");
														obj = obj[0].value[objIndex];
													} else {
														obj = obj[0].value[objIndex][1];
													}
												}
											}
										} catch (err) {
											if (verbose>0) console.log("FEATURE[FuncCallOnUnkonwnArrayIndex] in :" + scope + ": " + ASTUtils.getCode(astNode._node.body[i]));
											updateResultMap(resultMap, "FuncCallOnUnkonwnArrayIndex", coefficient);
										}
										r_vs = obj;
									} else {
										r_vs = varMap.get(object);
										if (r_vs === undefined) { 
											if (verbose>0) console.log("FEATURE[FuncCallOnNonLocalArray] in :" + scope + ": Accessing non-local array object: " + ASTUtils.getCode(astNode._node.body[i]));
											updateResultMap(resultMap, "FuncCallOnNonLocalArray", coefficient);
										}
									}

									var ref_values = [];
									for (var inx in indices){
										// skip " when handling object field access aka o["f"] => o.f
										// indices will be `"f"` instead of [{type:"Numeric", value:2}]
										if (indices[inx] == "") continue;
										index = indices[inx].value;
										for (var r in r_vs){
											var array_values = r_vs[r];
											if (r_vs[r].type == "ObjectExpression") {
												const field = r_vs[r].value[index.replace(/"/g,"")];
												if (field !== undefined) {
													ref_values = ref_values.concat(field);
												} 
												continue;
											}
											
											if (r_vs[r].type == "ArrayExpression" || r_vs[r].type == "NewExpression") {
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

									if (object instanceof Array) {
										var field = [];
										while (object instanceof Array) {
											var obj = varMap.get(object[0]);
											field = field.concat(object[1]);
											object = object[0];
										}
										try {
											for (var ii = field.length-1; ii >=0;ii--){
												var objIndex = field[ii].value;
												if (obj !== undefined) {
													if (obj[0].type == "ObjectExpression") {
														obj = obj[0].value[objIndex];
													} else {
														obj = obj[0].value[objIndex][1];
													}
												}
											}
										} catch (err) {
											if (verbose>0) console.log("FEATURE[FuncCallOnUnkonwnArrayIndex] in :" + scope + ": " + ASTUtils.getCode(astNode._node.body[i]));
											updateResultMap(resultMap, "FuncCallOnUnkonwnArrayIndex", coefficient);
										}
										r_vs = obj;
									} 

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
									/* args[0].type == "Identifier" 
									 * we assume the parameter passed in can be type String */
									var ref_values = varMap.get(args[0].value, verbose);
									if (ref_values === undefined) {
										ref_values = [ { type: 'String', value: 'UNKNOWN' } ];
									}
								}

								if (ref_values.length == 0)  {
									console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", args[0])
									continue;
								}

								// ref_values are all possible values for one variable, e.g. {key:a, value:["Str1",0,"Str2"]}
								for (var ref in ref_values) {
									if (ref_values[ref] && ref_values[ref].type == "String") {
										if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable] in :" + scope + ": "+funcName+"(Object->STRING) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[ref].value + ")");
										updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
									} else if (ref_values[ref] && ref_values[ref].type == "Expression") {
										if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable] in :" + scope + ": "+funcName+"(Expr) => [" + args[0].value + "] ==> "+funcName+"(" + ref_values[ref].value + ")");
										updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
									}
								}							
							} else if (args[0].type == "BinaryExpression") {
								if (verbose>0) console.log("FEATURE[FuncCallOnBinaryExpr] in :" + scope + ": "+funcName+"(" + args[0].type + ") => "+funcName+"(" + args[0].value + ")");
								updateResultMap(resultMap, "FuncCallOnBinaryExpr", coefficient);
							} else if (args[0].type == "UnaryExpression") {
								if (verbose>0) console.log("FEATURE[FuncCallOnUnaryExpr] in :" + scope + ": "+funcName+"(" + args[0].type + ") => "+funcName+"(" + args[0].value + ")");
								updateResultMap(resultMap, "FuncCallOnUnaryExpr", coefficient);
							} else if (args[0].type == "CallExpression") {
								if (verbose>0) console.log("FEATURE[FuncCallOnCallExpr] in :" + scope + ": "+funcName+"(" + args[0].type + ") => "+funcName+"(" + args[0].value + ")");
								updateResultMap(resultMap, "FuncCallOnCallExpr", coefficient);
							} else {
								// args[0].type == "Numeric"
							}
						}
					}
					
				}
			} 
		} else if (astNode.isFunctionDeclaration(i)) {
			// if node type is FunctionDeclaration, it must has function Name
			funcName = astNode.getFunctionName(i);
			varMap.setVariable(funcName, [{ type: 'user_Function', value: funcName }]);
			var emptyVarMap = new Functions.VariableMap(varMap._varMap);

			// assume all function parameters might be String type when parsing function body
			astNode.updateFunctionParams(i, emptyVarMap);

			var returnStatement = astNode.getReturnInstructions(i, emptyVarMap, ast);
			astNode.removeJumpInstructions(i, ast);

			// parse function body
			var coef = coefficient.slice();
			coef.push("in_function")
			parseProgram(ASTUtils.getCode(ast.body[i].body).slice(1, -1), funcName, coef, emptyVarMap, verbose);
			coef.push("in_return")
			for (var returnS of returnStatement) {
				// parse return statement
				parseProgram(returnS, "ReturnStatement in " + funcName, coef, emptyVarMap, verbose);
			}
		} else if (astNode.isIfElseStatement(i)) {
			astNode.removeJumpInstructions(i, ast);
			
			const branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());
			// varMap.printMap();
			for (var b in branchExprs){
				var eVarMap = new Functions.VariableMap(varMap._varMap);
				var coef = coefficient.slice();
				coef.push("in_if")
				const ifbranchVarMapList = parseProgram(branchExprs[b], "if_statements", coef, eVarMap, verbose);

				ifbranchVarMapList.forEach(function(val1) {
					// variable in @varMap
					var var_values = varMap.get(val1.key);

					// value updated in if-branch OR new value created in if-branche
					for (var v in var_values) {
						if (var_values[v] != val1.value) {
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
					}
					
				});
			}

			diffMap.multipleUpdate(varMap);

		}else if (astNode.isIfStatement(i)) {
			astNode.removeJumpInstructions(i, ast);

			const branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());

			for (var b in branchExprs){
				var eVarMap = new Functions.VariableMap(varMap._varMap);
				var coef = coefficient.slice();
				coef.push("in_if")
				const ifbranchVarMapList = parseProgram(branchExprs[b], "if_statements", coef, eVarMap, verbose);

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
						if (prevValues && !listEqual(prevValues, val1.value)) typeSet.my_add(prevValues);

						typeSet.my_add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					}
				});
			}
			diffMap.multipleUpdate(varMap);

		} else if (astNode.isForStatement(i) || astNode.isForInStatement(i) || astNode.isForOfStatement(i)) {
			astNode.removeJumpInstructions(i, ast);

			const bodyExprs = astNode.parseForStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());

			if (bodyExprs.length > 1) {
				// parse for condition
				var coef = coefficient.slice();
				coef.push("in_loop")
				const subVarMapList1 = parseProgram(bodyExprs[0], "for_statements", coef, varMap, verbose);
				subVarMapList1.forEach(function(val1) {
					var typeSet = new Set();
					if (astNode.isForStatement(i) && val1.value.length > 0){
						if (val1.value[0].type == "undefined" && val1.value[0].value == "undefined") {
							typeSet.my_add(varMap.get(val1.key));
						} else {
							typeSet.my_add(val1.value);
						}
					} 
					diffMap.setVariable(val1.key, typeSet);
				});
				diffMap.multipleUpdate(varMap);
			}


			// parse for body with current varMap
			var eVarMap = new Functions.VariableMap(varMap._varMap);

			var coef = coefficient.slice();
			coef.push("in_loop")
			const subVarMapList2 = parseProgram(bodyExprs[bodyExprs.length-1], "for_statements", coef, eVarMap, verbose);
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
			astNode.removeJumpInstructions(i, ast);

			const bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());
			var eVarMap = new Functions.VariableMap(varMap._varMap);

			var coef = coefficient.slice();
			coef.push("in_loop")
			const subVarMapList = parseProgram(bodyExprs[0], "while_statements", coef, eVarMap, verbose);
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
			astNode.removeJumpInstructions(i, ast);

			const bodyExprs = astNode.parseWhileStatement(i, varMap, verbose);
			// update varMap directly since the body code will always be executed at least once in do-while
			var coef = coefficient.slice();
			coef.push("in_loop")
			parseProgram(bodyExprs[0], "while_statements", coef, varMap, verbose);
		} else if (astNode.isTryStatement(i)) {
			astNode.removeJumpInstructions(i, ast);

			const bodyExprs = astNode.parseTryStatement(i, varMap, verbose);

			var eVarMap1 = new Functions.VariableMap(varMap._varMap);
			var eVarMap2 = new Functions.VariableMap(varMap._varMap);

			var coef = coefficient.slice();
			coef.push("in_try")
			const tryVarMapList   = parseProgram(bodyExprs[0], "Try_statements",   coef, eVarMap1, verbose);
			const catchVarMapList = parseProgram(bodyExprs[1], "Catch_statements", coef, eVarMap2, verbose);
			
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
				const finallyVarMapList = parseProgram(bodyExprs[2], "test", ["in_test"], eVarMap3, false);
				
				// copy variables from @diffMap, parse finally block for detecting malicious patterns
				diffMap.multipleUpdate(eVarMap3);
				var coef = coefficient.slice();
				coef.push("in_try")
				parseProgram(bodyExprs[2], "Finally_statements", coef, eVarMap3, verbose);

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
		} else if (astNode.isSwitchStatement(i)) {
			// astNode.removeJumpInstructions(i, ast);

			const bodyExprs_defaultCaseIndex = astNode.parseSwitchStatement(ast, i, varMap, verbose);
			const bodyExprs = bodyExprs_defaultCaseIndex[0];
			const default_case = bodyExprs_defaultCaseIndex[1];

			var diffMap = new Functions.VariableMap(new HashMap());

			var coef = coefficient.slice();
			coef.push("in_switch")
			if (default_case != -1) {
				// parse default case first, this case will be executed if non-of the cases matched,
				// i.e. will override main scope values anyway
				parseProgram(bodyExprs[default_case], "switch_statements", coef, varMap, false);
			}

			for (var b = 0; b < bodyExprs.length; b++){
				// skip the default case
				if (b == default_case) continue;

				var eVarMap = new Functions.VariableMap(varMap._varMap);
				const switchBranchVarMapList = parseProgram(bodyExprs[b], "switch_statements", coef, eVarMap, verbose);

				switchBranchVarMapList.forEach(function(val1) {
					var prevBranch = diffMap.get(val1.key);

					// check if value already in @diffMap
					if (prevBranch) {
						prevBranch.my_add(val1.value);
						diffMap.setVariable(val1.key, prevBranch);
					} else {
						const prevValues = varMap.get(val1.key);
						var typeSet = new Set();

						// if variable exists in main program and been updated in if-branch, add the prev_value
						if (prevValues && !listEqual(prevValues, val1.value)) typeSet.my_add(prevValues);

						typeSet.my_add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					}
				});
			}
			diffMap.multipleUpdate(varMap);
		}
	}
	if (verbose>1 && scope == "User_Program") varMap.printMap();
	return varMap.toList();
}

//===================check input source============================
if (showHeader) {
	printHeader(resultMap)
} else if (filePath !== undefined && filePath !== null) {
	var sourcefile = fs.readFileSync(filePath, "utf8");
	FILE_LENGTH = sourcefile.length;
	try {
		// try to parse the program directly
		// if input file is JavaScript Codes
	    parseProgram(sourcefile, "User_Program", ["in_main"], init_varMap, verbose);
	}
	catch(err) {
		// try to extract all scattered <script>blocks</script>
		// if input file is HTML file
		var match = sourcefile.match('<[Ss][Cc][Rr][Ii][Pp][Tt][^>]*>(?:[^<]+|<(?!/[Ss][Cc][Rr][Ii][Pp][Tt]>))+');

		var scriptCodes = "";
		if (match !== null) {
			while (match !== null) {
				const matchLength = match[0].length;
				var scriptBlock = match[0].substring(match[0].indexOf(">")+1,match[0].length);

				var htmlCommentInScriptBlock = scriptBlock.match(/<!--[\s\S]*?-->/g, "");
				if (htmlCommentInScriptBlock !== null) {
					if (verbose>0) console.log("FEATURE[HtmlCommentInScriptBlock]");
					updateResultMap(resultMap, "HtmlCommentInScriptBlock", ["in_file"]);
					scriptBlock = scriptBlock.replace(/<!--[\s\S]*?-->/g, "")
				}

				scriptCodes = scriptCodes + scriptBlock;
				sourcefile = sourcefile.substring(matchLength+1, sourcefile.length);
				match = sourcefile.match('<[Ss][Cc][Rr][Ii][Pp][Tt][^>]*>(?:[^<]+|<(?!/[Ss][Cc][Rr][Ii][Pp][Tt]>))+');
			}
		} else {
			scriptCodes = sourcefile;
		}
		
		try {
		    parseProgram(scriptCodes, "User_Program", ["in_main"], init_varMap, verbose);
		}
		catch(err) {
			// still encounter parsing errors
			// try to fix some errors for compliation
			// CASE 1: using "this" in code snippet
		    var hasThis = scriptCodes.match(/this/);
			if (hasThis !== null){
				// replace this => MY_MJSA_THIS
				// precent parsing error for some code snippet
				scriptCodes=scriptCodes.replace(/this/g, "MY_MJSA_THIS")

			}

			// CASE 2: using conditional compilation targeting IE browser
		    var hasAt = scriptCodes.match(/@cc_on|@if|@end|@_win32|@_win64/);
			if (hasAt !== null) {
				scriptCodes=""
				if (verbose>0) console.log("FEATURE[ConditionalCompilationCode]");
				updateResultMap(resultMap, "ConditionalCompilationCode", ["in_file"]);
			}
			// CASE 3: dot notation used in function name
			var dotFuncName = scriptCodes.match(/function (.*?)\.(.*?)\(/);
			if (dotFuncName !== null){
				if (verbose>0) console.log("FEATURE[DotNotationInFunctionName]");
				updateResultMap(resultMap, "DotNotationInFunctionName", ["in_file"]);
			
				var nCodes = ""
			    while (dotFuncName !== null){
			    	var start = dotFuncName.index;
			    	var matchString = dotFuncName[0];
			    	var replaceMatchStr = matchString.replace(/\./g, "");
			    	replaceStr =  scriptCodes.replace(matchString, replaceMatchStr).slice(0, start+replaceMatchStr.length);
			    	scriptCodes =  scriptCodes.replace(matchString, replaceMatchStr);
			    	nCodes += replaceStr;
			    	scriptCodes = scriptCodes.slice(replaceStr.length, scriptCodes.length);
			    	dotFuncName = scriptCodes.match(/function (.*?)\.(.*?)\(/);
			    }
			    nCodes += scriptCodes;
			    scriptCodes = nCodes;
			}
			parseProgram(scriptCodes, "User_Program", ["in_main"], init_varMap, verbose);
		}
	}
	// ========================
	if (calcualteWeight && resultMap.size > 0) showResult(resultMap);
} 

process.exit(0)

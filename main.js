//================================Setup======================================
const HashMap = require('hashmap');					  // load hashmap
const esprima = require('esprima');					  // load esprima
const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
const Functions = require('./functions'); 			  // load helper functions
const commandLineArgs = require('command-line-args'); // load command-line-args
const commandLineUsage = require('command-line-usage')
const fs = require('fs');
const myHeader = require('./assets/header')
const chalk = require('chalk')
//===================parse command line arguments============================
const optionDefinitions = [
  { name: 'verbose',      	alias: 'v', type: Number },
  { name: 'weight',	 	  	alias: 'w', type: Boolean},
  { name: 'src', 		  	alias: 's', type: String },
  { name: 'header',		   	alias: 'a', type: Boolean},
  { name: 'inplaceMode',		alias: 'i', type: Boolean},
  { name: 'fastMode',		alias: 'f', type: Boolean},
  { name: 'help',			alias: 'h', type: Boolean}
]

const options = commandLineArgs(optionDefinitions)
const calcualteWeight = options.weight; 
const verbose = (options.verbose === undefined) ? 0 : (options.verbose === null)? 1 : 2;
const showHeader = options.header;
const filePath = options.src;
const inplaceMode = options.inplaceMode;
const fastMode = options.fastMode;
const sections = [
  {
    content: chalk.green(myHeader),
    raw: true
  },
  {
    header: 'AMJ',
    content: 'Analyser for Malicious JavaScript'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'help', alias: 'h', description: 'Display this usage guide.'
      },
      {
        name: 'src', alias: 's', description: 'The input files to process',
      	typeLabel: '{underline file}'
      },
      {
        name: 'header', alias: 'a', description: 'The input files to process',
      },
      {
        name: 'vervise', alias: 'v', description: '-v Printout features captured, -v 2 Debug mode',
      },
      {
        name: 'weight', alias: 'w', description: 'Print weighted feature arrays',
      },
      {
        name: 'inplaceMode', alias: 'i', description: 'When this flag is set, MJSA will unpack {underline eval()} inplace',
      },
      {
        name: 'fastMode', alias: 'f', description: 'When this flag is set, MJSA will only parse at most 100 elements any objects and skip long instructions',
      }
    ]
  },
  {
    header: 'Examples',
    content: [
      {
        desc: '1. Printout the capture features from {underline user.js}',
        example: '$ node amj.js -s user.js -v'
      },
      {
        desc: '2. Printout the weighted feature array from {underline user.js} in fast mode',
        example: '$ node amj.js -s user.js -w -f'
      }
    ]
  },
  {
    content: 'Project home: {underline https://github.com/hl5814/AMJ}'
  }
]
const usage = commandLineUsage(sections)
if (options.help) {
	console.log(usage)
}
//===============================MainProgram=================================
var init_varMap = new Functions.VariableMap(new HashMap());

var pre_funcs = ["MJSA_TEST", "document", "eval", "unescape", "replace", "write", "writeln", "atob", "btoa", "toString", "String.fromCharCode", "fromCharCode",
				 "parseInt", "alert", "Array","charCodeAt" , "substr", "substring", "concat","join","split","reverse", "slice", "push"];

for (var f in pre_funcs) {
	init_varMap.setVariable(pre_funcs[f], [{ type: 'pre_Function', value: pre_funcs[f] }] );
}
init_varMap.setVariable("String", [{ type: 'ObjectExpression', value: {"fromCharCode": [{type: 'pre_Function', value: "fromCharCode"}]} }] );

var resultMap = new HashMap();

const FEATURES = [	"VariableWithFunctionExpression",	// x = function(){};
					"VariableWithExpression",			
					"VariableWithThisExpression",		// x = this;
					"VariableWithUnaryExpression",		// x = -a;
					"VariableWithBinaryExpression",		// x = a + b;
					"VariableWithCallExpression",		// x = eval(xx)
					"VariableWithLogicalExpression",	// x = 1^2;
					"VariableWithBitOperation", 		// x = 0||1&&2;
					"FunctionObfuscation",				// x = eval;
					"StringConcatenation",				// "a"+"b"
					"PredefinedFuncCalls", 				// String.fromCharCode(65)
					"DOCUMENT_Operations",				// document.write(..)
					"WINDOW_Operations",				// window.btoa(..)
					"FuncCallOnBinaryExpr",				// foo(x+y)
					"FuncCallOnUnaryExpr",				// bar(-x)
					"FuncCallOnStringVariable",			// foo("x") where function must be defined either by user or predefined
					"FuncCallOnCallExpr",				// foo(var(x));
					"FuncCallOnNonLocalArray",			// foo(x[2]) where x is not defined in scope
					"FuncCallOnUnkonwnReference",		// foo(x.f) or foo(x[y]) where x is defiend but f and y not defeind in scope
					"HtmlCommentInScriptBlock",			// <script> <!-- xxx //--> </script>
					"AssigningToThis",					// this = 1;
					"ConditionalCompilationCode",		// @cc_on|@if|@end|@_win32|@_win64
					"DotNotationInFunctionName",		// function a.prototype(){}
					"LongArray",						// array contains >1000 elements (e.g.var x = [1,2,3,...., 1000])
					"LongExpression",					// expression > 1000 tokens (e.g. var x = 1+2+3+4+...+1000);
					"UnfoldEvalSuccess",				// eval(..)
					"Unescape",							// ..unescape(..)
					"UnfoldUnescapeSuccess"]			// execute unescape successfully
					

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

for (const k of KEYWORDS)  		resultMap.set(k, 0);
for (const p of PUNCTUATORS) 	resultMap.set(p, 0);
for (const f of FEATURES) 		resultMap.set(f, 0);
for (const s of SCOPES) 		resultMap.set(s, 0);
for (const l of LENGTH) 		resultMap.set(l, 0);


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
	if (FILE_LENGTH > 0) {
		resultMap.set("CommentPerFile", (COMMENT_LENGTH/FILE_LENGTH).toFixed(4));
	}
	resultMap.forEach(function(value, key){
		console.log(value,key)
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
					// console.log("values[v].value[val]", values[v].value[val])
					// console.log("item[0].value[val]", item[0].value[val])
					if (values[v].value[val][0] != item[0].value[val][0]) {
						// if (values[v].value[val][0] == item[0].value[val][0]) {
							if (item[0].value[val][0] === undefined) continue;
							if (item[0].type == 'Null' || item[0].type == "undefined") {
								continue;
							}

							item[0].value[val].push(values[v].value[val][0]);
							// console.log("->item[0].value[val]", item[0].value[val])
						// }
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
var FuncDepthCount = 0;
function parseFuncBody(thisAST, func, args, funcName, scope, coefficient, varMap, verbose=false){

	if (FuncDepthCount++ > 5000) return;
	try{
		var eVarMap = new Functions.VariableMap(varMap._varMap);
		var diffMap = new Functions.VariableMap(new HashMap());
		var trueArgs = [];
		if (args !== undefined) {
			for (var a of args) {
				if (a.type == "CallExpression") {

					var fName = a.value.callee.name;
					if (fName === undefined) { }
					var rValue;
					try {
						const funcBodyVarMapList = parseProgram(ASTUtils.getCode(a.value), fName, coefficient, eVarMap, verbose);
						var hasReturnValue = eVarMap.get(fName+"_return");
						if (hasReturnValue !== undefined && hasReturnValue.length >0) {
							rValue = hasReturnValue.pop();
						} else {
							var returnValue;
							var innerFunc = eVarMap.get(fName)[0];
							if (innerFunc.type == "user_Function") {
								ASTUtils.traverse(innerFunc.value, function(node){
									if (node.type == "ReturnStatement" && node.argument !== null){
										rValue = thisAST.getVariableInitValue("", node.argument, eVarMap, verbose)[1];
									}
								});

								funcBodyVarMapList.forEach(function(val1) {
									var prevVal = varMap.get(val1.key);
									if (prevVal !== undefined) {
										var typeSet = new Set();
										typeSet.my_add(val1.value);
										diffMap.setVariable(val1.key, typeSet);
									}
								});
								diffMap.multipleUpdate(varMap);
							}
						}
					} catch(err){}

					if (rValue !== undefined) {
						trueArgs = trueArgs.concat(rValue);
					} else {
						trueArgs.push(a)
					}
				} else {
					trueArgs.push(a)
				}
			}
		}
		var parameters = func.value.params; 
		var parameterList = [];
		var argMap = {};
		var codeBody = ASTUtils.getCode(func.value.body).slice(1, -1);
		var assignString = "";
		if (parameters !== undefined && codeBody !== undefined) {
			var funcArguments = [];
			for (var ta in trueArgs) {
				var tta = trueArgs[ta];
				if (tta instanceof Array) {
					funcArguments = funcArguments.concat(tta);
				} else {
					funcArguments.push(tta)
				}
			}


			if (funcArguments !== undefined) {
				for (var a in funcArguments) {
					var arg = funcArguments[a];
					if (arg !== undefined && arg.type == "ArrayMemberExpression") {
						var elementValue = thisAST.getTrueValueFromMemberExpression([arg], varMap, verbose)[0];

						if (parameters[a] !== undefined) {
							if (parameters[a].type == "Identifier") {
								parameterList.push(parameters[a].name);
								assignString += ("var " + parameters[a].name + " = " + elementValue.value + ";"); 
							} else if (parameters[a].type == "AssignmentPattern") { }
						}
					} else if (arg !== undefined && arg.type == "Numeric" || arg.type == "String") {

						if (parameters[a] !== undefined) {
							if (parameters[a].type == "Identifier") {
								parameterList.push(parameters[a].name);
								assignString += ("var " + parameters[a].name + " = " + arg.value + ";"); 

							} else if (parameters[a].type == "AssignmentPattern") { }
						}
					} else if (arg !== undefined && arg.type == "Identifier") {
						var globalValue = varMap.get(arg.value);
						if (parameters[a] !== undefined) {
							if (parameters[a].type == "Identifier") {
								
								parameterList.push(parameters[a].name);
								if (globalValue !== undefined) {
									argMap[parameters[a].name] = arg.value;
									eVarMap.setVariable(parameters[a].name, globalValue);
								} else {
									assignString += ("var " + parameters[a].name + " = " + arg.value + ";"); 
								}
							} else if (parameters[a].type == "AssignmentPattern") { }
						}
					}
					
				}
			}
			codeBody = assignString + codeBody;


			const funcBodyVarMapList = parseProgram(codeBody, funcName, coefficient, eVarMap, verbose);
				

			var rVal = []; 
			var hasReturnValue = eVarMap.get(funcName+"_return");
			if (hasReturnValue !== undefined && hasReturnValue.length >0) {
				rVal = hasReturnValue.pop();
			} else {
				ASTUtils.traverse(func.value, function(node){
					if (node.type == "ReturnStatement" && node.argument !== null){	
						rVal.push(thisAST.getVariableInitValue("", node.argument, eVarMap, verbose)[1]);
					}
				});
				funcBodyVarMapList.forEach(function(val1) {
					var prevVal = varMap.get(val1.key);
					
					if (prevVal !== undefined && (parameterList.indexOf(val1.key) == -1)) {
						var typeSet = new Set();
						typeSet.my_add(val1.value);
						diffMap.setVariable(val1.key, typeSet);
					} else {
						if (argMap.hasOwnProperty(val1.key)) {
							var typeSet = new Set();
							typeSet.my_add(val1.value);
							diffMap.setVariable(argMap[val1.key], typeSet);
						}
					}
				});
				diffMap.multipleUpdate(varMap);
			}
		
		}
		var validReturn = [];
		if (rVal !== undefined && rVal.length >0) {
			for (var r of rVal){
				if (r.type != "undefined" && r.value != "undefined") {
					validReturn.push(r);
				}
			}
		}
		if (validReturn.length > 0) {
			return validReturn;
		}
	} catch(err){}
}



function parseProgram(program, scope, coefficient, varMap, verbose, depth=0){
	var NUMBER_OF_EVAL = 0;

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

	var local_variables = [];
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

		var tokenLength = astNode.getRangeLengthOfExpression(i, ast);
		if (tokenLength > 1000) {
			if (verbose>0) console.log("FEATURE[LongExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Expression with " + tokenLength + " tokens.");
			updateResultMap(resultMap, "LongExpression", coefficient);
			if (fastMode) continue;
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
			var declaration_kind = astNode.getAllDeclarationKind(i);

			for (var block of declaration_blocks) {
				var variableName_Type = astNode.getVariableInitValue(block.id.name, block.init, varMap, verbose);
				var variableName_Types = variableName_Type[1];

				// block scope declarations will be delete at the end of the scope
				if (declaration_kind == "let" || declaration_kind == "const") {
					local_variables.push(variableName_Type[0]);
				}
				varMap.setVariable(variableName_Type[0], variableName_Types, verbose)
				var lastDeclaratorNode;
				var found = false;
				ASTUtils.traverse(ast.body[i], function(node, parent){
					if (node.type == "VariableDeclarator") lastDeclaratorNode = node;
					if (node.type == "FunctionExpression"){
						if (verbose>0) console.log("FEATURE[VariableWithFunctionExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + ASTUtils.getCode(parent));
					
						var emptyVarMap = new Functions.VariableMap(varMap._varMap);
						// assume all function parameters might be String type when parsing function body
						astNode.updateFunctionParams(i, emptyVarMap);
						var returnStatement = astNode.getReturnInstructions(i, emptyVarMap, ast);
						var codeBody = ASTUtils.getCode(node);
						astNode.removeJumpInstructions(i, ast);
						// parse function body
						var coef = coefficient.slice();
						coef.push("in_function");
						parseProgram(ASTUtils.getCode(node.body).slice(1,-1), ASTUtils.getCode(node), coef, emptyVarMap, verbose);
						coef.push("in_return")
						for (var returnS of returnStatement) {
							// parse return statement
							parseProgram(returnS, "ReturnStatement in " + codeBody, coef, emptyVarMap, verbose);
						}
						updateResultMap(resultMap, "VariableWithFunctionExpression", coefficient);
					}  else if (node.type == "BinaryExpression" && parent !== null && parent.type == "VariableDeclarator") {
						var bitOperators = [">>", "<<", "|", "&", "^", "~", ">>>", ">>=", "<<=", "|=", "&=", "^=", "~=", ">>>="];
						if (bitOperators.indexOf(node.operator) != -1) {
							if (verbose>0) console.log("FEATURE[VariableWithBitOperation]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + ASTUtils.getCode(lastDeclaratorNode));
							updateResultMap(resultMap, "VariableWithBitOperation", coefficient);
						}
					} else if (node.type == "UnaryExpression" && parent !== null && parent.type == "VariableDeclarator") {
						if (node.operator == "~") {
							if (verbose>0) console.log("FEATURE[VariableWithBitOperation]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + ASTUtils.getCode(lastDeclaratorNode));
							updateResultMap(resultMap, "VariableWithBitOperation", coefficient);
						}
					} else if (node.type == "ThisExpression") {
						if (verbose>0) console.log("FEATURE[VariableWithThisExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + ASTUtils.getCode(lastDeclaratorNode));
						updateResultMap(resultMap, "VariableWithThisExpression", coefficient);
					} else if (node.type == "CallExpression" && !found) {
						var callee;
						if (node.callee.type == "MemberExpression") {
							callee = node.callee.property.name;
						} else if (node.callee.type == "FunctionExpression") {
							astNode.removeJumpInstructions(i, ast);
							var coef = coefficient.slice();
							coef.push("in_function")
							var funcBody = ASTUtils.getCode(node);
							parseProgram(funcBody.slice(funcBody.indexOf("{"),funcBody.lastIndexOf("}")+1), "CallExpression", coef, varMap, verbose);
							callee = node.callee.name;
						} else {
							callee = node.callee.name;
						}
						if (callee !== undefined ) {
							var funcNames = varMap.get(callee);
							if (funcNames !== undefined) {
								for (var func of funcNames) {
									if (func.type == "user_Function" && !fastMode){
										var returnVal;
										var args = astNode.getFunctionArguments(node, varMap);

										var rVal = parseFuncBody(astNode, func, args, funcName, scope, coefficient, varMap, verbose);
										if (rVal !== undefined) {
											found = true;
											varMap.setVariable(variableName_Type[0], rVal, verbose)
											varMap.setVariable(funcName+"_return_"+variableName_Type[0], rVal, verbose);
										}
									}
								}
							}
						}
					}
				});

				for (var v in variableName_Types) {
					if (variableName_Types[v] === undefined) continue; 
					if (variableName_Types[v].type == "ArrayExpression" || variableName_Types[v].type == "NewExpression") {
						var numElements = astNode.getNumberOfElementsInArrayExpression(i, ast);
						if (numElements > 1000){
							if (verbose>0) console.log("FEATURE[LongArray]:" + coefficient[coefficient.length-1] + ":" + scope + ":" + variableName_Type[0] + " contains " + numElements + " objects");
							updateResultMap(resultMap, "LongArray", coefficient);
						}
					} else if (variableName_Types[v].type == "pre_Function"){
						if (verbose>0) console.log("FEATURE[FunctionObfuscation]:" + coefficient[coefficient.length-1] + ":" + scope + ":[", variableName_Type[0], "] -> [", variableName_Types[v].value, "]")
						updateResultMap(resultMap, "FunctionObfuscation", coefficient);
					} else if (variableName_Types[v].type == "BinaryExpression") {
						if (verbose>0) console.log("FEATURE[VariableWithBinaryExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + variableName_Type[0] + " = " +variableName_Types[v].value);
						updateResultMap(resultMap, "VariableWithBinaryExpression", coefficient);
					} else if (variableName_Types[v].type == "UnaryExpression") {
						if (verbose>0) console.log("FEATURE[VariableWithUnaryExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + variableName_Type[0] + " = " +variableName_Types[v].value);
						updateResultMap(resultMap, "VariableWithUnaryExpression", coefficient);
					} else if (variableName_Types[v].type == "CallExpression"){
						if (verbose>0) console.log("FEATURE[VariableWithCallExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:"  + ASTUtils.getCode(ast.body[i]));
						updateResultMap(resultMap, "VariableWithCallExpression", coefficient);
					} else if (variableName_Types[v].type == "LogicalExpression"){
						if (verbose>0) console.log("FEATURE[VariableWithLogicalExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + variableName_Type[0] + " = " +variableName_Types[v].value);
						updateResultMap(resultMap, "VariableWithLogicalExpression", coefficient);
					} else if (variableName_Types[v].type == "Expression"){
						if (verbose>0) console.log("FEATURE[VariableWithExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Init Variable by:" + variableName_Type[0] + " = " +variableName_Types[v].value);
						updateResultMap(resultMap, "VariableWithExpression", coefficient);
					}
					// else
				}
			}
		} else if (astNode.isExpressionStatement(i)) {
			var exprList = [];
			if (astNode.isSequenceExpression(i)) {
				for (var expression of ast.body[i].expression.expressions) {
					exprList.push(expression);
				
				}
			}
			if (astNode.isAssignmentExpression(i) || exprList.length > 0) {
				if (astNode.isAssignmentExpression(i)) {
					exprList.push(ast.body[i].expression);
				}

				for (var expression of exprList){
					var var_values = astNode.getAssignmentLeftRight(expression, varMap, verbose);
					var lastAssignmentNode;
					var found = false;
					ASTUtils.traverse(expression, function(node, parent){
						if (node.type == "AssignmentExpression") lastAssignmentNode = node;
						if (node.type == "SequenceExpression" && parent !== null && parent.type == "AssignmentExpression") {
							var exprs = node.expressions;
							var codes = ASTUtils.getCode(node)
							var startIndex = 0;
							for (const exp of exprs) {
								parseProgram(ASTUtils.getCode(exp), scope, coefficient, varMap, verbose);
							}
						} else if (node.type == "ArrayExpression" && parent !== null && parent.type == "AssignmentExpression"){
							if (node.elements.length > 1000){
								if (verbose>0) console.log("FEATURE[LongArray] : " + var_values[0] + " contains " + node.elements.length + " objects");
								updateResultMap(resultMap, "LongArray", coefficient);
							}
						} else if (node.type == "ThisExpression"){
							if (verbose>0) console.log("FEATURE[VariableWithThisExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + ASTUtils.getCode(lastAssignmentNode));
							updateResultMap(resultMap, "VariableWithThisExpression", coefficient);
						} else if (node.type == "LogicalExpression" && parent !== null && parent.type == "AssignmentExpression"){
							if (verbose>0) console.log("FEATURE[VariableWithLogicalExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + ASTUtils.getCode(lastAssignmentNode));
							updateResultMap(resultMap, "VariableWithLogicalExpression", coefficient);
						} else if (node.type == "AssignmentExpression") {
							var var_value = astNode.checkStaticMemberFunctionCall(node, varMap);
							if (var_value !== undefined) {
								if (verbose>0) console.log("FEATURE[FunctionObfuscation]:" + coefficient[coefficient.length-1] + ":" + scope + ":[", var_value[0], "] -> [", var_value[1].value, "]")
								updateResultMap(resultMap, "FunctionObfuscation", coefficient);
							}
						} else if (node.type == "CallExpression" && !found){
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
								var funcNames = varMap.get(callee);
								if (funcNames !== undefined) {
									for (var func of funcNames) {
										if (func.type == "user_Function" && !fastMode){
											var returnVal;
											var args = astNode.getFunctionArguments(node, varMap);
											var rVal = parseFuncBody(astNode, func, args, funcName, scope, coefficient, varMap, verbose);
											if (rVal !== undefined) {
												var_values[1] = rVal;
												found = true;
												varMap.setVariable(funcName+"_return_"+var_values[0], rVal);
											} else {
												if (args !== undefined){
													try{
														for (var a of args){
															if (a.type == "Identifier") {
																var a_values = varMap.get(a.value);
																for (var a_value of a_values) {
																	if (a_value.type == "String") {
																		if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable]:" + coefficient[coefficient.length-1] + ":" + scope + ":"+ASTUtils.getCode(node));
																		updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
																	}
																}
															} else if (a.type == "String") {
																if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable]:" + coefficient[coefficient.length-1] + ":" + scope + ":"+ASTUtils.getCode(node));
																updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
															}
														}
													} catch(err){}
												}
											}
										} else if (func.type == "pre_Function") {
											if (verbose>0) console.log("FEATURE[PredefinedFuncCalls]:" + coefficient[coefficient.length-1] + ":" + scope + ":", ASTUtils.getCode(node));
											updateResultMap(resultMap, "PredefinedFuncCalls", coefficient);
										}
									}
								}
							}
						} else if (node.type == "FunctionExpression" && parent !== null && parent.type == "AssignmentExpression"){
							if (verbose>0) console.log("FEATURE[VariableWithFunctionExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + ASTUtils.getCode(parent));
								
							var emptyVarMap = new Functions.VariableMap(varMap._varMap);
							// assume all function parameters might be String type when parsing function body
							astNode.updateFunctionParams(i, emptyVarMap);
							
							var returnStatement = astNode.getReturnInstructions(i, emptyVarMap, ast);
							var codeBody = ASTUtils.getCode(node);
							astNode.removeJumpInstructions(i, ast);

							// parse function body
							var coef = coefficient.slice();
							coef.push("in_function");
							parseProgram(ASTUtils.getCode(node.body).slice(1,-1), codeBody, coef, emptyVarMap, verbose);
							coef.push("in_return");
							for (var returnS of returnStatement) {
								// parse return statement
								parseProgram(returnS, "ReturnStatement in " + codeBody, coef, emptyVarMap, verbose);
							}
							updateResultMap(resultMap, "VariableWithFunctionExpression", coefficient);
								
						} else if (node.type == "BinaryExpression" && parent !== null && parent.type == "AssignmentExpression") {
							var bitOperators = [">>", "<<", "|", "&", "^", ">>>", ">>=", "<<=", "|=", "&=", "^=", "~=", ">>>="];
							if (bitOperators.indexOf(node.operator) != -1) {
								if (verbose>0) console.log("FEATURE[VariableWithBitOperation]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + ASTUtils.getCode(parent));
								updateResultMap(resultMap, "VariableWithBitOperation", coefficient);
							}
						} else if (node.type == "UnaryExpression" && parent !== null && parent.type == "AssignmentExpression") {
							if (node.operator == "~") {
								if (verbose>0) console.log("FEATURE[VariableWithBitOperation]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + ASTUtils.getCode(parent));
								updateResultMap(resultMap, "VariableWithBitOperation", coefficient);
							}
						}
					});
	
					// MemberExperssion objects:
					// varMap has already been updated in getAssignmentLeftRight()
					if (var_values == "SKIP") continue;

					// Checking if MY_MJSA_THIS variable is been used on left hand side
					if (var_values[0] == "MY_MJSA_THIS") {
						var prevValue = resultMap.get("MY_MJSA_THIS");
						resultMap.set("MY_MJSA_THIS", prevValue+1);
						KEYWORD_TOTAL++;
						if (verbose>0) console.log("FEATURE[AssigningToThis]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable to 'this': " + ASTUtils.getCode(ast.body[i]));
						updateResultMap(resultMap, "AssigningToThis", coefficient);
					} 


					variableName_Types = var_values[1];
					for (var v in variableName_Types) {
						if (variableName_Types[v].type == "BinaryExpression") {
							if (verbose>0) console.log("FEATURE[VariableWithBinaryExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + var_values[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "VariableWithBinaryExpression", coefficient);
						} else if (variableName_Types[v].type == "UnaryExpression") {
							if (verbose>0) console.log("FEATURE[VariableWithUnaryExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + var_values[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "VariableWithUnaryExpression", coefficient);
						} else if (variableName_Types[v].type == "CallExpression"){
							if (verbose>0) console.log("FEATURE[VariableWithCallExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + ASTUtils.getCode(ast.body[i]));
							updateResultMap(resultMap, "VariableWithCallExpression", coefficient);
						} else if (variableName_Types[v].type == "Expression"){
							if (verbose>0) console.log("FEATURE[VariableWithExpression]:" + coefficient[coefficient.length-1] + ":" + scope + ":Assign Variable by:" + var_values[0] + " = " +variableName_Types[v].value);
							updateResultMap(resultMap, "VariableWithExpression", coefficient);
						}	
					}
					varMap.updateVariable(var_values[0], var_values[1], verbose);
				}
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
				if (astNode._node.body[i].expression.callee !== undefined) {
					funcName = astNode.getCalleeName(i, varMap);
					var callee = astNode.getVariableInitValue("", astNode._node.body[i].expression, varMap, verbose)[1];
				}

				var funcNames = varMap.get(funcName);

				for (var f in funcNames) {
					if (funcNames[f].type != "pre_Function" && funcNames[f].type != "user_Function" ) {
						continue; 
					}

					var user_defined_funName = "";

					if (funcNames[f] != undefined && funcNames[f].value != funcName && funcNames[f].type == "pre_Function"){
						user_defined_funName = funcName;
					}


					// try to execute the function call with user defined functions
					if (funcNames[f].type == "user_Function" && !fastMode){

						// console.log("==> here")
						var returnVal;
						var args = astNode.getFunctionArguments(astNode._node.body[i].expression, varMap);		

						var rVal = parseFuncBody(astNode, funcNames[f], args, funcName, scope, coefficient, varMap, verbose);
						if (rVal !== undefined) {
							var prevReturn = varMap.get(funcName+"_return");

							if (prevReturn === undefined){
								varMap.setVariable(funcName+"_return", [rVal]);
							} else {
								prevReturn.push(rVal);
								varMap.setVariable(funcName+"_return", prevReturn);
							}

							continue;
						}
					}


					if (funcNames[f].type == "pre_Function" || funcNames[f].type == "user_Function") {
						var args = astNode.getFunctionArguments(astNode._node.body[i].expression, varMap);
						// JS will ignore extra parameters, if function is defined with only one parameter
						// Attacker might add more unuse d parameters to confuse the detector
						if (args.length >= 1) {
							for (var arg of args) {
								if (arg.type == "String") {
									if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable]:" + coefficient[coefficient.length-1] + ":" + scope + ":" + funcName + "(STRING) => " + funcNames[f].value + "(" + arg.value + ")");
									updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
								} else if (arg.type == "Identifier" ||
										   arg.type == "ArrayMemberExpression" || 
										   arg.type == "FieldMemberExpression" ) {
									// pre-processing 

									if (arg.type == "ArrayMemberExpression") {
										var object  = arg.value[0];
										var indices = arg.value[1];
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
													if (obj !== undefined) {
														if (obj[0].type == "ObjectExpression") {
															objIndex = objIndex.replace(/"/g,"");
															obj = obj[0].value[objIndex];
														} else {
															obj = obj[0].value[objIndex];
														}
													}
												}
											} catch (err) {
												if (verbose>0) console.log("FEATURE[FuncCallOnUnkonwnReference]:" + coefficient[coefficient.length-1] + ":" + scope + ":" + ASTUtils.getCode(astNode._node.body[i]));
												updateResultMap(resultMap, "FuncCallOnUnkonwnReference", coefficient);
											}
											r_vs = obj;
										} else {
											r_vs = varMap.get(object);
											if (r_vs === undefined) { 
												if (verbose>0) console.log("FEATURE[FuncCallOnNonLocalArray]:" + coefficient[coefficient.length-1] + ":" + scope + ": Accessing non-local array object: " + ASTUtils.getCode(astNode._node.body[i]));
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
														try{
															ref_values = ref_values.concat(r_vs[r].value[index]);
														}catch (err) {
															if (verbose>0) console.log("FEATURE[FuncCallOnUnkonwnReference]:" + coefficient[coefficient.length-1] + ":" + scope + ":" + ASTUtils.getCode(astNode._node.body[i]));
															updateResultMap(resultMap, "FuncCallOnUnkonwnReference", coefficient);
														}
													} 
												}
											}
										}

									} else if (arg.type == "FieldMemberExpression") {
										var object = arg.value[0];
										var fields = arg.value[1];
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
															obj = obj[0].value[objIndex];
														}
													}
												}
											} catch (err) {
												if (verbose>0) console.log("FEATURE[FuncCallOnUnkonwnReference]:" + coefficient[coefficient.length-1] + ":" + scope + ":" + ASTUtils.getCode(astNode._node.body[i]));
												updateResultMap(resultMap, "FuncCallOnUnkonwnReference", coefficient);
											}
											r_vs = obj;
										} 
										var ref_values = [];
										for (var f in fields) {
											const field = fields[f];
											for (var r in r_vs){
												if (r_vs[r].type == "ObjectExpression" && field !== undefined) {
													if (r_vs[r].value[field.value] === undefined) {
														if (verbose>0) console.log("FEATURE[FuncCallOnUnkonwnReference]:" + coefficient[coefficient.length-1] + ":" + scope + ":" + ASTUtils.getCode(astNode._node.body[i]));
														updateResultMap(resultMap, "FuncCallOnUnkonwnReference", coefficient);
													} else {
														ref_values = ref_values.concat(r_vs[r].value[field.value]);
													}
												}
											}
										}
										
									} else {
										/* args[0].type == "Identifier" 
										 * we assume the parameter passed in can be type String */
										var ref_values = varMap.get(arg.value, verbose);
										if (ref_values === undefined) {
											ref_values = [ { type: 'String', value: 'UNKNOWN' } ];
										}
									}

									if (ref_values.length == 0)  {
										continue;
									}

									// ref_values are all possible values for one variable, e.g. {key:a, value:["Str1",0,"Str2"]}
									for (var ref in ref_values) {
										if (ref_values[ref] && ref_values[ref].type == "String") {
											if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable]:" + coefficient[coefficient.length-1] + ":" + scope + ":"+funcName+"(Object->STRING) => [" + arg.value + "] ==> "+funcName+"(" + ref_values[ref].value + ")");
											updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
										} else if (ref_values[ref] && ref_values[ref].type == "Expression") {
											if (verbose>0) console.log("FEATURE[FuncCallOnStringVariable]:" + coefficient[coefficient.length-1] + ":" + scope + ":"+funcName+"(Expr) => [" + arg.value + "] ==> "+funcName+"(" + ref_values[ref].value + ")");
											updateResultMap(resultMap, "FuncCallOnStringVariable", coefficient);
										}
									}							
								} else if (arg.type == "BinaryExpression") {
									if (verbose>0) console.log("FEATURE[FuncCallOnBinaryExpr]:" + coefficient[coefficient.length-1] + ":" + scope + ":"+funcName+"(" + arg.type + ") => "+funcName+"(" + arg.value + ")");
									updateResultMap(resultMap, "FuncCallOnBinaryExpr", coefficient);
								} else if (arg.type == "UnaryExpression") {
									if (verbose>0) console.log("FEATURE[FuncCallOnUnaryExpr]:" + coefficient[coefficient.length-1] + ":" + scope + ":"+funcName+"(" + arg.type + ") => "+funcName+"(" + arg.value + ")");
									updateResultMap(resultMap, "FuncCallOnUnaryExpr", coefficient);
								} else if (arg.type == "CallExpression") {
									if (verbose>0) console.log("FEATURE[FuncCallOnCallExpr]:" + coefficient[coefficient.length-1] + ":" + scope + ":"+funcName+"(" + arg.type + ") => "+ ASTUtils.getCode(astNode._node.body[i]));
									updateResultMap(resultMap, "FuncCallOnCallExpr", coefficient);
								} else { /* case for "Numeric"*/ }
							}
						}
					}
					
				}
			} 
		} else if (astNode.isFunctionDeclaration(i)) {


			// if node type is FunctionDeclaration, it must has function Name
			var funcName = astNode.getFunctionName(i);
			var funcBody = ASTUtils.getCode(ast.body[i]);
			varMap.setVariable(funcName, [{ type: 'user_Function', value: ast.body[i] }]);

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
				parseProgram(returnS, funcName, coef, emptyVarMap, verbose);
			}
		} else if (astNode.isIfElseStatement(i)) {
			astNode.removeJumpInstructions(i, ast);
			
			const branchExprs = astNode.parseIfStatement(i, varMap, verbose);
			var diffMap = new Functions.VariableMap(new HashMap());
			for (var b in branchExprs){
				var eVarMap = new Functions.VariableMap(varMap._varMap);
				var coef = coefficient.slice();
				coef.push("in_if")
				const ifbranchVarMapList = parseProgram(branchExprs[b], scope, coef, eVarMap, verbose);

				ifbranchVarMapList.forEach(function(val1) {
					// variable in @varMap
					var var_values = varMap.get(val1.key);
						// console.log(val1, var_values)
					if (var_values === undefined) {
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
				const ifbranchVarMapList = parseProgram(branchExprs[b], scope, coef, eVarMap, verbose);

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
			const subVarMapList2 = parseProgram(bodyExprs[bodyExprs.length-1], scope, coef, eVarMap, verbose);
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
			const subVarMapList = parseProgram(bodyExprs[0], scope, coef, eVarMap, verbose);
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
			parseProgram(bodyExprs[0], scope, coef, varMap, verbose);
		} else if (astNode.isTryStatement(i)) {
			astNode.removeJumpInstructions(i, ast);

			const bodyExprs = astNode.parseTryStatement(i, varMap, verbose);

			var eVarMap1 = new Functions.VariableMap(varMap._varMap);
			var eVarMap2 = new Functions.VariableMap(varMap._varMap);

			var coef = coefficient.slice();
			coef.push("in_try")
			const tryVarMapList   = parseProgram(bodyExprs[0], scope, coef, eVarMap1, verbose);
			const catchVarMapList = parseProgram(bodyExprs[1], scope, coef, eVarMap2, verbose);
			
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
				parseProgram(bodyExprs[2], scope, coef, eVarMap3, verbose);

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
				parseProgram(bodyExprs[default_case], scope, coef, varMap, false);
			}

			for (var b = 0; b < bodyExprs.length; b++){
				// skip the default case
				if (b == default_case) continue;

				var eVarMap = new Functions.VariableMap(varMap._varMap);
				const switchBranchVarMapList = parseProgram(bodyExprs[b], scope, coef, eVarMap, verbose);

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



		if (coefficient.length == 1) {
			// try to execute eval to get the hidden code if possible
			var inEval = false;
			var parentNode = astNode._node;
			var parent = astNode;
			var HiddenString = [];
			var CurrentContext = ["in_main"];
			var ContextRange = [0,0];
			ASTUtils.traverse(astNode._node.body[i], function(node){
				if ((node.range[0] > ContextRange[1]) && (CurrentContext.length > 1)){
					CurrentContext.pop();
				}
				if (node.type == "IfStatement") {
					CurrentContext.push("in_if");
					ContextRange = node.range;
				} else if (node.type == "ForStatement" || node.type == "ForInStatement" ||
						   node.type == "ForOfStatement" || node.type == "WhileStatement" ||
						   node.tpye == "DoWhileStatement") {
					CurrentContext.push("in_loop");
					ContextRange = node.range;
				} else if (node.type == "FunctionDeclaration" || node.type == "FunctionExpression"){
					CurrentContext.push("in_function");
					ContextRange = node.range;
				} else if (node.type == "TryStatement") {
					CurrentContext.push("in_try");
					ContextRange = node.range;
				} else if (node.type == "SwitchStatement") {
					CurrentContext.push("in_switch");
					ContextRange = node.range;
				}

				if (node.type == "CallExpression" && node.callee !== undefined && node.callee.type == "Identifier") {
					var calleeName = node.callee.name;
					if (calleeName != "eval") {
						var types = varMap.get(calleeName);
						if (types !== undefined) {
							for (var t of types) {
								if (t.type == "pre_Function" && t.value == "eval") {
									calleeName = "eval";
								}
							}
						}
					}

					if (calleeName == "eval") {
						var rawCodeList = [];
						try {
							eval("(" + ASTUtils.getCode(node.arguments[0]) + ")");
							HiddenString.push([CurrentContext, "(" + ASTUtils.getCode(node.arguments[0]) + ")"]);
						} catch (err) {

							if (node.arguments[0].type == "Identifier") {
								var types = varMap.get(node.arguments[0].name);

								if (types !== undefined) {
									for (var t of types) {
										if (t.value !== undefined) {
											if (t.type == "String") {
												rawCodeList.push(t.value.slice(1,-1));
											} else {
												rawCodeList.push(t.value);
											}
										}
									}
								}
							} else if (node.arguments[0].type == "CallExpression"){

								var calleeResult = parent.getVariableInitValue("", node.arguments[0], varMap, verbose)[1];

								if (calleeResult !== undefined) {

									for (var v of calleeResult) {
										if (v.type == "String"){
											rawCodeList.push(v.value);
										} else if (v.type == "CallExpression") {
											var callee;
											if (v.value.callee.type == "MemberExpression") {
												callee = v.value.callee.property.name;
											} else if (v.value.callee.type == "FunctionExpression") {
												astNode.removeJumpInstructions(i, ast);
												var coef = coefficient.slice();
												coef.push("in_function")
												var funcBody = ASTUtils.getCode(v.value);
												parseProgram(funcBody.slice(funcBody.indexOf("{"),funcBody.lastIndexOf("}")+1), "CallExpression", coef, varMap, verbose);
												callee = v.value.callee.name;
											} else {
												callee = v.value.callee.name;
											}
											if (callee !== undefined ) {

												var funcNames = varMap.get(callee);
												if (funcNames !== undefined) {
													for (var func of funcNames) {
														if (func.type == "user_Function" && !fastMode){
															var returnVal;
															var args = astNode.getFunctionArguments(v.value, varMap);
															var rVals = parseFuncBody(astNode, func, args, funcName, scope, coefficient, varMap, verbose);
															if (rVals !== undefined) {
																for (var rVal of rVals){
																	for (var v of rVal) {
																		if (v.type == "String"){
																			rawCodeList.push(v.value.slice(1,-1));
																		} else if (v.type == "Numeric") {
																			rawCodeList.push(v.value);
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}

							} else {
								var values = parent.getVariableInitValue("", node.arguments[0], varMap, verbose)[1];
								if (values !== undefined) {
									for (var v of values) {

										if (v.value !== undefined) {
											rawCodeList.push(v.value);
										}
									}
								}
							}
							if (rawCodeList.length == 0) {
								rawCodeList.push(ASTUtils.getCode(node.arguments[0]));
							}
							for (var rawCode of rawCodeList) {
								HiddenString.push([CurrentContext, rawCode]);
							}
						} // end try catch
					}
				}
			});
			hiddenStringFromEvalList = HiddenString;
			if (hiddenStringFromEvalList.length != 0) {
				inEval = true;
				for (var hiddenStringFromEval of hiddenStringFromEvalList){
					var featureContext = hiddenStringFromEval[0];
					var raw_depth = depth;
					var hidden_depth = depth+1;
					var evalBody = hiddenStringFromEval[1];

					try {
						hiddenStringFromEval[1] = eval(evalBody);
					} catch(err){
						try {
							hiddenStringFromEval[1] = eval("payload="+evalBody);
						} catch(err){}
					}

					if (verbose>0) console.log("FEATURE[UnfoldEvalSuccess]:" + featureContext[featureContext.length-1] + ": hidden codes:\n" + evalBody);
					updateResultMap(resultMap, "UnfoldEvalSuccess", featureContext);

					if (hiddenStringFromEval[1] !== undefined) {
						var hiddenLength = String(hiddenStringFromEval[1]).length;
						if (hiddenLength > 10){
							var f_Name = filePath.split("/").slice(-1)[0];
							if (!fs.existsSync('Payloads')) fs.mkdirSync('Payloads'); 
							if (!fs.existsSync('Payloads/'+raw_depth)) fs.mkdirSync('Payloads/'+raw_depth); 
							if (!fs.existsSync('Payloads/'+hidden_depth)) fs.mkdirSync('Payloads/'+hidden_depth); 
							fs.writeFileSync('Payloads/'+raw_depth+'/'+f_Name+"_"+NUMBER_OF_EVAL+".js", program, 'utf8', function (err, file) {if (err) throw err;});
							fs.writeFileSync('Payloads/'+hidden_depth+'/'+f_Name+"_"+NUMBER_OF_EVAL+".js", hiddenStringFromEval[1], 'utf8', function (err, file) {if (err) throw err;});
							NUMBER_OF_EVAL++;
						}
					}
					// Extract Payloads but not parsing them now
					if (inplaceMode !== undefined) {
						try{
							parseProgram(hiddenStringFromEval[1].slice(1,-1), "Payload", ["in_main"], varMap, verbose, hidden_depth);
						} catch(err){
							try{
								parseProgram(hiddenStringFromEval[1], "Payload", ["in_main"], varMap, verbose, hidden_depth);
							} catch(err){}
						}
					}
				}
			}
			// try to decode unescape to get the hidden code if possible
			if (!inEval) {
				var hiddenStringFromUnescapeList = astNode.checkUnescapeCalls(i,varMap);
				if (hiddenStringFromUnescapeList.length > 0) {
					for (var hiddenStringFromUnescape of hiddenStringFromUnescapeList){
						var featureContext = hiddenStringFromUnescape[1];
						if (verbose>0) console.log("FEATURE[UnfoldUnescapeSuccess]:" + featureContext[featureContext.length-1] + ":"+scope+":hidden codes:\n" + hiddenStringFromUnescape[2]);
						updateResultMap(resultMap, "UnfoldUnescapeSuccess", coefficient);
					}
				}
			}

			var stringConcat = astNode.checkStringConcatnation(i,varMap);
			if (stringConcat !== undefined && stringConcat.length > 0) {
				for (var sc of stringConcat) {
					var featureContext = sc[0];
					if (verbose>0) console.log("FEATURE[StringConcatenation]:" + featureContext[featureContext.length-1] + ":"+scope+":" +sc[1]);
					updateResultMap(resultMap, "StringConcatenation", coefficient);
				}
			}

			var DOM_WINDOW_OPs = astNode.checkDOM_WINDOW_OPs(i,varMap);
			if (DOM_WINDOW_OPs !== undefined && DOM_WINDOW_OPs.length > 0) {
				for (var d of DOM_WINDOW_OPs) {
					var type = d[0];
					var featureContext = d[1];
					if (type == "document") {
						if (verbose>0) console.log("FEATURE[DOCUMENT_Operations]:" + featureContext[featureContext.length-1] + ":"+scope+":" +d[2]);
						updateResultMap(resultMap, "DOCUMENT_Operations", coefficient);
					} else if (type == "window") {
						if (verbose>0) console.log("FEATURE[WINDOW_Operations]:" + featureContext[featureContext.length-1] + ":"+scope+":" +d[2]);
						updateResultMap(resultMap, "WINDOW_Operations", coefficient);
					}
				}
			}
		}
	}

	varMap.deleteObjects(local_variables);
	if (verbose>1 && scope == "User_Program") varMap.printMap();
	return varMap.toList();
}


//===================check input source============================
if (showHeader) {
	printHeader(resultMap)
} else if (filePath !== undefined && filePath !== null) {
	var sourcefile = fs.readFileSync(filePath, "utf8");
	var originalfile = sourcefile;
	FILE_LENGTH = sourcefile.length;
	try {
		// try to parse the program directly
		// if input file is JavaScript Codes
	    parseProgram(sourcefile, "User_Program", ["in_main"], init_varMap, verbose);
	}
	catch(err) {
		try{
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
						// scriptBlock = scriptBlock.replace(/<!--[\s\S]*?-->/g, "")
						scriptBlock = scriptBlock.replace(/-->/g, "")
						scriptBlock = scriptBlock.replace(/<!--/g, "")
					}

					scriptCodes = scriptCodes + scriptBlock;
					sourcefile = sourcefile.substring(matchLength+1, sourcefile.length);
					match = sourcefile.match('<[Ss][Cc][Rr][Ii][Pp][Tt][^>]*>(?:[^<]+|<(?!/[Ss][Cc][Rr][Ii][Pp][Tt]>))+');
				}
			} else {
				scriptCodes = sourcefile;
			}
		    parseProgram(scriptCodes, "User_Program", ["in_main"], init_varMap, verbose);
		} catch(err) {
			try{
				sourcefile = originalfile;
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
				parseProgram(scriptCodes, "User_Program", ["in_main"], init_varMap, verbose);
			} catch(err) {
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
}
	// ========================
	if (calcualteWeight && resultMap.size > 0) showResult(resultMap);
} 


process.exit(0)

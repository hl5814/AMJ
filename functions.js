const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
// *****************************
// * AST Pattern Check Functions
// *****************************
function AST(node) {
  this._node = node;
}

AST.prototype.isVariableDeclaration= function(index) {
	return  (this._node.body[index].type == "VariableDeclaration");
};

AST.prototype.isReturnStatement= function(index) {
	return  (this._node.body[index].type == "ReturnStatement");
};

AST.prototype.isFunctionDeclaration= function(index) {
	return  (this._node.body[index].type == "FunctionDeclaration");
};

AST.prototype.isExpressionStatement= function(index) {
	return  (this._node.body[index].type == "ExpressionStatement");
};

AST.prototype.isIfStatement=function(index){
	const ifExpr = new Expr(this._node.body[index]);
	return  (this._node.body[index].type == "IfStatement" && !ifExpr.hasElseExpr(this._node));
};

AST.prototype.isIfElseStatement=function(index){
	const ifExpr = new Expr(this._node.body[index]);
	return  (this._node.body[index].type == "IfStatement" && ifExpr.hasElseExpr(this._node));
};

AST.prototype.isForStatement=function(index){
	return  (this._node.body[index].type == "ForStatement");
};

AST.prototype.isForInStatement=function(index){
	return  (this._node.body[index].type == "ForInStatement" );
};

AST.prototype.isTryStatement=function(index){
	return  (this._node.body[index].type == "TryStatement");
};

AST.prototype.isWhileStatement=function(index){
	return  (this._node.body[index].type == "WhileStatement");
};

AST.prototype.isDoWhileStatement=function(index){
	return  (this._node.body[index].type == "DoWhileStatement" );
};

AST.prototype.isCallExpression= function(index) {
	return  (this._node.body[index].type == "CallExpression");
};

AST.prototype.isBlockStatement= function(index) {
	return  (this._node.body[index].type == "BlockStatement");
};

AST.prototype.hasFunctionExpression= function(index) {
	if (this._node.body[index].type == "VariableDeclaration") {
		for (var i in this.getAllDeclarationBlocks(index)){
			if (this._node.body[index].declarations[i].init === null) continue;
			if (this._node.body[index].declarations[i].init.type == "FunctionExpression") {
				return i;
			}
		}
	}	     
};

AST.prototype.getFunctionName= function(index) {
	if (this.isFunctionDeclaration(index)) {
		return  this._node.body[index].id.name;
	} else {
		var i = this.hasFunctionExpression(index);
		if (i) return this._node.body[index].declarations[i].id.name;
	}
};

AST.prototype.getAllDeclarationBlocks=function(index, verbose=false) {
	return this._node.body[index].declarations;
}

AST.prototype.parseIfStatement=function(index, varMap, verbose=false){
	const ifExpr = new Expr(this._node.body[index]);
	return ifExpr.parseIfStatementExpr(this._node, varMap, [], verbose);
}

AST.prototype.hasElse=function(index, varMap, verbose=false){
	const ifExpr = new Expr(this._node.body[index]);
	return ifExpr.hasElseExpr(this._node, varMap, [], verbose);
}

AST.prototype.parseForStatement=function(index, varMap, verbose=false){
	const forExpr = new Expr(this._node.body[index]);
	return forExpr.parseForStatementExpr(this._node, varMap, [], verbose);
}

AST.prototype.parseWhileStatement=function(index, varMap, verbose=false){
	const forExpr = new Expr(this._node.body[index]);
	return forExpr.parseWhileStatementExpr(this._node, varMap, [], verbose);
}

AST.prototype.parseTryStatement=function(index, varMap, verbose=false){
	const forExpr = new Expr(this._node.body[index]);
	return forExpr.parseTryStatementExpr(this._node, varMap, [], verbose);
}

AST.prototype.getFunctionBodyFromFunctionExpression=function(index, verbose=false){
	var blockRanges = [];
	var blocks = this.getAllDeclarationBlocks(index);
	if (blocks == undefined) {
		var currentBlock = ASTUtils.getCode(this._node.body[index].expression.right);
		return currentBlock;
	}
	for (var b in blocks){
		var currentBlock = ASTUtils.getCode(blocks[b].init.body).slice(1,-1);
		if (currentBlock != "") {
			blockRanges.push(currentBlock);
		}
	}
	return blockRanges;
}

AST.prototype.checkStaticMemberFunctionCall=function(node, varMap, verbose=false) {
	const identifier = node.left.name;
	if (node.right !== null){
		const expression = new Expr(node.right);
		const args = expression.getArg(this._node, identifier, varMap, false, verbose); 

		var var_values = varMap.get(args, verbose);
		for (var v in var_values) {
			if (var_values[v].type == "pre_Function"){
				return [identifier, var_values[v]];
			}
		}
	}
}

AST.prototype.getVariableInitValue=function(index, block, varMap, verbose=false) {

	const identifier = block.id.name;
	const expression = new Expr(block.init);
	if (block.init == null){
		return [identifier, [{ type: 'undefined', value: 'undefined' }]];
	}
	const args = expression.getArg(this._node, identifier, varMap, false, verbose); 

	if  (block.init.type == "Literal") {
		var token = (new Expr(block.init)).getToken(this._node);
		return [identifier, [{ type: token.type, value: token.value }]];
	} else if (block.init.type == "ArrayExpression"){
		return [identifier, [{ type: 'ArrayExpression', value: args }]];
	} else if (block.init.type == "NewExpression"){
		return [identifier, [{ type: 'NewExpression', value: args }]];
	} else if (block.init.type == "CallExpression"){
		return [identifier, [{ type: 'Expression', value: args }]];
	} else if (block.init.type == "FunctionExpression"){ 
		var functionName = null;
		if (block.init.id) {
			functionName= (new Expr(block.init.id)).getArg(this._node, identifier, varMap, false, verbose);
		} else {
			functionName = ASTUtils.getCode(block.init);
		}
		return [identifier, [{ type: 'FunctionExpression', value: functionName }]];
	} else {
		// check if is pre-defined functions, e.g. eval, atob, etc.
		var var_value = varMap.get(args, verbose);

		if (var_value != undefined){
			return [identifier, var_value];
		} else {
			var token = (new Expr(block.init)).getToken(this._node);

			//undefined variable, we set the init value to undefined and update varMap
			if (token.type == "Identifier" && !varMap.get(token.value, verbose)){
				varMap.setVariable(token.value, [{ type: 'undefined', value: 'undefined' }]);
				return [identifier, [{ type: 'undefined', value: 'undefined' }]];
			}
			return [identifier, [{ type: 'Expression', value: args }]];
		}
	}
}

AST.prototype.getUpdateExpression= function(index, varMap, verbose=false) {
	if (verbose>1)console.log("update Expression: e.g. ++ -- operations")
}

AST.prototype.getAssignmentLeftRight= function(index, varMap, verbose=false) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	var lhs = new Expr(expression.left);
	var identifier = lhs.getIdentifier(varMap);

	if (expression.left.type == "Identifier") {
		var lhs = expression.left;
		var varName = lhs.name;
		var rhs = expression.right;
		var binaryOPs = ["+=", "-=", "|=", "&=", "*=", "/=", "%="];
		if (binaryOPs.indexOf(expression.operator) != -1) {
			var val = (new Expr(rhs)).getArg(this._node, identifier, varMap, false, verbose);
			var lhs_type_values = varMap.get(lhs.name, verbose);

			if (lhs_type_values === undefined) {
				//update varMap if variable undefined
				varMap.setVariable(varName, [{ type: undefined, value: undefined }]);
				lhs_type_values = [{ type: undefined, value: undefined }];
			}
			var result_types = [];

			for (var i in lhs_type_values) {
				if (lhs_type_values[i].type == "String"){
					result_types.push([{ type: "String", value: "(" + lhs_type_values[i].value + expression.operator + val + ")"}]);
				} else if (rhs.type == "CallExpression"){
					result_types.push([{ type: "FunctionCall", value: "(" + lhs_type_values[i].value + expression.operator + val + ")"}]);
				} else {
					result_types.push([{ type: "Expression", value: "(" + lhs_type_values[i].value + expression.operator + val + ")"}]);
				}
			}
			return [varName, result_types];
		} else if (rhs.type == "BinaryExpression") {
			var bitOperators = [">>", "<<", "|", "&", "^", "~", ">>>"];

			var val = (new Expr(rhs)).getArg(this._node, identifier, varMap, false, verbose);

			var result_types = [];
			var token = (new Expr(rhs.left)).getToken(this._node);
			if (rhs.left.type == "Identifier") {
				var ref_values = varMap.get(rhs.left.name, verbose);
				if (ref_values) {
					for (var i in ref_values) {
						if (ref_values[i].type == "String") {
							if (val.length > 30) {
								val = val.substring(1, 30) + "...";
							}
							result_types.push([{ type: "String", value: val}]);
						} else if (bitOperators.indexOf(rhs.operator) != -1) {
							result_types.push([{ type: "BitwiseOperationExpression", value: val}]);
						} else {
							result_types.push([{ type: "Expression", value: val}]);
						}
					}
					return [varName, result_types];
				}
			} else {
				if (token.type == "String") {
					if (val.length > 30) {
						val = val.substring(1, 30) + "...";
					}
					return [varName, [{ type: "String", value: val}]];
				}
				if (bitOperators.indexOf(rhs.operator) != -1) {
					return [varName, [{ type: "BitwiseOperationExpression", value: val}]];
				}
			}
			return [varName, [{ type: "Expression", value: val}]];
		} else if (rhs.type == "CallExpression") {
			var arg = new Expr(rhs);
			var val = arg.getArg(this._node, identifier, varMap, false, verbose);
			return [varName, [{ type: "FunctionCall", value: val}]];
		} else if (rhs.type == "Identifier") {
			var ref_values = varMap.get(rhs.name, verbose);
			if (ref_values) {
				return [varName, ref_values];
			} else {
				// varMap.setVariable(token.value, [{ type: 'undefined', value: 'undefined' }]);
				return [varName, [{ type: 'undefined', value: 'undefined' }]];
			}
		} else if (rhs.type == "FunctionExpression") {
			var val = (new Expr(rhs)).getArg(this._node, identifier, varMap, false, verbose);

			var funcBody = null;
			if (rhs.id) {
				funcBody= this.getFunctionBodyFromFunctionExpression(index)
			} else {
				funcBody = ASTUtils.getCode(rhs).match(/{.*}/)[0].slice(1,-1);
			}
			return [varName, [{ type: 'FunctionExpression', value: funcBody }]];
		} else {
			var token = (new Expr(rhs)).getToken(this._node);
			return [varName, [{ type: token.type, value: token.value}]];
		}
	} else if (expression.left.type == "MemberExpression") {
		var lhs = expression.left;
		var rhs = expression.right;
		// left:
		var lhs_computed = lhs.computed;
		if (lhs.computed) {
			//ComputedMemberExpression
			var lhs_object = lhs.object.name;
			var lhs_property = new Expr(lhs.property);
			var token = (new Expr(rhs)).getToken(this._node);
			return [lhs_object+"["+lhs_property.getArg(this._node, identifier, varMap, false, verbose)+"]" , [{ type: token.type, value: token.value}]];
		} else {
			//StaticMemberExpression
			var lhs_object = lhs.object.name;
			var lhs_property = lhs.property.name;
			var token = (new Expr(rhs)).getToken(this._node);
			return [lhs_object+"."+lhs_property , [{ type: token.type, value: token.value}]];
		}
	}
};

AST.prototype.isFunction= function(funcName, index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	return (expression.type == 'CallExpression' &&  expression.callee.name == funcName);
};

AST.prototype.getCalleeName= function(index, varMap, verbose=false) {
	//assert isExpressionStatement()
	const callee_expr = new Expr(this._node.body[index].expression.callee);
	return callee_expr.getArg(this._node, "", varMap, false, verbose);
};

AST.prototype.getFunctionArguments= function(index, varMap, verbose=false) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	var args = [];
	if (expression.arguments.length > 0) {
		for (var i in expression.arguments) {
			if (expression.arguments[i].type == "BinaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				var token = (new Expr(exprArgs._expr.left)).getToken(this._node);
				if (token.type == "String") {
					args.push({type: "String", value: exprArgs.getValueFromBinaryExpression(this._node, "", varMap,false,verbose)});
				} else {
					args.push({type: "BinaryExpression", value: exprArgs.getValueFromBinaryExpression(this._node, "", varMap,false,verbose)});
				}
			} else if (expression.arguments[i].type == "UnaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "UnaryExpression", value: exprArgs.getValueFromUnaryExpression(this._node, "", varMap,false,verbose)});
			} else if (expression.arguments[i].type == "CallExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "CallExpression", value: exprArgs.getValueFromCallExpression(this._node, "", varMap,false,verbose)});
			} else if (expression.arguments[i].type == "MemberExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "MemberExpression", value: exprArgs.getValueFromMemberExpression(this._node, "", varMap, false,verbose)});
			} else {
				var token = (new Expr(expression.arguments[i])).getToken(this._node);
				args.push({ type: token.type, value: token.value});
			}
		}
		return args;
	} else {
		return []
	}
};

AST.prototype.isAssignmentExpression= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	return  (expression.type == "AssignmentExpression");
};

AST.prototype.isUpdateExpression= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	return  (expression.type == "UpdateExpression");
};


// *****************************
// * Expression Functions
// *****************************
function Expr(expr) {
  this._expr = expr;
}

Expr.prototype.getIdentifier=function(varMap, verbose=false){
	if (verbose>1) console.log("getIdentifier>>>",this._expr)
	if (this._expr.type == "Identifier") {
		return this._expr.name;
	} else if (this._expr.type == "MemberExpression") {
		var expr = new Expr(this._expr.object);
		return expr.getIdentifier(varMap);
	}
	// else if (this._expr.typer == )
}

Expr.prototype.getToken=function(node, verbose=false){
	var range = this._expr.range;
	var token = ASTUtils.getTokens(node,range[0],range[1])[0];
	return  token;
}

Expr.prototype.getArg=function(node, identifier, varMap, inner, verbose=false) {
	var arg,elem_array;
	if (this._expr.type == "Literal") {
		var token = this.getToken(node, this._expr)
		if (token.type == "String") {
			arg = "\"" + this._expr.value+"\"";
		} else {
			// if (this._expr.value === null)
				// console.log(">",this._expr,?)?·
			arg = this._expr.value;
		}
	} else if (this._expr.type == "String") {
		arg = "\"" + this._expr.value+"\"";
	}else if (this._expr.type == "Identifier") {
		arg = this._expr.name;
	} else if (this._expr.type == "BinaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromBinaryExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "UnaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromUnaryExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "CallExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromCallExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "NewExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromNewExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "ArrayExpression") {
		var expr = new Expr(this._expr);
		elem_array = expr.getValueFromArrayExpression(node, identifier, varMap, inner, verbose);
		return elem_array;
	} else if (this._expr.type == "MemberExpression") {
		var expr = new Expr(this._expr);
		elem_array = expr.getValueFromMemberExpression(node, identifier, varMap, inner, verbose);
		return elem_array;
	} 
	return arg;
}


Expr.prototype.getValueFromArrayExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	const elements = this._expr.elements;
	var elem_array = [];
	for (var e in elements) {
		var element = elements[e];
		if (element === null) continue;
		var token = (new Expr(element)).getToken(node);
		if (token.type == "String") {
			element.type = 'String';
		}
		var arg = new Expr(element);
		var val = arg.getArg(node, identifier, varMap, true, verbose);
		elem_array.push([identifier+"["+e+"]", [{ type: element.type, value: val }]]);
	}
	return elem_array;
}

Expr.prototype.getValueFromMemberExpression=function(node, identifier, varMap, inner, verbose=false) {
	var identifier = this._expr.object.name;
	if (this._expr.computed) {

		var val = this._expr.property.value;
		if (this._expr.property.type == "Identifier") {
			var ref_value = varMap.get(this._expr.property.name, verbose);
			if (ref_value) {
				val = ref_value.value;
			} else {
				val = "undefined";
			}
			
		}
		return identifier+"["+val+"]";
	} else {
		if (identifier) {
			return identifier+"."+this._expr.property.name;
		} else {
			var arg = new Expr(this._expr.object);
			var val = arg.getArg(node, identifier, varMap, true, verbose);
			return val+"."+this._expr.property.name;
		}
	}
}

Expr.prototype.parseForStatementExpr=function(node, varMap, blockRanges,verbose=false) {
	// for in statements, e.g. for(var x in list){...}

	if (this._expr.left) {
		var left = new Expr(this._expr.left);
		blockRanges.push(ASTUtils.getCode(left._expr));
	}

	// regular for statements, e.g. for(var i=0;i<5;i++){...}
	if (this._expr.init) {
		var init = new Expr(this._expr.init);
		blockRanges.push(ASTUtils.getCode(init._expr));
	}
	
	if (this._expr.body){
		var body = new Expr(this._expr.body);
		var code = ASTUtils.getCode(body._expr);
		if (code.indexOf("{") != -1) {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
	}
	return blockRanges;
}

Expr.prototype.parseWhileStatementExpr=function(node, varMap, blockRanges,verbose=false) {
	if (this._expr.body){
		var body = new Expr(this._expr.body);
		var code = ASTUtils.getCode(body._expr);
		if (code.indexOf("{") != -1) {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
	}

	return blockRanges;
}

Expr.prototype.parseTryStatementExpr=function(node, varMap, blockRanges,verbose=false) {

	if (this._expr.block){
		var block = new Expr(this._expr.block);
		var code = ASTUtils.getCode(block._expr);
		if (code.indexOf("{") != -1) {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
	}

	if (this._expr.handler){
		if (this._expr.handler.body) {
			var block = new Expr(this._expr.handler.body);
			var code = ASTUtils.getCode(block._expr);
			if (code.indexOf("{") != -1) {
				blockRanges.push(code.slice(1,-1));
			} else {
				blockRanges.push(code);
			}
		}
	}

	if (this._expr.finalizer){
		if (this._expr.finalizer) {
			var block = new Expr(this._expr.finalizer);
			var code = ASTUtils.getCode(block._expr);

			if (code.indexOf("{") != -1) {
				blockRanges.push(code.slice(1,-1));
			} else {
				blockRanges.push(code);
			}
		}
	}

	return blockRanges;
}


Expr.prototype.hasElseExpr=function(node) {
	if (this._expr.alternate && this._expr.alternate.type == "IfStatement") {
		var elseifBranch = new Expr(this._expr.alternate);
		return elseifBranch.hasElseExpr(node);
	}
	return (this._expr.alternate !== null && (this._expr.alternate.type == "BlockStatement" ||
											  this._expr.alternate.type == "ExpressionStatement"));
}

Expr.prototype.parseIfStatementExpr=function(node, varMap, blockRanges,verbose=false) {
	var ifBranch = new Expr(this._expr.consequent);
	var elseBranch = new Expr(this._expr.alternate);

	var ifBranchBlocks = ifBranch.parseIfBranches(node, varMap, [], verbose);
	for (var i = 0; i < ifBranchBlocks.length; i++){
		blockRanges.push(ifBranchBlocks[i]);
	}
	if (this._expr.alternate) {
		var elseBranchBlocks = elseBranch.parseIfBranches(node, varMap, [], verbose);
		for (var i = 0; i < elseBranchBlocks.length; i++){
			blockRanges.push(elseBranchBlocks[i]);
		}
	}
	return blockRanges;
}

Expr.prototype.parseIfBranches=function(node, varMap, blockRanges, verbose=false) {
	if (this._expr.type == "IfStatement") {
		var innerResult = this.parseIfStatementExpr(node,varMap, [], verbose);
		return blockRanges.concat.apply([], innerResult);
	} else {
		var code = ASTUtils.getCode(this._expr);
		if (code.indexOf("{") != -1) {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
		return blockRanges;
	}
}

Expr.prototype.getValueFromNewExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose>1) console.log("NewExpression:\n", this._expr, "\n")
	const callee = this._expr.callee;
	
	const elements = this._expr.arguments;
	var elem_array = [];
	for (var e in elements) {
		var element = elements[e];
		var element_expr = new Expr(element);
		var val = element_expr.getArg(node, identifier, varMap, true, verbose);
		var token = element_expr.getToken(node);
		if (token.type == "String") element.type = "String";
		//TODO check callee.name
		// elem_array.push([identifier + "_" + callee.name + "["+e+"]", { type: element.type, value: val }]);

		elem_array.push([identifier + "["+e+"]", [{ type: element.type, value: val }]]);
	}
	return elem_array;
}

Expr.prototype.getValueFromBinaryExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose>1) console.log("BinaryExpression:\n", this._expr, "\n");

	const fstExpr = new Expr(this._expr.left);
	const sndExpr = new Expr(this._expr.right);
	const fstArg = fstExpr.getArg(node, identifier, varMap, true, verbose);
	const sndArg = sndExpr.getArg(node, identifier, varMap, true, verbose);

	var expr;
	if (inner) {
		expr = "(" + fstArg + "" + this._expr.operator + "" + sndArg + ")";
	} else {
		expr = "" + fstArg + "" + this._expr.operator + "" + sndArg + "";
	}

	if (verbose>1) console.log("inner:[", inner, "]       expr:[", expr, "]");
	return expr;
}

Expr.prototype.getValueFromUnaryExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose>1) console.log("UnaryExpression:\n", this._expr.argument, "\n");

	const expression = new Expr(this._expr.argument);
	const arg = expression.getArg(node, identifier, varMap, true, verbose);

	var expr;
	if (inner) {
		expr = "(" + this._expr.operator + "" + arg + ")";
	} else {
		expr = "" + this._expr.operator + "" + arg + "";
	}

	if (verbose>1) console.log("inner:[", inner, "]       expr:[", expr, "]");
	return expr;
}

Expr.prototype.getValueFromCallExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose>1) console.log("CallExpression:\n", this._expr, "\n");

	var callee_expr = new Expr(this._expr.callee);
	const funcName = callee_expr.getArg(node, identifier, varMap, true, verbose);
	const args = this._expr.arguments;

	var argList = "";
	if (args.length > 0) {
		for (var i in args) {
			const exprArg = new Expr(args[i]);
			argList += exprArg.getArg(node, identifier, varMap, true, verbose);
		}
	}

	var expr;
	if (inner) {
		expr = "(" + funcName + "(" + argList + ")" + ")";
	} else {
		expr = "" + funcName + "(" + argList + ")" + "";
	}

	if (verbose>1) console.log("inner:[", inner, "]       expr:[", expr, "]");

	return expr;
}


// *****************************
// * Variable Value HashMap Functions
// *****************************
function VariableMap(varMap) {
	this._varMap = varMap; 
}


VariableMap.prototype.updateVariable = function(key, value, verbose=false) {
	if (value.type == "Identifier") {
		if (!this._varMap.has(value.value)) {
			this._varMap.set(key, [{ type: 'undefined', value: 'undefined' }]);
		} else {
			var ref_value = this._varMap.get(value.value)
			this._varMap.set(key, ref_value);
		}
	} else {
		this._varMap.set(key, value);
	}
   	if (verbose>1) console.log("varMap:\n", this._varMap.entries(),"\n");
}

VariableMap.prototype.setVariable = function(key, value, verbose=false) {
	if (verbose>1) console.log("setVariable>>>", value);
	if (value.type == "Identifier") {
		this._varMap.set(key, value);
	} else {
		this.updateVariable(key, value, verbose);
	}
   	if (verbose>1) console.log("varMap:\n", this._varMap.entries(),"\n");
}

VariableMap.prototype.get = function(key) {
	return this._varMap.get(key);
}

VariableMap.prototype.printMap = function() {
	this._varMap.forEach(function(value, key){
		console.log(key, ":", value);
	});
}

VariableMap.prototype.toList = function() {
	var list = [];
	this._varMap.forEach(function(value, key){
		list.push({key, value});
	});
	return list;
}

VariableMap.prototype.multipleUpdate = function(destinationVarMap) {
	this._varMap.forEach(function(value, key){
		var list = [];
		value.forEach(function(v){
			list.push(v[0]);
		});
		destinationVarMap._varMap.set(key, list);
	});
}

VariableMap.prototype.copy = function(destinationVarMap) {
	this._varMap.forEach(function(value, key){
		destinationVarMap._varMap.set(key, value);
	});
}

module.exports = {AST, Expr, VariableMap};












const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
// *****************************
// * AST Pattern Check Functions
// *****************************
function AST(node) {
  this._node = node;
}

AST.prototype.isVariableDeclaration= function(index) {
	//TODO: declarations types: 
	return  (this._node.body[index].type == "VariableDeclaration");
};

AST.prototype.isFunctionDeclaration= function(index) {
	return  (this._node.body[index].type == "FunctionDeclaration");
};

AST.prototype.isExpressionStatement= function(index) {
	return  (this._node.body[index].type == "ExpressionStatement");
};

AST.prototype.isBlockStatement= function(index) {
	return  (this._node.body[index].type == "BlockStatement");
};

AST.prototype.getFunctionName= function(index) {
	return  this._node.body[index].id.name;
};

AST.prototype.getAllDeclarationBlocks=function(index, verbose=false) {
	return this._node.body[index].declarations;
}

AST.prototype.getVariableInitValue=function(index, block, verbose=false) {
	const identifier = block.id.name;
	const expression = new Expr(block.init);
	if (block.init == null){
		return [identifier, { type: 'undefined', value: 'undefined' }];
	}
	const args = expression.getArg(this._node, identifier, false); 
	if (verbose) console.log("getVariableInitValue>>>",identifier,args, block);
	if (block.init == null){
		return [identifier, { type: 'undefined', value: 'undefined' }];
	} else if  (block.init.type == "Literal") {
		var range = block.init.range;
		var token = ASTUtils.getTokens(this._node,range[0],range[1])[0];
		return [identifier, { type: token.type, value: token.value }];
	} else if (block.init.type == "ArrayExpression"){
		return [identifier, { type: 'ArrayExpression', value: args }];
	} else if (block.init.type == "NewExpression"){
		return [identifier, { type: 'NewExpression', value: args }];
	} else {
		return [identifier, { type: 'Expression', value: args }];
	}
}

AST.prototype.getAllVariableNames= function(index, verbose=false) {
	const allDeclarations = this._node.body[index].declarations;
	var varaibleName_InitValue = [];

	for (var d in allDeclarations) {
		var declaration = allDeclarations[d];
		var initValue = declaration.init;

		if (initValue == null){
			varaibleName_InitValue.push([declaration.id.name, { type: 'undefined', value: 'undefined' }]);
		} else {
			var range = declaration.init.range;
			var token = ASTUtils.getTokens(this._node,range[0],range[1])[0];
			varaibleName_InitValue.push([declaration.id.name, { type: token.type, value: token.value }]);
		}
	}
	if (verbose) console.log(varaibleName_InitValue);
	return varaibleName_InitValue;
};

AST.prototype.isAssignmentExpression= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	return  (expression.type == "AssignmentExpression");
};

AST.prototype.getEqualAssignmentLeftRight= function(index, verbose=false) {
	//assert isExpressionStatement()
	//TODO:recursive check
	const expression = this._node.body[index].expression;
	if (expression.operator == '=') {
		if (verbose) console.log(">>> getEqualAssignmentLeftRight\n>>>",expression)
		if (expression.left.type == "Identifier") {
			var lhs = expression.left;
			var rhs = expression.right;
			if (rhs.type == "BinaryExpression") {
				//TODO:Factor out as function
				if (rhs.left.type == "Identifier" && rhs.right.type == "Literal") {
					var varName = lhs.name;
					var val = rhs.left.name + rhs.operator + rhs.right.value;
					if (val.length > 30) {
						val = val.substring(1, 30) + "...";
					}
					return [varName, { type: "String", value: val}];
				} else if (rhs.left.type == "Literal" && rhs.right.type == "Literal"){
					var varName = lhs.name;
					var val = rhs.left.value + rhs.operator + rhs.right.value;
					return [varName, { type: "Literal", value: val}];
				}
			} else {
				var varName = lhs.name;
				var range = rhs.range;
				var token = ASTUtils.getTokens(this._node,range[0],range[1])[0];
				return [varName, { type: token.type, value: token.value}];
			}
		} else if (expression.left.type == "MemberExpression") {
			var lhs = expression.left;
			var rhs = expression.right;
			// left:
			var lhs_computed = lhs.computed;
			if (lhs.computed) {
				//ComputedMemberExpression
				var lhs_object = lhs.object.name;
				var lhs_property = lhs.property.value;
				var range = rhs.range;
				var token = ASTUtils.getTokens(this._node,range[0],range[1])[0];
				return [lhs_object+"["+lhs_property+"]" , { type: token.type, value: token.value}];
			} else {
				//StaticMemberExpression
				var lhs_object = lhs.object.name;
				var lhs_property = lhs.property.name;
				var range = rhs.range;
				var token = ASTUtils.getTokens(this._node,range[0],range[1])[0];
				return [lhs_object+"."+lhs_property , { type: token.type, value: token.value}];
			}
			
		}
	}
};

AST.prototype.isFunction= function(funcName, index) {
	//assert isExpressionStatement()
	//TODO: function w/o name
	const expression = this._node.body[index].expression;
	return (expression.type == 'CallExpression' &&  expression.callee.name == funcName);
};

AST.prototype.getCalleeName= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	return expression.callee.name;
};


AST.prototype.getFunctionArguments= function(index, varMap) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	var args = [];
	if (expression.arguments.length > 0) {
		for (var i in expression.arguments) {
			if (expression.arguments[i].type == "BinaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "BinaryExpression", value: exprArgs.getValueFromBinaryExpression(this._node, "",false)});
			} else if (expression.arguments[i].type == "UnaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "UnaryExpression", value: exprArgs.getValueFromUnaryExpression(this._node, "",false)});
			} else if (expression.arguments[i].type == "CallExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "CallExpression", value: exprArgs.getValueFromCallExpression(this._node, "",false)});
			} else if (expression.arguments[i].type == "MemberExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "MemberExpression", value: exprArgs.getValueFromMemberExpression(this._node, "", varMap, false)});
			} else {
				var range = expression.arguments[i].range
				var token = ASTUtils.getTokens(this._node,range[0],range[1])[0];
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

// *****************************
// * Expression Functions
// *****************************
function Expr(expr) {
  this._expr = expr;
}

Expr.prototype.getArg=function(node, identifier, inner, verbose=false) {
	if (verbose) console.log("inner?", inner, this._expr);
	var arg,elem_array;
	if (verbose) console.log("getArg>>>",this._expr)
	if (this._expr.type == "Literal" || this._expr.type == "String") {
		arg = this._expr.value;
	} else if (this._expr.type == "Identifier") {
		arg = this._expr.name;
	} else if (this._expr.type == "BinaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromBinaryExpression(node, identifier, true);
	} else if (this._expr.type == "UnaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromUnaryExpression(node, identifier, true);
	} else if (this._expr.type == "CallExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromCallExpression(node, identifier, true);
	} else if (this._expr.type == "NewExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromNexExpression(node, identifier, true);
	} else if (this._expr.type == "ArrayExpression") {
		var expr = new Expr(this._expr);
		elem_array = expr.getValueFromArrayExpression(node, identifier, true);
		return elem_array;
	}
	return arg;
}

Expr.prototype.getValueFromArrayExpression=function(node, identifier, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("ArrayExpression:\n", this._expr, "\n")
	const elements = this._expr.elements;
	var elem_array = [];
	for (var e in elements) {
		var element = elements[e];

		var range = element.range;
		var token = ASTUtils.getTokens(node,range[0],range[1])[0];
		if (token.type == "String") {
			element.type = 'String';
		}
		var arg = new Expr(element);
		var val = arg.getArg(node, identifier, false);
		elem_array.push([identifier+"["+e+"]", { type: element.type, value: val }]);
	}
	return elem_array;
}

Expr.prototype.getValueFromMemberExpression=function(node, identifier, varMap, inner, verbose=false) {
	var identifier = this._expr.object.name;
	if (this._expr.computed) {
		//TODO: lookup a in varMap for x[a]
		var val = this._expr.property.value;
		if (this._expr.property.type == "Identifier") {
			var ref_value = varMap.get(this._expr.property.name, verbose);
			val = ref_value.value;
		}
		return identifier+"["+val+"]";
	} else {
		return identifier+"."+this._expr.property.name;
	}
	
}

Expr.prototype.getValueFromNexExpression=function(node, identifier, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("NewExpression:\n", this._expr, "\n")
	const callee = this._expr.callee;

	const elements = this._expr.arguments;
	var elem_array = [];
	for (var e in elements) {
		var element = elements[e];
		var arg = new Expr(element);
		var val = arg.getArg(node, identifier, false);
		elem_array.push([identifier + "_" + callee.name + "["+e+"]", { type: element.type, value: val }]);
	}
	return elem_array;
}

Expr.prototype.getValueFromBinaryExpression=function(node, identifier, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("BinaryExpression:\n", this._expr, "\n")

	const fstExpr = new Expr(this._expr.left);
	const sndExpr = new Expr(this._expr.right);
	const fstArg = fstExpr.getArg(node, identifier, false);
	const sndArg = sndExpr.getArg(node, identifier, false);

	var expr;
	if (inner) {
		expr = "(" + fstArg + "" + this._expr.operator + "" + sndArg + ")";
	} else {
		expr = "" + fstArg + "" + this._expr.operator + "" + sndArg + "";
	}

	if (verbose) console.log("inner:[", inner, "]       expr:[", expr, "]");
	return expr;
}

Expr.prototype.getValueFromUnaryExpression=function(node, identifier, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("UnaryExpression:\n", this._expr.argument, "\n")

	const expression = new Expr(this._expr.argument);
	const arg = expression.getArg(node, identifier, false);

	var expr;
	if (inner) {
		expr = "(" + this._expr.operator + "" + arg + ")";
	} else {
		expr = "" + this._expr.operator + "" + arg + "";
	}

	if (verbose) console.log("inner:[", inner, "]       expr:[", expr, "]");
	return expr;
}

Expr.prototype.getValueFromCallExpression=function(node, identifier, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("CallExpression:\n", this._expr, "\n")

	const funcName = this._expr.callee.name;
	const args = this._expr.arguments;
	
	var argList = "";
	if (args.length > 0) {
		for (var i in args) {
			const exprArg = new Expr(args[i]);
			argList += exprArg.getArg(node, identifier, false);
		}
	}

	var expr;
	if (inner) {
		expr = "(" + funcName + "(" + argList + ")" + ")";
	} else {
		expr = "" + funcName + "(" + argList + ")" + "";
	}

	if (verbose) console.log("inner:[", inner, "]       expr:[", expr, "]");
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
			this._varMap.set(key, { type: 'undefined', value: 'undefined' });
		} else {
			var ref_value = this._varMap.get(value.value)
			this._varMap.set(key, ref_value);
		}
	} else {
		this._varMap.set(key, value);
	}
   	if (verbose) console.log("varMap:\n", this._varMap.entries(),"\n");
}

VariableMap.prototype.setVariable = function(key, value, verbose=false) {
	if (verbose) console.log("setVariable>>>", value);
	if (value.type == "Identifier") {
		this._varMap.set(key, value);
	} else {
		this.updateVariable(key, value, verbose);
	}
   	if (verbose) console.log("varMap:\n", this._varMap.entries(),"\n");
}

VariableMap.prototype.get = function(key) {
	return this._varMap.get(key);
}

VariableMap.prototype.printMap = function() {
	this._varMap.forEach(function(value, key){
		console.log(key, ":", value);
	});
}

module.exports = {AST, Expr, VariableMap};












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

AST.prototype.getEqualAssignmentLeftRight= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	if (expression.operator == '=') {
		if (expression.left.type == "Identifier") {
			var lhs = expression.left;
			var rhs = expression.right;

			var varName = lhs.name;
			var range = rhs.range;
			var token = ASTUtils.getTokens(this._node,range[0],range[1])[0];
			return [varName, { type: token.type, value: token.value}];
		}
	}
};

AST.prototype.isFunction= function(funcName, index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	return (expression.type == 'CallExpression' &&  expression.callee.name == funcName);
};

AST.prototype.getFunctionArguments= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	var args = [];
	if (expression.arguments.length > 0) {
		for (var i in expression.arguments) {
			if (expression.arguments[i].type == "BinaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "BinaryExpression", value: exprArgs.getValueFromBinaryExpression(this._node, false)});
			} else if (expression.arguments[i].type == "UnaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "UnaryExpression", value: exprArgs.getValueFromUnaryExpression(this._node, false)});
			} else if (expression.arguments[i].type == "CallExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "CallExpression", value: exprArgs.getValueFromCallExpression(this._node, false)});
			}
			else {
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

Expr.prototype.getArg=function(node, inner, verbose=false) {
	var arg;
	if (this._expr.type == "Literal") {
		arg = this._expr.value;
	} else if (this._expr.type == "Identifier") {
		arg = this._expr.name;
	} else if (this._expr.type == "BinaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromBinaryExpression(node, true);
	} else if (this._expr.type == "UnaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromUnaryExpression(node, true);
	} else if (this._expr.type == "CallExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromCallExpression(node, true);
	}
	return arg;
}


Expr.prototype.getValueFromBinaryExpression=function(node, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("BinaryExpression:\n", this._expr, "\n")

	const fstExpr = new Expr(this._expr.left);
	const sndExpr = new Expr(this._expr.right);
	const fstArg = fstExpr.getArg(node, false);
	const sndArg = sndExpr.getArg(node, false);

	var expr;
	if (inner) {
		expr = "(" + fstArg + "" + this._expr.operator + "" + sndArg + ")";
	} else {
		expr = "" + fstArg + "" + this._expr.operator + "" + sndArg + "";
	}

	if (verbose) console.log("inner:[", inner, "]       expr:[", expr, "]");
	return expr;
}

Expr.prototype.getValueFromUnaryExpression=function(node, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("UnaryExpression:\n", this._expr.argument, "\n")

	const expression = new Expr(this._expr.argument);
	const arg = expression.getArg(node, false);

	var expr;
	if (inner) {
		expr = "(" + this._expr.operator + "" + arg + ")";
	} else {
		expr = "" + this._expr.operator + "" + arg + "";
	}

	if (verbose) console.log("inner:[", inner, "]       expr:[", expr, "]");
	return expr;
}

Expr.prototype.getValueFromCallExpression=function(node, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("CallExpression:\n", this._expr, "\n")

	const funcName = this._expr.callee.name;
	const args = this._expr.arguments;
	
	var argList = "";
	if (args.length > 0) {
		for (var i in args) {
			const exprArg = new Expr(args[i]);
			argList += exprArg.getArg(node, false);
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

VariableMap.prototype.get = function(key) {
	return this._varMap.get(key);
}

VariableMap.prototype.printMap = function() {
	this._varMap.forEach(function(value, key){
		console.log(key, ":", value);
	});
}

module.exports = {AST, Expr, VariableMap};












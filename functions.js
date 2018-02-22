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

AST.prototype.isExpressionStatement= function(index) {
	return  (this._node.body[index].type == "ExpressionStatement");
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

AST.prototype.isEval= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	return (expression.type == 'CallExpression' &&  expression.callee.name == "eval");
};

AST.prototype.getFunctionArguments= function(index) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	var args = [];
	
	if (expression.arguments.length > 0) {
		for (var i in expression.arguments) {
			// console.log(expression.arguments[i])
			// BinaryExpression
			if (expression.arguments[i].type == "BinaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "BinaryExpression", value: exprArgs.getValueFromBinaryExpression(false)});
			} else if (expression.arguments[i].type == "UnaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "UnaryExpression", value: exprArgs.getValueFromUnaryExpression(false)});
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
		//console.log(args);
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

Expr.prototype.getValueFromBinaryExpression=function(inner, verbose=false) {
	//assert isExpressionStatement()
	const expression = this._expr;
	if (verbose) console.log("BinaryExpression:\n", expression, "\n")

	var fstArg, sndArg;
	// first Arg
	if (this._expr.left.type == "Literal") {
		fstArg = this._expr.left.value;
	} else if (this._expr.left.type == "Identifier") {
		fstArg = this._expr.left.name;
	} else if (this._expr.left.type == "BinaryExpression") {
		var fstExpr = new Expr(this._expr.left);
		fstArg = fstExpr.getValueFromBinaryExpression(true);
	}
	// second Arg
	if (this._expr.right.type == "Literal") {
		sndArg = this._expr.right.value;
	} else if (this._expr.right.type == "Identifier") {
		sndArg = this._expr.right.name;
	} else if (this._expr.right.type == "BinaryExpression") {
		var sndExpr = new Expr(this._expr.right);
		sndArg = sndExpr.getValueFromBinaryExpression(true);
	}

	var expr;
	if (inner) {
		expr = "(" + fstArg + "" + this._expr.operator + "" + sndArg + ")";
	} else {
		expr = "" + fstArg + "" + this._expr.operator + "" + sndArg + "";
	}

	if (verbose) console.log("inner:[", inner, "]       expr:[", expr, "]");
	return expr;
}

Expr.prototype.getValueFromUnaryExpression=function(inner, verbose=false) {
	//assert isExpressionStatement()
	const expression = this._expr;
	if (verbose) console.log("UnaryExpression:\n", expression.argument, "\n")

	var arg;
	// Arg
	if (this._expr.argument.type == "Literal") {
		arg = this._expr.argument.value;
	} else if (this._expr.argument.type == "Identifier") {
		arg = this._expr.argument.name;
	} else if (this._expr.argument.type == "BinaryExpression") {
		var Arg = new Expr(this._expr.argument);
		arg = Arg.getValueFromBinaryExpression(true);
	} else if (this._expr.argument.type == "UnaryExpression") {
		var Arg = new Expr(this._expr.argument);
		arg = Arg.getValueFromUnaryExpression(true);
	}

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
	const expression = this._expr;
	if (verbose) console.log("CallExpression:\n", expression, "\n")

	var funcName = expression.callee.name;
	var args = expression.arguments;
	
	var argList = "";
	if (args.length > 0) {
		for (var i in args) {
			// BinaryExpression
			if (args[i].type == "BinaryExpression") {
				var exprArgs = new Expr(args[i]);
				argList += exprArgs.getValueFromBinaryExpression(false);
			} else if (args[i].type == "UnaryExpression") {
				var exprArgs = new Expr(args[i]);
				argList += exprArgs.getValueFromUnaryExpression(false);
			} else if (args[i].type == "CallExpression") {
				var exprArgs = new Expr(args[i]);
				argList += exprArgs.getValueFromCallExpression(false);
			}
			else {
				var range = args[i].range
				var token = ASTUtils.getTokens(node,range[0],range[1])[0];
				argList +=  token.value;
			}
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












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

AST.prototype.isCallExpression= function(index) {
	return  (this._node.body[index].type == "CallExpression");
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

AST.prototype.getVariableInitValue=function(index, block, varMap, verbose=false) {
	const identifier = block.id.name;
	const expression = new Expr(block.init);
	if (block.init == null){
		return [identifier, { type: 'undefined', value: 'undefined' }];
	}
	const args = expression.getArg(this._node, identifier, false, verbose); 
	if (verbose) console.log("getVariableInitValue>>>",identifier, args, block);
	if (block.init == null){
		return [identifier, { type: 'undefined', value: 'undefined' }];
	} else if  (block.init.type == "Literal") {
		var token = (new Expr(block.init)).getToken(this._node);
		return [identifier, { type: token.type, value: token.value }];
	} else if (block.init.type == "ArrayExpression"){
		return [identifier, { type: 'ArrayExpression', value: args }];
	} else if (block.init.type == "NewExpression"){
		return [identifier, { type: 'NewExpression', value: args }];
	} else if (block.init.type == "FunctionExpression"){ 
		const id = (new Expr(block.init.id)).getArg();
		return [identifier, { type: 'Function', value: id }];
	} else {
		if (verbose) console.log(">>>getVariableInitValue->Expression");
		// check if is pre-defined functions, e.g. eval, atob, etc.
		var var_value = varMap.get(args, verbose);
		if (var_value != undefined){
			return [identifier, var_value];
		} else {
			var token = (new Expr(block.init)).getToken(this._node);
			//undefined variable, we set the init value to undefined and update varMap
			if (token.type == "Identifier"){
				varMap.setVariable(token.value, { type: 'undefined', value: 'undefined' });
				return [identifier, { type: 'undefined', value: 'undefined' }];
			}
			return [identifier, { type: 'Expression', value: args }];
		}
		
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
			var token = (new Expr(declaration.init)).getToken(this._node);
			varaibleName_InitValue.push([declaration.id.name, { type: token.type, value: token.value }]);
		}
	}
	if (verbose) console.log(varaibleName_InitValue);
	return varaibleName_InitValue;
};

AST.prototype.getUpdateExpression= function(index, varMap, verbose=false) {
	if (verbose)console.log("update Expression: e.g. ++ -- operations")
	// const expression = this._node.body[index].expression;
	// var arg = new Expr(expression.argument);
	// var identifier = arg.getIdentifier(varMap);
	// var operator = expression.operator;
	// console.log(arg)
}

AST.prototype.getAssignmentLeftRight= function(index, varMap, verbose=false) {
	//assert isExpressionStatement()
	//TODO:recursive check
	const expression = this._node.body[index].expression;
	var lhs = new Expr(expression.left);
	var identifier = lhs.getIdentifier(varMap);
	//var left_expr = new Expr(expression.left.property);
	//var val = left_expr.getArg(this._node, identifier, false);
	if (verbose) console.log("identifier:", identifier);
	if (verbose) console.log(">>> getEqualAssignmentLeftRight\n>>>",expression);

	if (expression.left.type == "Identifier") {
		var lhs = expression.left;
		var varName = lhs.name;
		var rhs = expression.right;
		var binaryOPs = ["+=", "-=", "|=", "&=", "*=", "/=", "%="];
		if (binaryOPs.indexOf(expression.operator) != -1) {
			var val = (new Expr(rhs)).getArg(this._node, identifier, false);
			var lhs_type_value = varMap.get(lhs.name, verbose);
			if (lhs_type_value == undefined) {
				//update varMap if variable undefined
				varMap.setVariable(lhs.name, { type: undefined, value: undefined } );
				lhs_type_value = { type: undefined, value: undefined };
			}
			if (lhs_type_value.type == "String"){
				return [varName, { type: "String", value: "(" + lhs_type_value.value + expression.operator + val + ")"}];
			} else if (rhs.type == "CallExpression"){
				return [varName, { type: "FunctionCall", value: "(" + lhs_type_value.value + expression.operator + val + ")"}];
			}
			return [varName, { type: "Expression", value: "(" + lhs_type_value.value + expression.operator + val + ")"}];
		} else if (rhs.type == "BinaryExpression") {
			
			var arg = new Expr(rhs);
			var val = arg.getArg(this._node, identifier, false);

			var token = (new Expr(rhs.left)).getToken(this._node);
			if (rhs.left.type == "Identifier") {
				var ref_value = varMap.get(rhs.left.name, verbose);
				token.type = ref_value.type;
			}

			if (token.type == "String") {
				if (val.length > 30) {
					val = val.substring(1, 30) + "...";
				}
				return [varName, { type: "String", value: val}];
			}

			bitOperators = [">>", "<<", "|", "&", "^", "~", ">>>"];
			if (bitOperators.indexOf(rhs.operator) != -1) {
				return [varName, { type: "BitwiseOperationExpression", value: val}];
			}
			return [varName, { type: "Expression", value: val}];
		} else if (rhs.type == "CallExpression") {
			var arg = new Expr(rhs);
			var val = arg.getArg(this._node, identifier, false);
			return [varName, { type: "FunctionCall", value: val}];
		}else {
			var token = (new Expr(rhs)).getToken(this._node);
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
			var lhs_property = new Expr(lhs.property);
			var token = (new Expr(rhs)).getToken(this._node);
			return [lhs_object+"["+lhs_property.getArg(this._node, identifier, false)+"]" , { type: token.type, value: token.value}];
		} else {
			//StaticMemberExpression
			var lhs_object = lhs.object.name;
			var lhs_property = lhs.property.name;
			var token = (new Expr(rhs)).getToken(this._node);
			return [lhs_object+"."+lhs_property , { type: token.type, value: token.value}];
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
	const callee_expr = new Expr(this._node.body[index].expression.callee);
	return callee_expr.getArg(this._node, "", false);
};

AST.prototype.getFunctionArguments= function(index, varMap, verbose=false) {
	//assert isExpressionStatement()
	const expression = this._node.body[index].expression;
	var args = [];
	if (expression.arguments.length > 0) {
		for (var i in expression.arguments) {
			if (expression.arguments[i].type == "BinaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "BinaryExpression", value: exprArgs.getValueFromBinaryExpression(this._node, "",verbose)});
			} else if (expression.arguments[i].type == "UnaryExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "UnaryExpression", value: exprArgs.getValueFromUnaryExpression(this._node, "",verbose)});
			} else if (expression.arguments[i].type == "CallExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "CallExpression", value: exprArgs.getValueFromCallExpression(this._node, "",verbose)});
			} else if (expression.arguments[i].type == "MemberExpression") {
				var exprArgs = new Expr(expression.arguments[i]);
				args.push({type: "MemberExpression", value: exprArgs.getValueFromMemberExpression(this._node, "", varMap, verbose)});
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
	if (verbose) console.log("getIdentifier>>>",this._expr)
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

Expr.prototype.getArg=function(node, identifier, inner, verbose=false) {
	if (verbose) console.log("inner?", inner, this._expr);
	var arg,elem_array;
	if (verbose) console.log("getArg>>>",this._expr);
	if (this._expr.type == "Literal") {
		var token = this.getToken(node, this._expr)
		if (token.type == "String") {
			arg = "\"" + this._expr.value+"\"";
		} else {
			arg = this._expr.value;
		}
	} else if (this._expr.type == "String") {
		arg = "\"" + this._expr.value+"\"";
	}else if (this._expr.type == "Identifier") {
		arg = this._expr.name;
	} else if (this._expr.type == "BinaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromBinaryExpression(node, identifier, true);
	} else if (this._expr.type == "UnaryExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromUnaryExpression(node, identifier, true);
	} else if (this._expr.type == "CallExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromCallExpression(node, identifier, true, verbose);
	} else if (this._expr.type == "NewExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromNewExpression(node, identifier, true);
	} else if (this._expr.type == "ArrayExpression") {
		var expr = new Expr(this._expr);
		elem_array = expr.getValueFromArrayExpression(node, identifier, true);
		return elem_array;
	} else if (this._expr.type == "MemberExpression") {
		var expr = new Expr(this._expr);
		elem_array = expr.getValueFromMemberExpression(node, identifier, true);
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
		var token = (new Expr(element)).getToken(node);
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

Expr.prototype.getValueFromNewExpression=function(node, identifier, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("NewExpression:\n", this._expr, "\n")
	const callee = this._expr.callee;
	
	const elements = this._expr.arguments;
	var elem_array = [];
	for (var e in elements) {
		var element = elements[e];
		var element_expr = new Expr(element);
		var val = element_expr.getArg(node, identifier, false);
		var token = element_expr.getToken(node);
		if (token.type == "String") element.type = "String";
		//TODO check callee.name
		// elem_array.push([identifier + "_" + callee.name + "["+e+"]", { type: element.type, value: val }]);
		console.log("<",element, "<",val);
		elem_array.push([identifier + "["+e+"]", { type: element.type, value: val }]);
	}
	return elem_array;
}

Expr.prototype.getValueFromBinaryExpression=function(node, identifier, inner, verbose=false) {
	//assert isExpressionStatement()
	if (verbose) console.log("BinaryExpression:\n", this._expr, "\n");

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
	if (verbose) console.log("UnaryExpression:\n", this._expr.argument, "\n");

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
	if (verbose) console.log("CallExpression:\n", this._expr, "\n");

	var callee_expr = new Expr(this._expr.callee);

	const funcName = callee_expr.getArg(node, identifier, false);
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












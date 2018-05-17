const ASTUtils = require("esprima-ast-utils");		  // load esprima-ast-utils
const HashMap = require('hashmap');					  // load hashmap
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

AST.prototype.isForOfStatement=function(index){
	return  (this._node.body[index].type == "ForOfStatement" );
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

AST.prototype.isSwitchStatement= function(index) {
	return  (this._node.body[index].type == "SwitchStatement");
};

AST.prototype.getRangeLengthOfExpression=function(index, ast) {
	var range = ast.body[index].range;
	var tokenLength = ASTUtils.getTokens(this._node,range[0],range[1]).length;
	return tokenLength;
}

AST.prototype.removeJumpInstructions=function(index, ast) {
	ASTUtils.traverse(this._node.body[index], function(node){
		if (node.type == "BreakStatement" ||  node.type == "ContinueStatement" || node.type == "ReturnStatement")
			ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
	})
}

// elements > 1000 elements
AST.prototype.getNumberOfElementsInArrayExpression=function(index, ast) {
	var numElements = -1;
	ASTUtils.traverse(this._node.body[index], function(node){
		if (node.type == "ArrayExpression")
			numElements = node.elements.length;
	});
	return numElements;
}


AST.prototype.getReturnInstructions=function(index, varMap, ast) {
	var returnStatements = [];
	var parentNode = this._node;
	ASTUtils.traverse(this._node.body[index], function(node){
		if (node.type == "ReturnStatement" && node.argument !== null){
			if (node.argument.type == "Literal") {
				var name = node.argument;
				var token = (new Expr(name)).getToken(parentNode);
				if (token.type == "String") {
					returnStatements.push(name.raw);
				}
			} else if (node.argument.type == "CallExpression" && node.argument.callee.type == "FunctionExpression"){
				ASTUtils.traverse(node.argument.callee.body, function(node2){
					if (node2.type == "ReturnStatement")
						ASTUtils.replaceCodeRange(ast, node2.range, " ".repeat(node2.range[1]-node2.range[0]-1) + ";");
				})
				returnStatements.push(ASTUtils.getCode(node.argument.callee.body));
			} else if (node.argument.type == "ObjectExpression") {
				var field_object = ASTUtils.getCode(node.argument);
				if (field_object[0] == "{" && field_object[field_object.length-1] == "}") 
					returnStatements.push("MY_MJSA_FIELD = " + ASTUtils.getCode(node.argument));
			} else if (node.argument.type == "CallExpression" && node.argument.callee.type == "Identifier"){
				returnStatements.push(ASTUtils.getCode(node.argument));
			} else {
				// skip
				// console.log(node.argument.callee)
			}
		}
	});
	return returnStatements;
}

AST.prototype.hasFunctionExpression= function(index, ast) {
	var hasFunctionExpression = false;;
	ASTUtils.traverse(this._node.body[index], function(node){
		if (node.type == "FunctionExpression")
			hasFunctionExpression = true;
	});
	return hasFunctionExpression;    
};

AST.prototype.getFunctionName= function(index) {
	if (this.isFunctionDeclaration(index)) {
		return  this._node.body[index].id.name;
	} else {
		var name;
		ASTUtils.traverse(this._node.body[index], function(node){
			if (node.type == "VariableDeclaration"){
				var declarations = node.declarations;
				for (var d of declarations) {
					if (d.init.type == "FunctionExpression") {
						name = d.id.name;
					}
				}
			}
		});
		return name;
	}
};

AST.prototype.checkStringConcatnation=function(index, varMap, verbose=false) {
	var longString = "";
	var parentNode = this._node;
	ASTUtils.traverse(this._node.body[index], function(node){
		if (node.type == "BinaryExpression" && node.operator == "+" && longString == ""){
			var lhs = new Expr(node.left);
			var token = lhs.getToken(parentNode);
			if (node.left.type == "BinaryExpression") {
				longString = ASTUtils.getCode(node);
			}
			else if (token.type == "String") {
				longString = ASTUtils.getCode(node);
			} else if (token.type == "Identifier") {
				var types = varMap.get(token.value);
				if (types !== undefined) {
					for (var t of types) {
						if (t.type == "String") {
							var rhs = new Expr(node.right);
							var rhs_token = rhs.getToken(parentNode);
							var rhs_str = "";
							if (token.type == "Identifier") {
								var ts = varMap.get(rhs_token.value);
								if (ts !== undefined) {
									for (var tt of ts) {
										if (tt.type == "String") {
											rhs_str = tt.value;
											longString = token.value + "+" + rhs_token.value +  " ==> " + token.value + "+" + rhs_str;
											break;
										}
									}
								} else {
									longString = ASTUtils.getCode(node);
								}
							} else {
								longString = ASTUtils.getCode(node);
							}
						}
					}
				} else {
					longString = ASTUtils.getCode(node);
				}
			}
		} else if (node.type == "AssignmentExpression" && node.operator == "+=" && longString == ""){
			var lhs = new Expr(node.left)
			var token = lhs.getToken(parentNode);
			if (token.type == "String") {
				longString = ASTUtils.getCode(node);
			} else if (token.type == "Identifier") {
				var types = varMap.get(token.value);
				if (types !== undefined) {
					for (var t of types) {
						if (t.type == "String") {
							var rhs = new Expr(node.right);
							var rhs_token = rhs.getToken(parentNode);
							var rhs_str = "";
							if (token.type == "Identifier") {
								var ts = varMap.get(rhs_token.value);
								if (ts !== undefined) {
									for (var tt of ts) {
										if (tt.type == "String") {
											rhs_str = tt.value;
											longString = token.value + "+=" + rhs_token.value +  " ==> " + token.value + "+=" + rhs_str;
											break;
										}
									}
								} else {
									longString = ASTUtils.getCode(node);
								}
							} else {
								longString = ASTUtils.getCode(node);
							}
						}
					}
				} else {
					longString = ASTUtils.getCode(node);
				}
			}
		}
	});
	return longString;
}

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
	const whileExpr = new Expr(this._node.body[index]);
	return whileExpr.parseWhileStatementExpr(this._node, varMap, [], verbose);
}

AST.prototype.parseSwitchStatement=function(ast, index, varMap, verbose=false){
	const switchExpr = new Expr(this._node.body[index]);
	return switchExpr.parseSwitchStatementExpr(ast, this._node, varMap, [], verbose);
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

AST.prototype.getVariableInitValue=function(identifier, initExpr, varMap, verbose=false) {
	const expression = new Expr(initExpr);
	// console.log(initExpr)
	if (initExpr == null){
		return [identifier, [{ type: 'undefined', value: 'undefined' }]];
	}
	const args = expression.getArg(this._node, identifier, varMap, false, verbose); 
	if  (initExpr.type == "Literal") {
		var token = (new Expr(initExpr)).getToken(this._node);
		return [identifier, [{ type: token.type, value: token.value }]];
	} else if (initExpr.type == "ArrayExpression"){
		return [identifier, [{ type: 'ArrayExpression', value: args }]];
	} else if (initExpr.type == "ThisExpression"){
		return [identifier, [{ type: 'ThisExpression', value: "this" }]];
	} else if (initExpr.type == "UnaryExpression"){
		return [identifier, [{ type: 'UnaryExpression', value: args }]];
	} else if (initExpr.type == "NewExpression"){
		return [identifier, [{ type: 'NewExpression', value: args }]];
	} else if (initExpr.type == "CallExpression"){
		return [identifier, [{ type: 'CallExpression', value: args }]];
	} else if (initExpr.type == "ConditionalExpression"){
		return [identifier, args];
	} else if (initExpr.type == "SequenceExpression"){
		return [identifier, args[1]];
	} else if (initExpr.type == "FunctionExpression"){ 
		return [identifier, [{ type: 'FunctionExpression', value: ASTUtils.getCode(initExpr) }]];
	} else if (initExpr.type == "ObjectExpression") {
		return [identifier, [{type:"ObjectExpression", value:args}]];
	} else if (initExpr.type == "MemberExpression") {
		const object = (new Expr(initExpr)).getValueFromMemberExpression(this._node, identifier, varMap, false, verbose);
		const object_name = object[0];
		const field_name  = object[1];
		if (object_name == "this") {
			return [identifier, field_name];
		}
		const field = varMap.get(object_name);
		var values = [];
		try {
			if (field !== undefined) {
				for (const f of field) {
					if (f.type == "ObjectExpression") {
						for (const fn of field_name) {
							var f_name = (new Expr(fn)).getArg(this._node, identifier, varMap, false, verbose);
							if (f.value[f_name] !== undefined) values = values.concat(f.value[f_name]);
						}
					} else if (f.type == "ArrayExpression") {
						for (const fn of field_name) {
							if (fn.type == "keyword" && fn.value == "length") {
								values.concat([{ type: 'Numeric', value: f.value.length }]);
							} else {
								var f_name = (new Expr(fn)).getArg(this._node, identifier, varMap, false, verbose);
								if (f.value[f_name] !== undefined && f.value[f_name][1] !== undefined) values = values.concat(f.value[f_name][1]);
							}
						}
					}
				}
			}
		} catch(err) {
			return [identifier, [ { type: 'String', value: 'UNKNOWN' } ]]
		}
		return [identifier, values];
	} else {
		// check if is pre-defined functions, e.g. eval, atob, etc.
		var var_value = varMap.get(args, verbose);

		if (var_value != undefined){
			return [identifier, var_value];
		} else {
			var token = (new Expr(initExpr)).getToken(this._node);

			//undefined variable, we set the init value to undefined and update varMap
			if (token.type == "Identifier" && !varMap.get(token.value, verbose)){
				varMap.setVariable(token.value, [{ type: 'undefined', value: 'undefined' }]);
				return [identifier, [{ type: 'undefined', value: 'undefined' }]];
			}

			if (initExpr.type == "BinaryExpression") {
				return [identifier, [{ type: 'BinaryExpression', value: args }]];
			} else if (initExpr.type == "LogicalExpression") {
				return [identifier, [{ type: 'LogicalExpression', value: args }]];
			} else {
				return [identifier, [{ type: 'Expression', value: args }]];
			}
		}
	}
}

AST.prototype.getUpdateExpression= function(index, varMap, verbose=false) {
	if (verbose>1)console.log("update Expression: e.g. ++ -- operations")
}

AST.prototype.getAssignmentLeftRight= function(index, varMap, verbose=false) {
	//assert isExpressionStatement()

	const expression = this._node.body[index].expression;
	var lhs = expression.left;
	var rhs = expression.right;
	var identifier = (new Expr(lhs)).getIdentifier(varMap);
	var token = (new Expr(lhs)).getToken(this._node);

	if (identifier === undefined) {
		varMap.setVariable(token.value, [{ type: 'undefined', value: 'undefined' }]);
		identifier = token.value;
	}

	// pre-process if left hand side is ArrayMemberExpression
	if (expression.left.type == "MemberExpression") {
		if (lhs.computed) {
			//ComputedMemberExpression
			var lhs_object = lhs.object.name; // a
			var lhs_property = new Expr(lhs.property);

			var lhs_index = lhs_property.getPropertyValue(this._node, varMap, false, verbose);
			var token = (new Expr(rhs)).getToken(this._node);

			var var_values = varMap.get(lhs_object);
			var vals = [];
			if (var_values !== undefined && lhs_index !== undefined) {
				for (var inx of lhs_index) {
					if (inx.type == "undefined" && inx.value == "undefined") {
						vals.push(var_values);
						continue;
					}
					if (inx.type == "Numeric" || inx.type == "String") {
						var index = inx.value;
						for (var v in var_values) {
							if (var_values[v].type == "ObjectExpression") {
								index = index.replace(/['"]+/g, '');
								if (Object.keys(var_values[v].value).length > 0 && var_values[v].value[index] !== undefined) {
									var_values[v].value[index] = [{ type: token.type, value: token.value}];
									vals.push(var_values[v]);
									continue;
								}
							}
							if (var_values[v].type != "ArrayExpression" && var_values[v].type != "NewExpression") continue;
							if (var_values[v].value.length > 0 && var_values[v].value[index] !== undefined) var_values[v].value[index][1] = [{ type: token.type, value: token.value}];
							vals.push(var_values[v]);
						}
						var_values = varMap.get(lhs_object);
						
					}
				}
				return [identifier , vals];
			}
		} else {
			//StaticMemberExpression
			var lhs_object = lhs.object.name;
			var lhs_field = lhs.property.name;

			var token = (new Expr(rhs)).getToken(this._node);

			var var_values = varMap.get(lhs_object);
			if (var_values !== undefined) {
				for (var v in var_values) {
					if (var_values[v].type != "ObjectExpression") continue;
					var_values[v].value[lhs_field] = [{ type: token.type, value: token.value}];
				}
				return [identifier , var_values];
			}
		}
	}

	var binaryOPs = ["+=", "-=", "|=", "&=", "*=", "/=", "%=", ">>=", "<<=", "^=", "~=", ">>>="];
	if (binaryOPs.indexOf(expression.operator) != -1 || rhs.type == "BinaryExpression") {
		var bitOperators = [">>", "<<", "|", "&", "^", "~", ">>>",
							">>=", "<<=", "|=", "&=", "^=", "~=", ">>>="];

		var val = (new Expr(rhs)).getArg(this._node, identifier, varMap, false, verbose);
		var result_types = [];

		var token, rhs_left;

		// get the fist binary expression
		while (rhs.left !== undefined && rhs.left.type == "BinaryExpression") {
			rhs = rhs.left
		}

		if (rhs.left !== undefined) {
			token = (new Expr(rhs.left)).getToken(this._node);
			rhs_left = rhs.left;
		} else {
			token = (new Expr(lhs)).getToken(this._node);
			rhs_left = lhs;
		}

		if (rhs_left.type == "Identifier") {
			var ref_values = varMap.get(rhs_left.name, verbose);
			if (ref_values) {
				for (var i in ref_values) {

					if (ref_values[i].type == "String" && rhs.operator == "+") {
						if (val.length > 30) {
							val = val.substring(1, 30) + "...";
						}
						result_types.push({ type: "String", value: val});
					} else if (bitOperators.indexOf(rhs.operator) != -1) {
						result_types.push({ type: "BitwiseOperationExpression", value: val});
					} 
				}
				if (result_types.length >0) return [identifier, result_types];
			}
		} else if (rhs_left.type == "MemberExpression") {
			const object = (new Expr(rhs_left)).getValueFromMemberExpression(this._node, identifier, varMap, false, verbose);
			const object_name = object[0];
			const field_name  = object[1];

			const field = varMap.get(object_name);
			var values = [];
			try{
				if (field !== undefined) {
					for (const f of field) {
						if (f.type == "ObjectExpression") {
							for (const fn of field_name) {
								var f_name = (new Expr(fn)).getArg(this._node, identifier, varMap, false, verbose);
								if (f.value[f_name] !== undefined) values = values.concat(f.value[f_name]);
							}
						} else if (f.type == "ArrayExpression") {
							for (const fn of field_name) {
								var f_name = (new Expr(fn)).getArg(this._node, identifier, varMap, false, verbose);
								if (f.value[f_name] !== undefined && f.value[f_name][1] !== undefined) values = values.concat(f.value[f_name][1]);
							}
						}
					}
				}
			} catch(err) {
				values = [ { type: 'String', value: 'UNKNOWN' } ];
			}

			for (const v of values) {
				if (v.type == "String" && rhs.operator == "+") {
					return [identifier, [{ type: "String", value: val}]];
				}
			}
			return [identifier, [{ type: "MemberExpression", value: val}]];
		} else {
			if (token.type == "String" && rhs.operator == "+") {
				if (val.length > 30) {
					val = val.substring(1, 30) + "...";
				}
				return [identifier, [{ type: "String", value: val}]];
			} else if (bitOperators.indexOf(rhs.operator) != -1) {
				return [identifier, [{ type: "BitwiseOperationExpression", value: val}]];
			}
		}

		var foundStringFunc = false;
		var parentNode = this._node;
		ASTUtils.traverse(rhs, function(node){
			if (node.type == "CallExpression"){
				if (node.callee.type == "MemberExpression") {
					var callee = node.callee.property.name;
				} else {
					var callee = node.callee.name;
				}

				if (callee !== undefined ) {
					var types = varMap.get(callee);
					if (types !== undefined) {
						for (var t of types) {
							if (t.type == "pre_Function") {
								var val = t.value;
							} else {
								var val = (new Expr(node)).getArg(parentNode, identifier, varMap, false, verbose);
							}
							var stringConvertFunctions = ["toString", "fromCharCode", "btoa"];
							for (var f of stringConvertFunctions) {
								if (val.indexOf(f) !== -1) {
									foundStringFunc = true;
								}
							}
							
						}
					}
				}
			}
		});

		if (foundStringFunc) return [identifier, [{ type: "String", value: val}]];

		return [identifier, [{ type: "Expression", value: val}]];
	} else {
		return this.getVariableInitValue(identifier, rhs, varMap, verbose);
	}
};

// from static point of view, we can check for the following types as index
// i.e. treat all complicated access like a[1+1], a[foo(bar(x))] as one type
Expr.prototype.getPropertyValue=function(node, varMap, rhsExpr, verbose=false) {
	if (this._expr.type == "Literal") {
		return [{type:"Numeric", value:this._expr.value}];
	} else 
	if (this._expr.type == "Identifier") {
		var ref_values = varMap.get(this._expr.name);
		return (ref_values !== undefined)? ref_values : [{ type: 'undefined', value: 'undefined' }];
	} else 
	if (this._expr.type == "MemberExpression") {
		var object_index = this.getValueFromMemberExpression(node, "", varMap, false,verbose);
		var indices = object_index[1];
		var array_values = varMap.get(object_index[0]);
		var types = [];
		for (var i of indices){
			var inx = (new Expr(i)).getArg(node, "", varMap, true, verbose);
			for (var v of array_values) {
				if (v.type == "ArrayExpression") {
					types = types.concat(v.value[inx][1]);
				}
				if (v.type == "ObjectExpression") {
					types = types.concat(v.value[inx]);
				}
			}
		}
		if (types.length > 0) {
			return types;
		} else {
			return [{type:"undefined", value:"undefined"}];
		}
		
	}
}


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

AST.prototype.updateFunctionParams= function(index, varMap, verbose=false) {
	var thisAST = new AST(this._node);
	ASTUtils.traverse(this._node.body[index], function(node){
		if (node.type == "FunctionExpression") {
			const params = node.params;
			for (var p of params) {
				// Assume all parameters are Identifiers
				if (p.type == "Identifier"){
					var var_values = varMap.get(p.name);
					if (var_values === undefined) {
						varMap.setVariable(p.name, [{ type: 'String', value: 'STR' }]);
					} else {
						var_values.push({ type: 'String', value: 'STR' });
						varMap.setVariable(p.name, var_values)
					}
				} else if (p.type == "AssignmentPattern"){
					var var_values = varMap.get(p.left.name);
					var type = thisAST.getVariableInitValue(p.left.name, p.right, varMap, verbose);
					if (var_values === undefined) {
						varMap.setVariable(p.left.name, [{ type: 'String', value: 'STR' }, type[1][0]]);
					} else {
						var_values.push({ type: 'String', value: 'STR' });
						var_values.push(type[1][0]);
						varMap.setVariable(p.name, var_values)
					}
				} else {
					console.log(p)
					console.log("Function Declaration's Parameter not Identifier!!!!!!!!!!");
				}
				
			}
		}
	})
	
}

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
				var object_index = exprArgs.getValueFromMemberExpression(this._node, "", varMap, false,verbose);
				// console.log("object_index:", object_index)
				if (exprArgs._expr.computed) {
					args.push({type: "ArrayMemberExpression", value: object_index});
				} else {
					args.push({type: "FieldMemberExpression", value: object_index});
				}
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
			arg = this._expr.value;
		}
	} else if (this._expr.type == "String") {
		arg = "\"" + this._expr.value+"\"";
	} else if (this._expr.type == "keyword"|| this._expr.type == "Numeric") {
		arg = this._expr.value;
	} else if (this._expr.type == "Identifier") {
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
	} else if (this._expr.type == "ConditionalExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromConditionalExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "NewExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromNewExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "LogicalExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromLogicalExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "SequenceExpression") {
		var expr = new Expr(this._expr);
		arg = expr.getValueFromSequenceExpression(node, identifier, varMap, inner, verbose);
	} else if (this._expr.type == "ArrayExpression") {
		var expr = new Expr(this._expr);
		elem_array = expr.getValueFromArrayExpression(node, identifier, varMap, inner, verbose);
		return elem_array;
	} else if (this._expr.type == "MemberExpression") {
		var expr = new Expr(this._expr);
		var object_index = expr.getValueFromMemberExpression(node, identifier, varMap, inner, verbose);
		if (object_index[1][0].type == "keyword") {
			var index = object_index[1][0].value;
		} else {
			var index = object_index[1];
		}
		if (this._expr.computed) {
			return object_index[0] + "[" + index + "]";
		} else {
			return object_index[0] + "." + index;
		}
	} else if (this._expr.type == "FunctionExpression") {
		var expr = new Expr(this._expr);
		functionName = expr.getValueFromFunctionExpression(node, identifier, varMap, inner, verbose);
		return functionName;
	} else if (this._expr.type == "ObjectExpression") {
		var expr = new Expr(this._expr);
		object = expr.getValueFromObjectExpression(node, identifier, varMap, inner, verbose);
		return object;
	}
	return arg;
}

Expr.prototype.getValueFromObjectExpression=function(node, identifier, varMap, inner, verbose=false) {
	var ObjectExpression = ASTUtils.getCode(this._expr);
	var properties = this._expr.properties;
	var results = [];
	for (var p in properties) { 
		var key = (new Expr(properties[p].key)).getArg(node, identifier, varMap, false, verbose);
		var token = (new Expr(properties[p].value)).getToken(node);

		var astNode = new AST(node);
		var type1 = astNode.getVariableInitValue(identifier, properties[p].value, varMap, verbose);

		if (typeof key == "string") {
			key = key.replace(/"/g,'');
		}
		results.push([key, type1[1]]);
	}

	var object = {};
	for (var r of results) {
		// console.log(">", r)
		object[r[0]] = r[1]
	}
	return object;
}

Expr.prototype.getValueFromConditionalExpression=function(node, identifier, varMap, inner, verbose=false) {
	var expr1 = this._expr.consequent;
	var expr2 = this._expr.alternate;

	var astNode = new AST(node);
	var types = [];
	var type1 = astNode.getVariableInitValue(identifier, expr1, varMap, verbose);
	var type2 = astNode.getVariableInitValue(identifier, expr2, varMap, verbose);
	return types.concat(type1[1]).concat(type2[1]);
}

Expr.prototype.getValueFromLogicalExpression=function(node, identifier, varMap, inner, verbose=false) {
	var expressionBody = ASTUtils.getCode(this._expr);
	return expressionBody;
}

Expr.prototype.getValueFromSequenceExpression=function(node, identifier, varMap, inner, verbose=false) {
	var exprs = this._expr.expressions;
	var last_expr = exprs.slice(-1).pop();
	var astNode = new AST(node);
	if (last_expr.type == "AssignmentExpression"){
		return astNode.getVariableInitValue(identifier, last_expr.right, varMap, verbose)
	} else {
		return astNode.getVariableInitValue(identifier, last_expr, varMap, verbose)
	}
}

Expr.prototype.getValueFromFunctionExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	var functionBody = ASTUtils.getCode(this._expr);
	return functionBody;
}
Expr.prototype.getValueFromNewExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	const callee = this._expr.callee;
	
	const elements = this._expr.arguments;
	var elem_array = [];
	for (var e in elements) {
		var element = elements[e];
		if (element === null) continue;
		var element_expr = new Expr(element);
		var val = element_expr.getArg(node, identifier, varMap, true, verbose);
		var token = element_expr.getToken(node);
		if (token.type == "String") element.type = "String";
		//TODO check callee.name
		// elem_array.push([identifier + "_" + callee.name + "["+e+"]", { type: element.type, value: val }]);

		elem_array.push([e, [{ type: element.type, value: val }]]);
	}
	return elem_array;
}


Expr.prototype.getValueFromArrayExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	// only track for first 100 elements in array, prevent program hangs due to large size array
	const elements = this._expr.elements.slice(0, 100);
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
		elem_array.push([e, [{ type: element.type, value: val }]]);
	}
	return elem_array;
}

Expr.prototype.getValueFromMemberExpression=function(node, identifier, varMap, inner, verbose=false) {
	// console.log(this._expr)
	if (this._expr.object.type == "MemberExpression") {
		var val = (new Expr(this._expr.object)).getValueFromMemberExpression(node, identifier, varMap, true, verbose);
		var identifier = val;
	} else if (this._expr.object.type == "ThisExpression"){
		var identifier = "this";
	}else {
		var identifier = this._expr.object.name;
	}

	if (this._expr.computed) {
		var val = (new Expr(this._expr.property)).getArg(node, identifier, varMap, true, verbose);
		if (this._expr.property.type == "Identifier") {
			var index_val = varMap.get(val);

			if (index_val !== undefined) {
				if (index_val.length == 0) {
					val = [{type:"String",value:'UNKONWN'}];
				} else {
					val = index_val
				}
			} else {
				val = [ {type : "keyword", value: val}];
			}
		} else if (this._expr.property.type == "Literal") {
			val = [ {type : "Numeric", value: this._expr.property.value}]
		} else if (this._expr.property.type == "MemberExpression") {
			val = (new Expr(this._expr.property)).getValueFromMemberExpression(node, identifier, varMap, true, verbose);
			var obj = val[0];
			var inx = val[1];
			var types = [];
			if (this._expr.property.computed) {
				if (inx !== undefined) {
					for (var i of inx) {
						var index = (new Expr(i)).getArg(node, identifier, varMap, true, verbose);
						var vs = varMap.get(obj);
						if (vs !== undefined) {
							for (var v of vs) {
								if (v.value[index] !== undefined && v.value[index][1] !== undefined) {
									types = types.concat(v.value[index][1]);
								}		
											
							}
							
						}
					}
				}
			} else {
				if (inx !== undefined) {
					for (var i of inx) {
						var index = (new Expr(i)).getArg(node, identifier, varMap, true, verbose);
						var vs = varMap.get(obj);
						if (vs !== undefined) {
							for (var v of vs) {
								if (v.value[index] !== undefined){
									types = types.concat(v.value[index]);
								}
							}
							
						}
					}
				}
			}
			if (types.length > 0) {
				return [identifier, types];
			}
		} else {
			val = [ {type : "UNKONWN", value: this._expr.property.type}]
		}

		return [identifier, val];
	} else {
		if (identifier) {
			if (identifier == "this") {
				return [identifier, [{type: "ThisExpression", value: ASTUtils.getCode(this._expr)}]];
			} else {
				return [identifier, [{type: "keyword", value:this._expr.property.name}]];
			}
		} else {
			var arg = new Expr(this._expr.object);
			var val = arg.getArg(node, identifier, varMap, true, verbose);
			return [val, [{type: "keyword", value:this._expr.property.name}]];
		}
	}
}

Expr.prototype.parseForStatementExpr=function(node, varMap, blockRanges,verbose=false) {
	// for in statements, e.g. for(var x in list){...}
	if (this._expr.type == "ForOfStatement") {
		var leftVar;
		var leftValue = [];
		if (this._expr.left.type == "Identifier") {
			leftVar = this._expr.left.name;
		} else if (this._expr.left.type == "VariableDeclaration") {
			leftVar = this._expr.left.declarations[0].id.name;
		}

		if (leftVar !== undefined) {
			var right = this._expr.right;
			var astNode = new AST(node);
			var rhs = astNode.getVariableInitValue("", right, varMap, verbose)[1];
			for (var t of rhs) {
				if (t.type == "ArrayExpression") {
					var arrayElements = t.value;
					var possibleValues = [];
					for (var e of arrayElements){
						possibleValues = possibleValues.concat(e[1]);
					}
					leftValue = leftValue.concat(possibleValues);
					varMap.setVariable(leftVar, leftValue);
				}
			}
		}
	} else if (this._expr.type == "ForInStatement") {
		var leftVar;
		if (this._expr.left.type == "Identifier") {
			leftVar = this._expr.left.name;
		} else if (this._expr.left.type == "VariableDeclaration") {
			leftVar = this._expr.left.declarations[0].id.name;
		}
		if (leftVar !== undefined) {
			varMap.setVariable(leftVar, [ { type: 'Numeric', value: '0' } ]);
		}

	} else {
		if (this._expr.left) {
			var left = new Expr(this._expr.left);
			blockRanges.push(ASTUtils.getCode(left._expr));
		}
	}

	// regular for statements, e.g. for(var i=0;i<5;i++){...}
	if (this._expr.init) {
		var init = new Expr(this._expr.init);
		blockRanges.push(ASTUtils.getCode(init._expr));
	}
	
	if (this._expr.body){
		var body = new Expr(this._expr.body);
		var code = ASTUtils.getCode(body._expr);
		if (this._expr.body.type == "BlockStatement") {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
	}

	return blockRanges;
}

Expr.prototype.parseSwitchStatementExpr=function(ast, node, varMap, blockRanges, verbose=false) {
	// console.log(this._expr)
	var discriminant = this._expr.discriminant;
	var d_code = ASTUtils.getCode(discriminant);
	blockRanges.push(d_code);

	var cases = this._expr.cases;
	var code = "";

	var default_case = -1;
	for (var c = 0; c<cases.length;c++) {
		// default case
		if (cases[c].test === null) {
			default_case = c+1;
		}

		var case_body = cases[c].consequent;
		var hasBreak = false;
		ASTUtils.traverse(cases[c], function(node){
			if (node.type == "BreakStatement") {
				ASTUtils.replaceCodeRange(ast, node.range, " ".repeat(node.range[1]-node.range[0]-1) + ";");
				hasBreak = true;
			}
		});

		for (var b of case_body) {
			var b_code = ASTUtils.getCode(b);
			code += b_code;
		}
		if (hasBreak || (c == cases.length-1)) {
			blockRanges.push(code);
			code = "";
		}
	}
	return [blockRanges, default_case];
}

Expr.prototype.parseWhileStatementExpr=function(node, varMap, blockRanges, verbose=false) {
	if (this._expr.body){
		var body = new Expr(this._expr.body);
		var code = ASTUtils.getCode(body._expr);
		if (this._expr.body.type == "BlockStatement") {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
	}

	return blockRanges;
}

Expr.prototype.parseTryStatementExpr=function(node, varMap, blockRanges, verbose=false) {
	if (this._expr.block){
		var block = new Expr(this._expr.block);
		var code = ASTUtils.getCode(block._expr);
		if (this._expr.block.type == "BlockStatement") {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
	}

	if (this._expr.handler){
		if (this._expr.handler.body) {
			var block = new Expr(this._expr.handler.body);
			var code = ASTUtils.getCode(block._expr);
			if (this._expr.handler.body.type == "BlockStatement") {
				blockRanges.push(code.slice(1,-1));
			} else {
				blockRanges.push(code);
			}
		}
	}

	if (this._expr.finalizer) {
		var block = new Expr(this._expr.finalizer);
		var code = ASTUtils.getCode(block._expr);

		if (this._expr.finalizer.type == "BlockStatement") {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
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
		if (this._expr.type == "BlockStatement") {
			blockRanges.push(code.slice(1,-1));
		} else {
			blockRanges.push(code);
		}
		return blockRanges;
	}
}



Expr.prototype.getValueFromBinaryExpression=function(node, identifier, varMap, inner, verbose=false) {
	//assert isExpressionStatement()
	

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

	var argList = [];
	if (args.length > 0) {
		for (var i in args) {
			const exprArg = new Expr(args[i]);
			argList.push(exprArg.getArg(node, identifier, varMap, true, verbose));
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
	var vMap = new HashMap();
	varMap.forEach(function(value, key){
		var vals = [];
		for (var v in value) {
			if (value[v].type == "ObjectExpression") {
				var newObject = {};
				for (const [key, val] of Object.entries(value[v].value)) {
				  	newObject[key] = val;
				}
				vals.push({type:"ObjectExpression", value:newObject});
				continue;
			} else if (value[v].type == "ArrayExpression" || value[v].type == "NewExpression") {
				var newList = [];
				for (const l of value[v].value) {
					var index = l[0];
					var values = l[1];
					newList.push([index, values]);
				}
				vals.push({type:"ArrayExpression", value:newList});
				continue;
			}
			vals.push(value[v])
		}
		vMap.set(key, vals);
	});
	this._varMap = vMap;
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

VariableMap.prototype.copyTo = function(destinationVarMap) {
	this._varMap.forEach(function(value, key){
		destinationVarMap._varMap.set(key, value);
	});
}

module.exports = {AST, Expr, VariableMap};












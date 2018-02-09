// *****************************
// * Token Pattern Check Functions
// *****************************
function Tokens(tokens) {
  this._tokens = tokens;
}

Tokens.prototype.isAssignment = function() {
	if (this._tokens.length < 2) return false;
	return  (this._tokens[0].type == "Identifier"
	      && this._tokens[1].type == "Punctuator"
	      && this._tokens[1].value == "=");
};

Tokens.prototype.isObjAssignment = function() {
	if (this._tokens.length < 3) return false;
	return (this._tokens[0].type == "Identifier"
		 && this._tokens[1].type == "Punctuator"
		 && this._tokens[2].type == "Identifier"
		 && this._tokens[1].value == "=");
}

Tokens.prototype.isEval = function() {
	if (this._tokens.length < 4) return false;
	return (this._tokens[0].type == "Identifier"
		 && this._tokens[0].value == "eval"
		 && this._tokens[1].type == "Punctuator"
		 && this._tokens[1].value == "("
		 && (this._tokens[2].type == "Identifier"
		  || this._tokens[2].type == "String")
		 && this._tokens[3].type == "Punctuator"
		 && this._tokens[3].value == ")");
}

// *****************************
// * Variable Value HashMap Functions
// *****************************
function VariableMap(varMap) {
	this._varMap = varMap; 
}

// update variable chain hashmap
VariableMap.prototype.updateValueVarMap = function(key, value, verbose=false) {
   	this._varMap.set(key, value);
   	if (verbose) console.log("varMap:\n", this._varMap.entries(),"\n");
}


// update variable chain hashmap
VariableMap.prototype.updateObjVarMap = function(key, type_value, verbose=false) {
	if (!this._varMap.has(type_value.value)){
		this._varMap.set(key, {type:"undefined",value:"undefined"});
	} else {
		var old_val = this._varMap.get(type_value.value); 
		this._varMap.set(key, old_val);   
	}
   	if (verbose) console.log("varMap:\n", this._varMap.entries(),"\n");
}

VariableMap.prototype.get = function(key) {
	return this._varMap.get(key);
}

module.exports = {Tokens, VariableMap};












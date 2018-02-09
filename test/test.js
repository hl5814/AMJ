// unit tests for functions.js
var HashMap = require('hashmap');
var chai = require('chai');
var expect = chai.expect; // using the "expect" style of Chai
var Functions = require('../functions');

// *****************************
// * Token Pattern Check Functions
// *****************************
describe('Assign_Tokens', function() {
    const empty_tokens = new Functions.Tokens([]);
    const obj_assign_tokens = new Functions.Tokens([{type: "Identifier",value: "a"},
                                                   {type: "Punctuator",value: "="},
                                                   {type: "Identifier",value: "b"}]);
    const str_assign_tokens = new Functions.Tokens([{type: "Identifier",value: "a"},
                                                    {type: "Punctuator",value: "="},
                                                    {type: "String",value: "xxx"}]);
    const seq_tokens = new Functions.Tokens([{type: "Identifier",value: "a"},
                                             {type: "Punctuator",value: ";"},
                                             {type: "Identifier",value: "b"}]);

    it(`isAssignment() should return ture iff tokens are any assignment {Identifier Punctuator[=]}`, function() {
        expect(empty_tokens.isAssignment()).to.equal(false);
        expect(obj_assign_tokens.isAssignment()).to.equal(true);
        expect(str_assign_tokens.isAssignment()).to.equal(true);
        expect(seq_tokens.isAssignment()).to.equal(false);
    });

    it(`isObjAssignment() should return ture iff tokens are object assignment {Identifier Punctuator[=] Identifier}`, function() {
        expect(empty_tokens.isObjAssignment()).to.equal(false);
        expect(obj_assign_tokens.isObjAssignment()).to.equal(true);
        expect(str_assign_tokens.isObjAssignment()).to.equal(false);
    });
});

describe('Eval_Tokens', function() {
    it(`isEval() should return ture iff tokens are {Identifier[eval] Punctuator['('] Identifier Punctuator[')']}`, function() {
        const eval_str_tokens = new Functions.Tokens([{type: "Identifier",value: "eval"},
            					 			          {type: "Punctuator",value: "("},
            					 			          {type: "String",value: "xxx"},
            					 			          {type: "Punctuator",value: ")"}]);
        const eval_list_tokens = new Functions.Tokens([{type: "Identifier",value: "eval"},
            					 			           {type: "Punctuator",value: "["},
            					 			           {type: "String",value: "xxx"},
        						 			           {type: "Punctuator",value: "]"}]);
        expect(eval_str_tokens.isEval()).to.equal(true);
        expect(eval_list_tokens.isEval()).to.equal(false);
    });
});

// *****************************
// * Variable Value HashMap Functions
// *****************************
describe('VariableMap', function() {
    var varMap = new Functions.VariableMap(new HashMap());

    const str_valueA = {type: "String", value: "alert(a)" };
    const str_valueB = {type: "String", value: "alert(b)" };
    const undefined_value = {type:"undefined", value:"undefined"};
    const objectB = {type: "Identifier", value: "b" };

    it(`get() should return undefined if key doens't exist in the hashmap`, function() {
        expect(varMap.get("a", objectB)).to.equal(undefined);
    });

    it(`updateValueVarMap() should store the (key,value) in to the hash map if key is fresh, override if key exists`, function() {
    	varMap.updateValueVarMap("a", str_valueA)
        expect(varMap._varMap.get("a")).to.deep.equal(str_valueA);

        varMap.updateValueVarMap("a", str_valueB)
        expect(varMap._varMap.get("a")).to.deep.equal(str_valueB);
    });

    it(`updateObjVarMap() should store the (key, {type:"undefined",value:"undefined"}) if the object on RHS doesn't exist in the varMap`, function() {
        varMap.updateObjVarMap("a", objectB)
        expect(varMap._varMap.get("a")).to.deep.equal(undefined_value);
    });

    it(`updateObjVarMap() should store the (key, {type:"undefined",value:"undefined"}) if the object on RHS doesn't exist in the varMap`, function() {
        varMap.updateValueVarMap("b", str_valueB)
        varMap.updateObjVarMap("a", objectB)
        expect(varMap._varMap.get("a")).to.deep.equal(str_valueB);
    });
});










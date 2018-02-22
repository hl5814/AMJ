// unit tests for functions.js
const HashMap = require('hashmap');
const ASTUtils = require("esprima-ast-utils");        // load esprima-ast-utils
const chai = require('chai');
const expect = chai.expect; // using the "expect" style of Chai
const Functions = require('../functions');

// *****************************
// * AST Pattern Check Functions
// *****************************
describe('AST Block Type', function() {
    it(`isVariableDeclaration()`, function() {
        const program = `var a = 1;
                         var a,b = "test";
                         var a = eval();
                         b = 1 + 2`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.isVariableDeclaration(0)).to.equal(true);
        expect(block.isVariableDeclaration(1)).to.equal(true);
        expect(block.isVariableDeclaration(2)).to.equal(true);
        expect(block.isVariableDeclaration(3)).to.equal(false);
    });

    it(`isFunctionDeclaration()`, function() {
        const program = `function foo(){
                             var a = "alert(a)";
                             return a;
                          }`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.isFunctionDeclaration(0)).to.equal(true);
    });

    it(`isBlockStatement()`, function() {
        const program = `{
                            var a = "alert(a)";
                          }`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.isBlockStatement(0)).to.equal(true);
    });

    it(`isExpressionStatement()`, function() {
        const program = `eval("myString");
                         a = unescape();
                         var a,b = "test";
                         b = 1 + 2`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.isExpressionStatement(0)).to.equal(true);
        expect(block.isExpressionStatement(1)).to.equal(true);
        expect(block.isExpressionStatement(2)).to.equal(false);
        expect(block.isExpressionStatement(3)).to.equal(true);
    });
});

describe('AST VariableDeclaration', function() {
    it(`getAllVariableNames()`, function() {
        const program = `var a = 1;
                         var a,b = "test";
                         var c = a;`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getAllVariableNames(0)).to.deep.equal([["a", {type: "Numeric",value: "1"}]]);
        expect(block.getAllVariableNames(1)).to.deep.equal([["a", {type: "undefined",value: "undefined"}],
                                                            ["b", {type: "String",value: `"test"`}]]);
        expect(block.getAllVariableNames(2)).to.deep.equal([["c", {type: "Identifier",value: "a"}]]);

    });
});



describe('AST AssignmentExpression', function() {

    const program = `a = 1;
                     b = a`;
        const block = new Functions.AST(ASTUtils.parse(program));

    it(`isAssignmentExpression()`, function() {
        expect(block.isAssignmentExpression(0)).to.equal(true);
        expect(block.isAssignmentExpression(1)).to.equal(true);

    });

    it(`getEqualAssignmentLeftRight()`, function() {
        expect(block.getEqualAssignmentLeftRight(0)).to.deep.equal(["a", {type: 'Numeric', value: "1" }]);
        expect(block.getEqualAssignmentLeftRight(1)).to.deep.equal(["b", {type: 'Identifier', value: 'a' }]);

    });
});




describe('Get Function Arguments', function() {
    it(`isFunction()`, function() {
        const program = `eval();eval(a);
                         eval("test")`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.isFunction("eval", 0)).to.deep.equal(true);
        expect(block.isFunction("eval", 1)).to.deep.equal(true);
        expect(block.isFunction("eval", 2)).to.deep.equal(true);
    });

    it(`getFunctionName()`, function() {
        const program = `function foo(){
                             var a = "alert(a)";
                             return a;
                          }`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getFunctionName(0)).to.deep.equal("foo");
    });

    it(`getFunctionArguments() for empty/single argument`, function() {
        const program = `eval();eval(a);
                         eval("test")`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getFunctionArguments(0)).to.deep.equal([]);
        expect(block.getFunctionArguments(1)).to.deep.equal([{type: 'Identifier', value: 'a' }]);
        expect(block.getFunctionArguments(2)).to.deep.equal([{type: 'String', value: '"test"' }]);
    });

    it(`getFunctionArguments() for multiple arguments`, function() {
        const program = `eval(1,2);eval(a,b);
                         eval("test1", "test2")`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getFunctionArguments(0)).to.deep.equal([{type: 'Numeric', value: '1'},
                                                             {type: 'Numeric', value: '2'}]);

        expect(block.getFunctionArguments(1)).to.deep.equal([{type: 'Identifier', value: 'a' },
                                                             {type: 'Identifier', value: 'b' }]);
        expect(block.getFunctionArguments(2)).to.deep.equal([{type: 'String', value: '"test1"' },
                                                             {type: 'String', value: '"test2"' }]);
    });

    it(`getFunctionArguments() for BinaryExpression arguments`, function() {
        const program = `eval(1+1);
                         eval(1+a+"test");
                         eval(1+a,"test"-a-1)`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getFunctionArguments(0)).to.deep.equal([{type: 'BinaryExpression', value: '1+1'}]);
        expect(block.getFunctionArguments(1)).to.deep.equal([{type: 'BinaryExpression', value: '(1+a)+test'}]);
        expect(block.getFunctionArguments(2)).to.deep.equal([{type: 'BinaryExpression', value: '1+a'},
                                                             {type: 'BinaryExpression', value: '(test-a)-1'}]);
    });

    it(`getFunctionArguments() for UnaryExpression arguments`, function() {
        const program = `eval(-a);
                         eval(-(-a));
                         eval(-(1+a))`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getFunctionArguments(0)).to.deep.equal([{type: 'UnaryExpression', value: '-a'}]);
        expect(block.getFunctionArguments(1)).to.deep.equal([{type: 'UnaryExpression', value: '-(-a)'}]);
        expect(block.getFunctionArguments(2)).to.deep.equal([{type: 'UnaryExpression', value: '-(1+a)'}]);
    });
    
    it(`getFunctionArguments() for FunctionCall arguments`, function() {
        const program = `eval(foo(a));
                         eval();
                         eval(eval(eval(a)));
                         eval(foo(1+bar(a)))`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getFunctionArguments(0)).to.deep.equal([{type: 'CallExpression', value: 'foo(a)'}]);
        expect(block.getFunctionArguments(1)).to.deep.equal([]);
        expect(block.getFunctionArguments(2)).to.deep.equal([{type: 'CallExpression', value: 'eval((eval(a)))'}]);
        expect(block.getFunctionArguments(3)).to.deep.equal([{type: 'CallExpression', value: 'foo((1+(bar(a))))'}]);
    });
});


// *****************************
// * Variable Value HashMap Functions
// *****************************
describe('VariableMap', function() {
    //TODO:updateVariable
});







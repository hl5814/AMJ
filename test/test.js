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

    it(`isCallExpression()`, function() {
        const program = `eval("myString");
                         unescape("a");
                         fromCharCode(1)`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.isExpressionStatement(0)).to.equal(true);
        expect(block.isExpressionStatement(1)).to.equal(true);
        expect(block.isExpressionStatement(2)).to.equal(true);
    });

    it(`isBlockStatement()`, function() {
        const program = `{
                            var a = "alert(a)";
                         }`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.isBlockStatement(0)).to.equal(true);
    });

});

describe('AST getVariableInitValue', function() {
    it(`getVariableInitValue()`, function() {
        const program = `var a = 1,
                         b = "test",
                         c = 1+1+1,
                         d = '1' + 'STR',
                         e=a+1,
                         f,
                         g='g',
                         h=[1,2],
                         i=new Array(1),
                         j=eval("test"),
                         k=function(){var a=1;},
                         l=function a (){var a=1;},
                         m=eval,
                         n=N;`;
        const varMap = new Functions.VariableMap(new HashMap());
        const astNode = new Functions.AST(ASTUtils.parse(program));
        const declaration_blocks = astNode.getAllDeclarationBlocks(0);

        expect(astNode.getVariableInitValue(declaration_blocks[0].id.name,declaration_blocks[0].init, varMap)).to.deep.equal(["a", [{type: "Numeric",value: "1"}]]);
        varMap.setVariable("a", [{type: 'Numeric', value: "1" }] );

        expect(astNode.getVariableInitValue(declaration_blocks[1].id.name, declaration_blocks[1].init, varMap)).to.deep.equal(["b", [{type: "String",value: '"test"'}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[2].id.name, declaration_blocks[2].init, varMap)).to.deep.equal(["c", [{type: "BinaryExpression",value: "(1+1)+1"}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[3].id.name, declaration_blocks[3].init, varMap)).to.deep.equal(["d", [{type: "String",value: "\"1STR\""}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[4].id.name, declaration_blocks[4].init, varMap)).to.deep.equal(["e", [{type: "BinaryExpression",value: "a+1"}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[5].id.name, declaration_blocks[5].init, varMap)).to.deep.equal(["f", [{type: "undefined",value: "undefined"}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[6].id.name, declaration_blocks[6].init, varMap)).to.deep.equal(["g", [{type: "String",value: "\'g\'"}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[7].id.name, declaration_blocks[7].init, varMap)).to.deep.equal(
            ["h", [ {type: "ArrayExpression",
                    value: 
                        [
                            ["0", [{ "type": "Literal", "value": 1}] ],
                            ["1", [{"type" : "Literal", "value": 2}] ] 
                        ]}
                   ]
            ]);
        expect(astNode.getVariableInitValue(declaration_blocks[8].id.name, declaration_blocks[8].init, varMap)).to.deep.equal(
            ["i", [ {type: "NewExpression",
                    value: 
                        [
                            ["0", [{ "type": "Literal", "value": 1}] ]
                        ]}
                   ]
            ]);
        expect(astNode.getVariableInitValue(declaration_blocks[9].id.name, declaration_blocks[9].init, varMap)).to.deep.equal(["j", [{type: "CallExpression",value: "eval(\"test\")"}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[10].id.name, declaration_blocks[10].init, varMap)).to.deep.equal(["k", [{type: "FunctionExpression",value: "function(){var a=1;}"}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[11].id.name, declaration_blocks[11].init, varMap)).to.deep.equal(["l", [{type: "FunctionExpression",value: "function a (){var a=1;}"}]]);
    
        varMap.setVariable("eval", [{ type: 'pre_Function', value: "eval" }] );

        expect(astNode.getVariableInitValue(declaration_blocks[12].id.name, declaration_blocks[12].init, varMap)).to.deep.equal(["m", [{type: "pre_Function",value: "eval"}]]);
        expect(astNode.getVariableInitValue(declaration_blocks[13].id.name, declaration_blocks[13].init, varMap)).to.deep.equal(["n", [{type: "undefined",value: "undefined"}]]);
    });
});


describe('AST IfStatements', function() {
    const program = `if (1>2) {}
                     if (1>2) {} else {}
                     if (1>2) {i=1} else if (3>2){i=2} else {i=3}`;
    const block = new Functions.AST(ASTUtils.parse(program));

    it(`isIfStatement()`, function() {
        expect(block.isIfStatement(0)).to.equal(true);
        expect(block.isIfElseStatement(1)).to.equal(true);
        expect(block.isIfElseStatement(2)).to.equal(true);
    });

    it(`parseIfStatement() && parseIfStatementExpr`, function() {
        const astNode = new Functions.AST(ASTUtils.parse(program));
        const varMap = new Functions.VariableMap(new HashMap());
        const branchExprs = astNode.parseIfStatement(2, varMap);
        expect(branchExprs).to.deep.equal([ 'i=1', 'i=2', 'i=3' ]);
    });
});

describe('AST ForStatements', function() {
    const program = `for(i = 0;i<5;i++){j=6}
                     var x = [1,2,3];
                     for(var i in x){j=6}`;
    const block = new Functions.AST(ASTUtils.parse(program));

    it(`isForStatement()`, function() {
        expect(block.isForStatement(0)).to.equal(true);
        expect(block.isForInStatement(2)).to.equal(true);
    });

    const astNode = new Functions.AST(ASTUtils.parse(program));
    const varMap = new Functions.VariableMap(new HashMap());

    it(`parseForStatement() && parseForStatementExpr`, function() {
        const bodyExprs = astNode.parseForStatement(0, varMap);
        expect(bodyExprs).to.deep.equal([ 'i = 0', 'j=6' ]);
    });

    it(`parseForStatement() && parseForStatementExpr`, function() {
        const bodyExprs = astNode.parseForStatement(2, varMap);
        expect(bodyExprs).to.deep.equal([ 'j=6' ]);
    });
});

describe('AST WhileStatements', function() {
    const program = `while(i<5){i++}
                     do {i++} while(i<5)`;
    const block = new Functions.AST(ASTUtils.parse(program));

    it(`isWhileStatement()`, function() {
        expect(block.isWhileStatement(0)).to.equal(true);
        expect(block.isDoWhileStatement(1)).to.equal(true);
    });

    const astNode = new Functions.AST(ASTUtils.parse(program));
    const varMap = new Functions.VariableMap(new HashMap());

    it(`parseWhileStatement() && parseWhileStatementExpr`, function() {
        const bodyExprs = astNode.parseWhileStatement(0, varMap);
        expect(bodyExprs).to.deep.equal([ 'i++' ]);
    });

    it(`parseWhileStatement() && parseWhileStatementExpr`, function() {
        const bodyExprs = astNode.parseWhileStatement(1, varMap);
        expect(bodyExprs).to.deep.equal([ 'i++' ]);
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
        var varMap = new Functions.VariableMap(new HashMap());

        expect(block.getAssignmentLeftRight(0,varMap)).to.deep.equal(["a", [{type: 'Numeric', value: "1" }]]);

        varMap.setVariable("a", [{type: 'Numeric', value: "1" }] );

        expect(block.getAssignmentLeftRight(1,varMap)).to.deep.equal(["b", [{type: 'Numeric', value: '1' }]]);
    });
});

describe('AST Function', function() {
    const program = `function foo(){
                         var a = "alert(a)";
                         return a;
                     }
                     var a = function(){eval("test1");}
                     var b = function c (){eval("test2");}`;
    const block = new Functions.AST(ASTUtils.parse(program));

    it(`isFunctionDeclaration()`, function() {
        expect(block.isFunctionDeclaration(0)).to.equal(true);
    });

    it(`getFunctionBodyFromFunctionExpression()`, function() {
        const blocks1 = block.getFunctionBodyFromFunctionExpression(1);
        expect(blocks1).to.deep.equal([ 'eval("test1");' ]);

        const blocks2 = block.getFunctionBodyFromFunctionExpression(2);
        expect(blocks2).to.deep.equal([ 'eval("test2");' ]);
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

    it(`getFunctionName() & hasFunctionExpression()`, function() {
        const program = `function foo(){
                             var a = "alert(a)";
                             return a;
                         }
                         var a = function(){};
                         var a = 1, b = function(){};`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getFunctionName(0)).to.deep.equal("foo");
        expect(block.hasFunctionExpression(1, block)).to.deep.equal(true);
        expect(block.getFunctionName(1)).to.deep.equal("a");
        // expect(block.hasFunctionExpression(2, block)).to.deep.equal(true);
        // expect(block.getFunctionName(2)).to.deep.equal("b");
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
        expect(block.getFunctionArguments(1)).to.deep.equal([{type: 'BinaryExpression', value: '(1+a)+\"test\"'}]);
        expect(block.getFunctionArguments(2)).to.deep.equal([{type: 'BinaryExpression', value: '1+a'},
                                                             {type: 'String', value: '(\"test\"-a)-1'}]);
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

    it(`getCalleeName() for FunctionCall arguments`, function() {
        const program = `eval();
                         unescape();
                         atob(unescape());`;
        const block = new Functions.AST(ASTUtils.parse(program));

        expect(block.getCalleeName(0)).to.deep.equal("eval");
        expect(block.getCalleeName(1)).to.deep.equal("unescape");
        expect(block.getCalleeName(2)).to.deep.equal("atob");
    });
});








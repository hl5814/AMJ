// [FunctionDeclaration]
function A(){};             // function declaration 

// [VariableDeclaration->declarations->init: [FunctionExpression]]
var B = function(){};       // function expression  
var C = (function(){});     // function expression with grouping operators
var D = function foo(){};   // named function expression

// [VariableDeclaration->declarations->init: [CallExpression]]
var E = (function(){        // IIFE that returns a function
  return function(){}
})();

// [VariableDeclaration->declarations->init: [NewExpression]]
var F = new Function();     // Function constructor
var G = new function(){};   // special case: object constructor

// [VariableDeclaration->declarations->init: [ArrowFunctionExpression]]
var H = x => x * 2;         // ES6 arrow function 


var x = 1 + function foo() {};
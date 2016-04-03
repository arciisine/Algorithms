'use strict';

var Analyzer = (function() {
  function yieldVisitor() {
    var nameSym = AST.genSymbol();
    var stackSym = AST.genSymbol()
    var name = null;
    var stackAST = {
      type : "Identifier",
      name   : stackSym  
    }
    
    return AST.visitor({
      FunctionDeclaration : function(node) {
        if (name !== null || !node.id || !node.id.name) return;
        
        name = node.id.name; 
        node.generator = true;
        node.params.unshift(stackAST)
        node.id.name = nameSym;

        var body = node.body.body;
        body.unshift(AST.parse(templates.addToStack).body)
        node.body = {
          type : "BlockStatement",
          body : [{
            type : "TryStatement",
            block :  node.body,
            finalizer : AST.parse(templates.removeFromStack).body
          }]
        }         
        return node;
      },
      CallExpression : function(node) {
        if (node.callee.name === name) {
          node.callee.name = nameSym;
          node.arguments.unshift(stackAST);
          return  {
            type : "YieldExpression",
            delegate : true,
            argument : node
          };
        }
      },
      ReturnStatement: function(node) {
        var id = { name : AST.genSymbol(), type : "Identifier" };
        return {
          type : "BlockStatement",
          body : [
            {
              type : "VariableDeclaration",
              kind : "var",
              declarations : [{ 
                type : "VariableDeclarator", 
                id : id, 
                init : node.argument 
              }],            
            },
            {
              type : "ExpressionStatement",
              expression : { 
                type : "YieldExpression", 
                argument : {
                  type : "ArrayExpression",
                  elements : [stackAST, id]
                } 
              }
            },
            AST.extend(AST.parse(templates.ifInner).body.body[0], {
              consequent : {
                type : "ReturnStatement",
                argument : id,
                visited : true
              }
            })
          ]
        };
      }
    });
  }
  
  function invoker(fn) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);
      var stack = [];
      args.unshift(stack); //Put stack on front
      return fn.apply(this, args);
    }
  }

  var templates = {  
    addToStack : function a() {
      arguments[0].push(Array.prototype.slice.call(arguments, 1));
    },
    ifInner : function b() {
      if (arguments[0].length > 1) {
        
      }
    },
    removeFromStack : function c() {
      arguments[0].pop();
    }
  };

  function rewrite(fn) {
    var ast = AST.parse(fn);   
    ast = AST.visit(yieldVisitor(), ast);
    console.log(ast);
    var src = '('+escodegen.generate(ast)+')';
    console.debug(src);
    return invoker(eval(src));
  }
  
  return {
    rewrite : rewrite
  }
})();
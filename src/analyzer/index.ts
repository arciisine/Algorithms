import {AST} from '../ast/index';
declare let escodegen:any;

export class Analyzer {
  static templates = {  
    addToStack : function a() {
      arguments[0].push(Array.prototype.slice.call(arguments, 1));
    },
    ifInner : function b() {
      if (arguments[0].length > 1) {
        
      } else {
        
      }
    },
    removeFromStack : function c() {
      arguments[0].pop();
    }
  };

  
  static yieldVisitor() {
    let nameSym = AST.genSymbol();
    let stackSym = AST.genSymbol()
    let name = null;
    let stackAST = {
      type : "Identifier",
      name   : stackSym  
    }
    
    return AST.visitor({
      FunctionDeclaration : function(node:FunctionDeclaration) {
        if (name !== null || !node.id || !node.id.name) return;
        
        name = node.id.name; 
        node.generator = true;
        node.params.unshift(stackAST)
        node.id.name = nameSym;

        let body = (node.body as BlockStatement).body;
        body.unshift(AST.parse(Analyzer.templates.addToStack).body)
        node.body = {
          type : "BlockStatement",
          body : [{
            type : "TryStatement",
            block :  node.body,
            finalizer : AST.parse(Analyzer.templates.removeFromStack).body
          }]
        }         
        return node;
      },
      CallExpression : function(node:CallExpression) {
        let callee = node.callee as Identifier;
        if (callee.name === name) {
          callee.name = nameSym;
          node.arguments.unshift(stackAST);
          return  {
            type : "YieldExpression",
            delegate : true,
            argument : node
          };
        }
      },
      ReturnStatement: function(node:ReturnStatement) {
        let id = { name : AST.genSymbol(), type : "Identifier" };
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
            AST.extend((AST.parse(Analyzer.templates.ifInner).body as BlockStatement).body[0], {
              consequent : {
                type : "ReturnStatement",
                argument : id,
                visited : true
              },
              alternate : {
                type : "ReturnStatement",
                visited : true
              }
            })
          ]
        };
      }
    });
  }
  
  static invoker(fn) {
    return function() {
      let args = Array.prototype.slice.call(arguments, 0);
      let stack = [];
      args.unshift(stack); //Put stack on front
      return fn.apply(this, args);
    }
  }

  static rewrite(fn) {
    let ast = AST.parse(fn);   
    ast = <FunctionExpression>AST.visit(Analyzer.yieldVisitor(), ast);
    console.log(ast);
    let src = '('+escodegen.generate(ast)+')';
    console.debug(src);
    return Analyzer.invoker(eval(src));
  }
}
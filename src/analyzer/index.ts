import {AST} from '../ast/index';
declare let escodegen:any;

function copy(res) {
  if (Array.isArray(res)) {
    return res.slice(0);
  } else if (typeof res == 'object' && res.constructor == Object) {
    var out = {};
    for (var k in res) out[k] = res[k];
    return out;
  } 
  return res;
}

export class Analyzer {
  static templates = {
    copy,
    __addToStack : function a(stack, args) {
      var args = Array.prototype.slice.call(args, 1);
      stack.push(args.map(function(o) { return copy(o); }));
    },
    __ifInner : function b() {
      if (arguments[0].length > 1) {
        
      } else {
        
      }
    },
    __removeFromStack : function c(stack) {
      stack.pop();
    },
    __model : function model(stack, res) {
      return { 
        "stack" : stack.slice(0), 
        "value" : copy(res) 
      };
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
        body.unshift({
          type : "CallExpression",
          callee : {
            type : "Identifier",
            name : "__addToStack"
          },
          arguments : [stackAST, {
            type : "Identifier",
            name : "arguments"
          }]
        });
        node.body = {
          type : "BlockStatement",
          body : [{
            type : "TryStatement",
            block :  node.body,
            finalizer : {
              type : "BlockStatement",
              body : [{
                type : "CallExpression",
                callee : {
                  type : "Identifier",
                  name : "__removeFromStack"
                },
                arguments : [stackAST]
              }]
            }
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
        let idAST = { name : AST.genSymbol(), type : "Identifier" };              
        return {
          type : "BlockStatement",
          body : [
            {
              type : "VariableDeclaration",
              kind : "var",
              declarations : [{ 
                type : "VariableDeclarator", 
                id : idAST, 
                init : node.argument 
              }],            
            },
            {
              type : "ExpressionStatement",
              expression : { 
                type : "YieldExpression", 
                argument : {
                  type : "CallExpression",
                  callee : { name : "__model", type : "Identifier" }, 
                  arguments : [stackAST, idAST]
                } 
              }
            },
            AST.extend((AST.parse(Analyzer.templates.__ifInner).body as BlockStatement).body[0], {
              consequent : {
                type : "ReturnStatement",
                argument : idAST,
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
  
  static invoker(fn:Function) {
    return function() {
      let args = Array.prototype.slice.call(arguments, 0);
      let stack = [];
      args.unshift(stack); //Put stack on front
      return fn.apply(this, args);
    }
  }

  static rewrite(fn:Function, globals:any) {
    globals = AST.extend(globals || {}, Analyzer.templates);
    let ast = AST.parse(fn);   
    ast = <FunctionExpression>AST.visit(Analyzer.yieldVisitor(), ast);
    return Analyzer.invoker(AST.toSource(ast, globals));
  }
}
import {AST} from '../ast/index';
import * as _ from "lodash";
declare let escodegen:any;

export class Analyzer {
  static templates = {
    __emit : function a(frameId, action, val) {
      let out = {frameId,action}
      if (val !== undefined) {
        out['value'] = val;
      }
      return out;
    }
  };
    
  static yieldVisitor() {
    let name = null;
    let nameSym = AST.genSymbol();
    let frameIdAST = {
      type : "Identifier",
      name   : AST.genSymbol()
    }
    
    function emit(action:string, val?:any) {
      return {
        type : "YieldExpression",
        argument : {
          type : "CallExpression",
          callee : { name : "__emit", type : "Identifier" },
          arguments : [
            frameIdAST, 
            { type : "Literal", value : action}, 
            val
          ].filter(x => !!x)
        }
      }
    }
    
    return AST.visitor({
      FunctionDeclaration : function(node:FunctionDeclaration) {
        if (name !== null || !node.id || !node.id.name) return;
        
        name = node.id.name; 
        node.generator = true;
        node.id.name = nameSym;

        let body = (node.body as BlockStatement).body;
        body.unshift({
          type : "VariableDeclaration",
          kind : "var",
          declarations : [{ 
            type : "VariableDeclarator", 
            id : frameIdAST, 
            init : {
              type : "CallExpression",
              callee : {
                type : "Identifier",
                name : "genSymbol"
              },
              arguments : []
            }
          }]
        }, emit("enter", { type : "Identifier", name : "arguments"}));
        node.body = {
          type : "BlockStatement",
          body : [{
            type : "TryStatement",
            block :  node.body,
            finalizer : {
              type : "BlockStatement",
              body : [emit("leave")]
            }
          }]
        }         
        return node;
      },
      CallExpression : function(node:CallExpression) {
        let callee = node.callee as Identifier;
        if (callee.name === name) {
          callee.name = nameSym;
          return  {
            type : "YieldExpression",
            delegate : true,
            argument : node
          };
        }
      },
      ReturnStatement: function(node:ReturnStatement) {
        let retAST = { name : AST.genSymbol(), type : "Identifier" };              
        return {
          type : "BlockStatement",
          body : [
            {
              type : "VariableDeclaration",
              kind : "var",
              declarations : [{ 
                type : "VariableDeclarator", 
                id : retAST, 
                init : node.argument 
              }],            
            },
            {
              type : "ExpressionStatement",
              expression : emit("return", retAST)
            },
            {
              type : "ReturnStatement",
              argument : retAST,
              visited : true
            }
          ]
        };
      }
    });
  }
  
  static invoker(fn:Function) {
    return function() {
      let args = Array.prototype.slice.call(arguments, 0);
      return fn.apply(this, args);
    }
  }

  static rewrite(fn:Function, globals:any) {
    globals = _.extend(globals || {}, Analyzer.templates);
    let ast = AST.parse(fn);   
    ast = <FunctionExpression>AST.visit(Analyzer.yieldVisitor(), ast);
    return Analyzer.invoker(AST.toSource(ast, globals));
  }
}
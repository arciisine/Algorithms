import {AST} from '../ast/index';
import {
  Id, 
  Yield, 
  Call, 
  Literal, 
  Block, 
  Vars, 
  TryCatchFinally, 
  Expr, 
  Return, 
  Throw
} from '../ast/helper';
import * as _ from "lodash";

function emit(ident:Identifier, action:string, val?:any):YieldExpression {
  return Yield(Call(Id("_emit"), ident, Literal(action), val));
}

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
    let frameId = Id()
       
    return AST.visitor({
      FunctionDeclaration : function(node:FunctionDeclaration) {
        if (name !== null || !node.id || !node.id.name) return;
        
        name = node.id.name; 
        node.generator = true;
        node.id.name = nameSym;

        node.body = Block(TryCatchFinally(
          [
            Vars(frameId, Call(Id("genSymbol"))), 
            emit(frameId, "enter", Id("arguments")),
            ...((node.body as BlockStatement).body as ASTNode[])
          ],
          [
            emit(frameId, "error", Id("e")),
            Throw(Id('e'))
          ],
          [emit(frameId, "leave")]
        ))
        return node;
      },
      CallExpression : function(node:CallExpression) {
        let callee = node.callee as Identifier;
        if (callee.name === name) {
          callee.name = nameSym;
          return  Yield(node, true);
        }
      },
      ReturnStatement: function(node:ReturnStatement) {
        let retId = Id();              
        return Block(
          Vars(retId, node.argument),
          Expr(emit(frameId, "return", retId)),
          _.extend(Return(retId), { visited : true })
        );
      }
    });
  }

  static rewrite(fn:Function, globals:any) {
    return AST.rewrite(fn, 
      Analyzer.yieldVisitor(), 
      _.extend(globals || {}, Analyzer.templates));
  }
}
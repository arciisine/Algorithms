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
  Throw,
  Func
} from '../ast/helper';
import * as _ from "lodash";

function emit(ident:Identifier, action:string, val?:any):YieldExpression {
  return Yield(Call(Id("__emit"), ident, Literal(action), val));
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
    let funcId = Id()
    let frameId = Id()
       
    return AST.visitor({
      FunctionDeclaration : function(node:FunctionDeclaration) {
        if (name !== null || !node.id || !node.id.name) return;
        name = node.id.name; 

        return Func(
          funcId,
          node.params,
          [
            TryCatchFinally(
              [
                Vars(frameId, Call(Id("genSymbol"))), 
                emit(frameId, "invoke", Id("arguments")),
                ...((node.body as BlockStatement).body as ASTNode[])
              ],
              [
                emit(frameId, "error", Id("e")),
                Throw(Id('e'))
              ]
            )
          ],
          true
        );
      },
      CallExpression : function(node:CallExpression) {
        let callee = node.callee as Identifier;
        if (callee.name === name) {
          callee.name = funcId.name;
          return  Yield(node, true);
        }
      },
      ReturnStatement: function(node:ReturnStatement) {
        let retId = Id();              
        return Block(
          Vars(retId, node.argument),
          emit(frameId, "return", retId),
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
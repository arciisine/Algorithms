import {AST} from '../ast/index';
import {
  Id, 
  IfThen,
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
    },
    __cacheKey : function(args) { return JSON.stringify(Array.prototype.slice.call(args, 0)); },
    __getCache : function(ctx, key, p:string) { return (ctx[p] || (ctx[p] = {}))[key]; },
    __setCache : function(ctx, key, p:string, ret) { ctx[p][key] = ret; }    
  };
       
  static yieldVisitor(memoize:boolean = false) {
    let name = null;
    let funcId = Id()
    let frameId = Id()
    let cacheId = Literal(Id().name)
    let cacheKeyId = Id()
    let cacheResId = Id()
       
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
                emit(frameId, "enter", Id("arguments")),
                Vars(
                  cacheKeyId, Call(Id("__cacheKey"), Id("arguments")),
                  cacheResId, Call(Id("__getCache"), funcId, cacheKeyId, cacheId)
                ),                
                memoize ? IfThen({type:"BinaryExpression", operator: "!==", left : cacheResId, right : Id("undefined")}, 
                  [
                    emit(frameId, "return", cacheResId),
                    _.extend(Return(cacheResId), { visited : true })
                  ]) : null,
                ...((node.body as BlockStatement).body as ASTNode[])
              ],
              [
                emit(frameId, "error", Id("e")),
                Throw(Id('e'))
              ],
              [
                emit(frameId, "leave"),
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
          memoize ? Call(Id("__setCache"), funcId, cacheKeyId, cacheId, retId) : null,
          emit(frameId, "return", retId),
          _.extend(Return(retId), { visited : true })
        );
      }
    });
  }

  static rewrite(fn:Function, globals:any = {}, memoize:boolean = false):GeneratorFunction {
    return AST.rewrite(fn, 
      Analyzer.yieldVisitor(memoize), 
      _.extend(globals || {}, Analyzer.templates)) as GeneratorFunction;
  }
}
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
    __cacheKey : function(args) {
      return Array.prototype.slice.call(args, 0).map(function(x) { return ""+x; }).join('||');
    },
    __getCache : function(key, p:string) { return (this[p] = this[p] || {})[key]; },
    __setCache : function(key, p:string, ret) { this[p][key] = ret; }    
  };
       
  static yieldVisitor(memoize:boolean = false) {
    let name = null;
    let funcId = Id()
    let frameId = Id()
    let cacheId = Id()
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
                Vars(
                  cacheKeyId, Call(Id("__cacheKey"), [Id("arguments")]),
                  cacheResId, Call(Id("__getCache"), [cacheKeyId, cacheId])
                ),
                memoize ? IfThen({type:"BinaryExpression", operator: "!==", left : cacheResId, right : Id("undefined")}, 
                  [Return(cacheResId)]) : null,
                Vars(frameId, Call(Id("genSymbol"))), 
                emit(frameId, "enter", Id("arguments")),
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
          emit(frameId, "return", retId),
          memoize ? Call(Id("__setCache"), [cacheKeyId, cacheId, retId]) : null,
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
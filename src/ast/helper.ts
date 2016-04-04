import {AST} from './index';

export let Id = (name?:string):Identifier => {return {type:"Identifier", name:name||AST.genSymbol()}}
export let Literal = (value:any):Literal =>  {return {type:"Literal",    value }};
export let Block = (...body):BlockStatement => {return {type:"BlockStatement", body }};
export let Expr = (n:ASTNode):Expression => {return {type:"Expression", expression:n}};
export let Return = (e:Expression):ReturnStatement => {return {type:"ReturnStatement", argument:e}};
export let Yield = (e:Expression, delegate:boolean = false):YieldExpression => {
  return {type:"YieldExpression", argument:e, delegate} as YieldExpression
};
export let Throw = (e:Expression):ThrowStatement => {return {type:"ThrowStatement", argument:e}};
export let Call = (id:Identifier, ...args):CallExpression => {
  return {type:"CallExpression", callee:id, arguments:args.filter(x => !!x)}
}
export let Vars = (...args):VariableDeclaration => {
  let decls = [];
  for (let i = 0; i < args.length; i+=2) {
    decls.push({type:"VariableDeclarator", id:args[i], init:args[i+1]});
  }
  return {type:"VariableDeclaration",kind:"var", declarations: decls};
}
export let TryCatchFinally = (t:ASTNode[], c:ASTNode[] = [], f:ASTNode[] = []):TryStatement => {
  return {
    type : "TryStatement",
    block :  Block(...t),
    handler : {
      type: "CatchClause",
      param : Id('e'),
      body : Block(...c),
    },
    finalizer : Block(...f)
  };
}
export let Func = (id:Identifier, params:Pattern[], body:ASTNode[], generator:boolean = false):FunctionDeclaration => {
  return {
    type : "FunctionDeclaration", 
    id,
    params, 
    body : Block(...body), 
    generator, 
    defaults:[], 
    expression:false
  };
} 
export let IfThen = (test:Expression, body:ASTNode[], elseBody:ASTNode[] = []):IfStatement => {
  let res:any = {
    type : "IfStatement",
    test,
    consequent : Block(...body)
  }
  if (elseBody) {
    res['alternate']  = Block(...elseBody)
  };
  return res as IfStatement;
} 
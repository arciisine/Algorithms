declare let esprima:{
  parse : (fn:Function)=>ASTNode
};
declare let escodegen:{
  generate : (node:ASTNode)=>string
};

let id_:number = new Date().getTime()%10000;
type Transformer<T> = (node:T)=>T
interface Visitor { 
  process:Transformer<ASTNode>
}

export class AST {

  static genSymbol() {
    return "__gen"+parseInt(`${Math.random()*1000}`)+(id_++); 
  }
  
  static visit(visitor:Visitor, node:ASTNode, parent:ASTNode|[ASTNode] = null, key:string|number = null) {   
    node = visitor.process(node);
    [
      'body', 'declarations', 'argument', 'arguments', 'alternate', 'consequent',
      'left', 'right', 'init', 'expression', 'callee', 'elements', 
      'handlers', 'handler', 'block', 'finalizer', 'test'
    ]
      .filter(function(p) { return !!node[p]; })
      .forEach(function(p) { 
        let x = node[p];
        if (Array.isArray(x)) {
          x.forEach(function(y, i) {
            AST.visit(visitor, y, x, i);
          })
        } else {
          AST.visit(visitor, x, node, p);
        }
      });

    if (parent) parent[key] = node;
    return node;
  }
  
  static parse(fn:Function):FunctionExpression {
    let ast = <FunctionExpression>(esprima.parse(fn) as BlockStatement).body[0];
    return ast;
  }
  
  static compile(node:FunctionExpression, globals:any):Function {
    let src = `(function() {
      var id_ = new Date().getTime();
      var genSymbol = ${AST.genSymbol.toString()};
      ${Object.keys(globals || {}).map(k => `var ${k} = ${globals[k].toString()}`).join('\n')} 
      return ${escodegen.generate(node)}; 
    })()`;
    console.log(src);
    return eval(src);
  }

  static visitor(conf:{[key:string]:Transformer<ASTNode>}) {
    let out = {
      process : function(node:ASTNode):ASTNode {
        if (node['visited']) {
          return node;
        } else {
          node['visited'] = true;
          if (this[node['type'] as string]) {
            let res = this[node['type'] as string](node);
            return res || node; 
          } else {
            return node;
          }
        }
      }
    };
    return _.extend(out, conf) as typeof out;
  };
  
  static rewrite(fn:Function, visitor:Visitor, globals:any) {
    let ast = AST.parse(fn);   
    ast = <FunctionExpression>AST.visit(visitor, ast);
    return AST.compile(ast, globals);
  }
}
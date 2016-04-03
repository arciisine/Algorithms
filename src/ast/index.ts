declare let esprima:{
  parse : (fn:Function)=>ASTNode
};
declare let escodegen:{
  generate : (node:ASTNode)=>string
};

export class AST {
  private static id_:number = new Date().getTime()%10000;

  static genSymbol() {
    return "__gen"+parseInt(`${Math.random()*1000}`)+(AST.id_++); 
  }
  
  static visit(visitor:{process:(node:ASTNode)=>ASTNode}, node:ASTNode, parent:ASTNode|[ASTNode] = null, key:string|number = null) {   
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
    console.log(ast); 
    return ast;
  }
  
  static extend<T extends Object>(a:T, b:{}):T {
    for (let k in b) a[k] = b[k];
    return a;
  }
  
  static toSource(node:FunctionExpression, globals:any):Function {
    let src = `(function() {
      ${Object.keys(globals || {}).map(k => `var ${k} = ${globals[k].toString()}`).join('\n')} 
      return ${escodegen.generate(node)}; 
    })()`;
    console.debug(src);
    return eval(src);
  }

  static visitor(conf:{[key:string]:((node:ASTNode)=>ASTNode)}) {
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
    return AST.extend(out, conf);
  };
}
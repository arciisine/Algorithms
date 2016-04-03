'use strict';

var AST = (function() {
  var genSymbol = (function() {
    var id_ = new Date().getTime()%10000;
    return function() {
      return "__gen"+parseInt(Math.random()*1000)+(id_++); 
    };
  })();
  
  function visit(visitor, node, parent, key) {   
    node = visitor.process(node);
    [
      'body', 'declarations', 'argument', 'arguments', 'alternate', 'consequent',
      'left', 'right', 'init', 'expression', 'callee', 'elements', 
      'handlers', 'handler', 'block', 'finalizer', 'test'
    ]
      .filter(function(p) { return !!node[p]; })
      .forEach(function(p) { 
        var x = node[p];
        if (Array.isArray(x)) {
          x.forEach(function(y, i) {
            visit(visitor, y, x, i);
          })
        } else {
          visit(visitor, x, node, p);
        }
      });

    if (parent) parent[key] = node;
    return node;
  }
  
  function parse(fn) {
    var ast = esprima.parse(fn).body[0];
    console.debug(ast); 
    return ast;
  }
  
  function extend(a, b) {
    for (var k in b) a[k] = b[k];
    return a;
  }
  
  return {
    parse : parse,
    extend : extend,
    genSymbol : genSymbol,
    visitor : function(conf) {
      var out = {
        process : function(node) {
          if (node.visited) {
            return node;
          } else {
            node.visited = true;
            return (this[node.type] ? this[node.type](node) : null) || node;
          }
        }
      };
      return extend(out, conf);
    },
    visit : visit
  };
})();
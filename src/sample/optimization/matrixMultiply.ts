"use strict";

function matrixMultiply(matricies) {
  if (matricies.length === 1) {
    return [0, matricies[0],matricies[0]];
  } else {
    var out = [];
    for (var i = 1; i < matricies.length;i++) {
      var [lc,[or,oi],l] = matrixMultiply(matricies.slice(0, i))
      var [rc,[oi2,oc],r] = matrixMultiply(matricies.slice(i));
      out.push([lc+rc+or*oi*oc, [or,oc], [l, r]])
    }
    return out.sort((a,b) => a[0]-b[0])[0];
  }
}

export default {
  fn : matrixMultiply
}
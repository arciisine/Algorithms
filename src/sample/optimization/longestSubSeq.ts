import {pickOne, Algo} from '../util'

function longestSubSeq(a,b) {
  if (!a.length || !b.length) {
    return []
  } else if (a[0] === b[0]) {
    return [a[0]].concat(longestSubSeq(a.slice(1), b.slice(1)));
  } else {
    var as = longestSubSeq(a, b.slice(1))
    var bs = longestSubSeq(a.slice(1), b);
    return (as.length > bs.length) ? as : bs;
  }
}

var input = (n) => {
  let a = [];
  let b = [];
  let alpha = ['a','b','c','d','e']
  for (let i = 0; i < n; i++) {
    a.push(pickOne(alpha));
    b.push(pickOne(alpha));
  }
  return [a,b]
}

export default new Algo({
  fn : longestSubSeq,
  input
})
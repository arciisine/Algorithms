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

var input = [
  ["b","d","c","a","b","a"],
  ["a","b","c","b","d","a","b"]
]

export default {
  fn : longestSubSeq,
  input
}
function activitySelector(a, k) {
  var m = k +1;
  var n = a.length-1;
  while (m <= n && a[m][0] < a[k][1]) m+=1;
  return m <= n ? [m].concat(activitySelector(a, m)) : [];
}
var input = [[
  [1,4],
  [3,5],
  [0,6],
  [5,7],
  [3,9],
  [5,9],
  [6,10],
  [8,11],
  [8,12],
  [2,14],
  [12,16]
], 0];

export default {
  fn : activitySelector,
  input
}
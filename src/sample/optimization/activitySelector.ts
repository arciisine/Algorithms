import {randomInt,Algo} from '../util';

function activitySelector(a, k) {
  var m = k +1;
  var n = a.length-1;
  while (m <= n && a[m][0] < a[k][1]) m+=1;
  return m <= n ? [m].concat(activitySelector(a, m)) : [];
}
function input(n) {
  let out = [];
  let prev = 0;
  let min = 0;
  for (let i = 0; i < n; i++) {
    let next = randomInt(Math.max(prev - 5, min), prev);
    let task = [next, randomInt(next + 5, next)]
    prev = task[1];
    out.push(task);
  }
  return out;
}

export default new Algo({
  fn : activitySelector, 
  input : n => [input(n)]
});
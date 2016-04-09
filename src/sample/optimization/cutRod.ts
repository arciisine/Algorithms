import {randomInts,Algo} from '../util';

function cutRod(prices, n) {
  if (n <= 0) return 0;
  var max_val = -1;

  // Recursively cut the rod in different pieces and compare different 
  // configurations
  for (var i = 0; i < n; i++) {
    max_val = Math.max(max_val, prices[i] + cutRod(prices, n - i - 1));
  }

  return max_val;
}

let input = n => {
  let costs = randomInts(n).sort();
  return [costs, n];
}

export default new Algo({
  fn: cutRod, 
  input
});
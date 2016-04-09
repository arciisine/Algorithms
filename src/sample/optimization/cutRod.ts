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

var sample = [[1, 5, 8, 9, 10, 17, 17, 20], 8]

export default {
  fn : cutRod,
  sample
}
export function sum(node) {
  var ret = 0;
  if (node) {
    ret = node.value + sum(node.left) + sum(node.right);
  }
  return ret;
}

sum['sample'] = [{ value: 10, left: { value: 5 }, right: { value: 11 } }];

export function mergeSort(arr) {
  if (arr.length < 2)
    return arr;

  var middle = parseInt(`${arr.length / 2}`);
  var left = arr.slice(0, middle);
  var right = arr.slice(middle, arr.length);

  return merge(mergeSort(left), mergeSort(right));
}

mergeSort['sample'] = [[34, 203, 3, 746, 200, 984, 198, 764, 9]];
mergeSort['globals'] = { merge }

function merge(left, right) {
  var result = [];

  while (left.length && right.length) {
    if (left[0] <= right[0]) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }
  }

  while (left.length)
    result.push(left.shift());

  while (right.length)
    result.push(right.shift());

  return result;
}

export function cutRod(prices, n) {
  if (n <= 0) return 0;
  var max_val = -1;

  // Recursively cut the rod in different pieces and compare different 
  // configurations
  for (var i = 0; i < n; i++) {
    max_val = Math.max(max_val, prices[i] + cutRod(prices, n - i - 1));
  }

  return max_val;
}

cutRod['sample'] = [[1, 5, 8, 9, 10, 17, 17, 20], 8]
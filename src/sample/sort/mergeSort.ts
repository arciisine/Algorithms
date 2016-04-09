import {randomNumbers} from '../util';

function merge(left, right) {
  var result = [];
  while (left.length && right.length) {
    result.push((left[0] <= right[0] ? left : right).shift());
  }
  while (left.length)  result.push(left.shift());
  while (right.length) result.push(right.shift());
  return result;
}      


function mergeSort(arr) {
  if (arr.length < 2) return arr;
  var middle = parseInt(`${arr.length / 2}`);
  var left = arr.slice(0, middle);
  var right = arr.slice(middle, arr.length);
  return merge(mergeSort(left), mergeSort(right));
}

export default {
  fn : mergeSort,
  sample :() => [randomNumbers(30)],
  globals : { merge }
}
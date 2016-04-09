import {randomBinaryTree, randomInt,Algo} from '../util';

function sum(node) {
  var ret = 0;
  if (node) {
    ret = node.value + sum(node.left) + sum(node.right);
  }
  return ret;
};

export default new Algo({
  fn : sum,
  input : n => [randomBinaryTree(n, randomInt.bind(null, 100, 10))] 
})
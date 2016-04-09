import {Algo} from '../util';

function fib(n) {
  return n < 2 ? 1 : fib(n-1) + fib(n-2);
};

export default new Algo({
  fn : fib, 
  input : n => [n]
});
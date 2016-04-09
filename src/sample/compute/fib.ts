function fib(n) {
  return n < 2 ? 1 : fib(n-1) + fib(n-2);
};

var sample = [7];

export default {
  fn : fib,
  sample : sample
}
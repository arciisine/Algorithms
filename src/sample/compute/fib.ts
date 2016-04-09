function fib(n) {
  return n < 2 ? 1 : fib(n-1) + fib(n-2);
};

var input = [7];

export default {
  fn : fib,
  input
}
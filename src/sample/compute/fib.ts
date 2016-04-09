function fib(n) {
  return n < 2 ? 1 : fib(n-1) + fib(n-2);
};

export default {
  fn : fib,
  input : n => [n]
}
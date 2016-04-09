function sum(node) {
  var ret = 0;
  if (node) {
    ret = node.value + sum(node.left) + sum(node.right);
  }
  return ret;
};

var sample = [{ 
  value: 10, 
  left: { 
    value: 5,
    left : {
      value : 10,
      right : {
        value : 20
      }
    } 
  }, 
  right: { 
    value: 11,
    left : {
      value : 2
    },
    right : {
      value : 23,
      right : {
        value : 12
      }
    }
  } 
}];

export default {
  fn : sum,
  sample : sample
}
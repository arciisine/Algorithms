type Fn = (...args:any[])=>any;
type Algo = {fn:Fn, sample:any[]|(()=>any[]), globals?:{[key:string]:Fn}}

function randomNumbers(size:number, min = 0, max = 1000) {
  let out = [];
  for (let i = 0; i < size; i++) {
    out.push(parseInt(`${Math.random() * (max-min)}`) + min)
  }
  return out;
}

let data:{[key:string]:Algo} = {
  fib : (() => {
    function fib(n) {
      return n < 2 ? 1 : fib(n-1) + fib(n-2);
    };
    var sample = [7];
    return {
      fn : fib,
      sample : sample
    };
  })(),
  sum : (() => {
    function sum(node) {
      var ret = 0;
      if (node) {
        ret = node.value + sum(node.left) + sum(node.right);
      }
      return ret;
    };
    var sample = [{ value: 10, left: { value: 5 }, right: { value: 11 } }];
    return {
      fn : sum,
      sample : sample
    };
  })(),
  mergeSort : (() => {
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
    
    return {
      fn : mergeSort,
      sample :() => [randomNumbers(30)],
      globals : { merge }
    };
  })(),
  cutRod : (() => {
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
    return {
      fn : cutRod,
      sample
    };
  })(),
  quickSort : (() => {
    
    function partition(items, left, right) {
      var pivot = items[Math.floor((right + left) / 2)];
      var i = left;
      var j = right;

      while (i <= j) {
        while (items[i] < pivot) i++;
        while (items[j] > pivot) j--;
        if (i <= j) {
          [items[i],items[j]] = [items[j], items[i]]
          i++;
          j--;
        }
      }

      return i;
    }
    
    function quickSort(items, left, right) {
      if (left === undefined) {
        left = 0;
        right = items.length-1;
      }
      if (items.length > 1) {
        var index = partition(items, left, right);
        if (left < index - 1) quickSort(items, left, index - 1);
        if (index < right)  quickSort(items, index, right);
      }
      return items;
    }
          
    return {
      fn : quickSort,
      globals : { partition },
      sample : () => [randomNumbers(30)]
    };
  })(),
  activitySelector : (() => {
    function activitySelector(a, k) {
      var m = k +1;
      var n = a.length-1;
      while (m <= n && a[m][0] < a[k][1]) m+=1;
      return m <= n ? [m].concat(activitySelector(a, m)) : [];
    }
    var sample = [[
      [1,4],
      [3,5],
      [0,6],
      [5,7],
      [3,9],
      [5,9],
      [6,10],
      [8,11],
      [8,12],
      [2,14],
      [12,16]
    ], 0];
    return {
      fn : activitySelector,
      sample
    };
  })(),
  longestSubSeq : (() => {
    function longestSubSeq(a,b) {
      if (!a.length || !b.length) {
        return []
      } else if (a[0] === b[0]) {
        return [a[0]].concat(longestSubSeq(a.slice(1), b.slice(1)));
      } else {
        var as = longestSubSeq(a, b.slice(1))
        var bs = longestSubSeq(a.slice(1), b);
        return (as.length > bs.length) ? as : bs;
      }
    }

    var sample = [
      ["b","d","c","a","b","a"],
      ["a","b","c","b","d","a","b"]
    ]
    
    return {
      fn : longestSubSeq,
      sample
    };
  })()
}

export {data,Algo};
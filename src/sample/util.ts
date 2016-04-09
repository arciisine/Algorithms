export function randomInts(size:number, max = 1000, min = 0) {
  let out = [];
  for (let i = 0; i < size; i++) {
    out.push(randomInt(max, min))
  }
  return out;
}

export function randomInt(h:number = 1000, l:number=0):number {
  return parseInt(`${Math.random() * (h-l)}`) + l
}

export function pickOne<T>(items:T[]):T {
  return items[randomInt(0, items.length)]
}

type Node<T> = { left?:Node<T>, right?:Node<T>, value:T }

export function randomBinaryTree<T>(n:number, value:()=>T):Node<T> {
  if (n < 1) {
    return null;
  }
  
  let out:Node<T> = {value:value()};  
  let split = randomInt(n)
  out.left = randomBinaryTree(split, value);
  out.right = randomBinaryTree(n-split, value);  
  return out;
}
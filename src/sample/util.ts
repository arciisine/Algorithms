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

type Fn = (...args:any[])=>any;

export class Algo {
  public title:string;
  public description:string;
  public fn:Fn 
  public input:(n)=>any[] 
  public globals:{[key:string]:Fn} = {}
  
  public constructor(
    config: {
      title?:string,
      description?:string,
      fn : Fn,
      input:(n)=>any[],
      globals?:{[key:string]:Fn}
    }
  ) {
    this.fn = config.fn;
    this.title = config.title || this.fn.name;
    this.description = config.description;
    this.input = config.input;
    this.globals = config.globals || this.globals;
  }
}
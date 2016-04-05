import {mergeSort,merge} from '../data/index';
import {Analyzer} from '../analyzer/index';

type Node = {
  updated?:number,
  id:number,
  position:number,
  name : string,
  parent? : string,
  children?: Node[],
  done : boolean
}

export class AnalzyerController {
  private iterator:Iterator<{frameId:string, action:string, value:any}>;
  private visited:{[key:string]:Node} = {};
  private id:number = 1;
  public stack:string[] = [];
  public root:Node;
  
  constructor() {}
  
  render() {
    this.iterator = Analyzer.rewrite(mergeSort, {merge})(mergeSort['sample']);
  }  
  
  iterate() {
    if (!this.iterator) return;
    let next = this.iterator.next();    
    if (next.done) {
      return;
    }
    
    let res = next.value;    

    let node:Node = this.visited[res.frameId];
    if (!node) {
      node = this.visited[res.frameId] = { 
        name : res.frameId,
        position : 1,
        id : ++this.id,
        children : [],
        done : false
      };
      if (this.stack.length) {
        node.parent = this.stack[this.stack.length-1];
        let children = this.visited[node.parent].children;
        children.push(node);
        node.position = children.length + 1;
      } else {
        this.root = node;
      }
    }
        
    switch (res.action) {
      case 'enter': this.stack.push(res.frameId); break;
      case 'leave': this.stack.pop(); break;
    }    

    this.root.updated = new Date().getTime();
    
    if (res.action === 'return') {
      node.done = true; 
    }
  }
}

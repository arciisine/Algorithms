import {sum} from '../data/index';
import {Analyzer} from '../analyzer/index';

type Node = {
  updated?:number,
  id:number,
  name : string,
  frameId : string,
  args? : any,
  ret? : any,
  parent? : Node,
  children?: Node[],
  _children?:Node[],
  done : boolean
}

export class AnalyzerController {
  private iterator:Iterator<{frameId:string, action:string, value:any}>;
  private visited:{[key:string]:Node} = {};
  private id:number = 1;
  public stack:string[] = [];
  public root:Node;
  public activeFrameId:string;
  
  constructor() {}
  
  render() {
    this.iterator = Analyzer.rewrite(sum)(sum['sample']);
  }  
  
  iterate() {
    if (!this.iterator) return;
    let next = this.iterator.next();    
    if (next.done) {
      this.root.done = true;
      this.root.updated = new Date().getTime();
      return;
    }
    
    let res = next.value;    

    let node:Node = this.visited[res.frameId];
    if (!node) {
      node = this.visited[res.frameId] = {
        name : res.frameId, 
        frameId : res.frameId,
        args : JSON.stringify(_.clone(res.value)),
        id : ++this.id,
        children : [],
        done : false
      };
      
      node._children = node.children;
      
      if (this.stack.length) {
        node.parent = this.visited[this.stack[this.stack.length-1]];
        let children = node.parent._children;
        children.push(node);
        node.parent.children =  children;
      } else {
        this.root = node;
      }
    }
    
    this.activeFrameId = res.frameId;
        
    switch (res.action) {
      case 'enter': this.stack.push(res.frameId); break;
      case 'leave': this.stack.pop(); break;
      case 'return':
        node.ret = _.clone(res.value);
        node.done = true;
        break;
    }    

    this.root.updated = new Date().getTime();    
  }
}

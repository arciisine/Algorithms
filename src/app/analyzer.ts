import {data,Algo} from '../data/index';
import {Analyzer} from '../analyzer/index';

type Node = {
  updated?:number,
  id:number,
  name : string,
  frameId : string,
  args? : any[],
  ret? : any,
  parent? : Node,
  children?: Node[],
  _children?:Node[],
  done : boolean
}

export class AnalyzerController {
  public static $inject = ['$timeout', '$mdSidenav'];
  
  private iterator:Iterator<{frameId:string, action:string, value:any}>;
  private visited:{[key:string]:Node};
  private id:number;  
  private delay:number = 0;
  private algo:Algo;
  private globals:{[key:string]:Function};
  
  public stack:Node[];
  public root:Node;
  public activeFrameId:string;
  
  
  public source:string;
  public input:string;
  public memoize:boolean = false;
  public state:string = 'finished';
  public algos = data
    
  constructor(private $timeout:ng.ITimeoutService, public $mdSidenav) {
  }
  
  select() {
    this.memoize = true;
    this.source = this.algo.fn.toString()
      .replace(/^\s+/mg, function(v) {
        return v.replace(/\t|(    )/g, '  ').substring(11);
      })
      
    this.input = JSON.stringify(Array.isArray(this.algo.sample) ? 
      this.algo.sample : (this.algo.sample as ()=>any)()
    , null, 2);
    this.globals = this.algo.globals || {};
  }
  
  render() {
    delete this.root;
    this.stack = [];
    this.visited = {};
    this.id = 1;
    this.iterator = Analyzer.rewrite(this.source as any, this.globals, this.memoize)(...JSON.parse(this.input));
    this.state = 'stepping';
  }  
  
  play() {
    this.state = 'playing';
    this.delay = 250;
    this.step();
  }
  
  pause() {
    this.state = 'stepping';
    this.delay = 0;
  }
  
  stop() {
    this.state = 'finished';
    delete this.iterator;
    this.delay = 0;
  }
  
  step() {
    if (!this.iterator) return;
    let next = this.iterator.next();    
    if (next.done) {
      this.root.done = true;
      this.root.updated = new Date().getTime();
      delete this.activeFrameId;
      this.stop();
      return;
    }
    
    let res = next.value;    

    let node:Node = this.visited[res.frameId];
    if (!node) {
      node = this.visited[res.frameId] = {
        name : res.frameId, 
        frameId : res.frameId,
        args : Array.prototype.slice.call(res.value, 0).map(x => _.clone(x)),
        id : ++this.id,
        children : [],
        done : false
      };
      
      node._children = node.children;
      
      if (this.stack.length) {
        node.parent = this.stack[this.stack.length-1];
        let children = node.parent._children;
        children.push(node);
        node.parent.children =  children;
      } else {
        this.root = node;
      }
    }
    
    this.activeFrameId = res.frameId;
        
    switch (res.action) {
      case 'enter': this.stack.push(node); break;
      case 'leave': this.stack.pop(); this.step(); break;
      case 'return':
        node.ret = _.clone(res.value);
        node.done = true;
        break;
    }    

    this.root.updated = new Date().getTime();
    
    if (res.action !== 'leave' && this.delay) {
      this.$timeout(() => this.step(), this.delay);
    }    
  }
}

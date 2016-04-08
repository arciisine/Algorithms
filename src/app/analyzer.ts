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
  public static $inject = ['$timeout', '$mdSidenav', '$window'];
  
  private iterator:Iterator<{frameId:string, action:string, value:any}>;
  private visited:{[key:string]:Node};
  private id:number;  
  private delay:number = 0;
  private globals:{[key:string]:Function};
  
  //Stack
  public stack:Node[];
  
  //Hierarchy
  public root:Node;
  public activeFrameId:string;
  
  //Templates
  public templates = data
  
  //Inputs
  public algo:Function;
  public algoSource:string;  
  public input:string;
  public inputSource:string;  
  public memoize:boolean = false;
  
  //Buttons
  public state:string;
    
  constructor(private $timeout:ng.ITimeoutService, public $mdSidenav, private $window:ng.IWindowService) {
    let hash =  (this.$window.location.hash.split('#/') ||[]).pop();
    if (hash) {
      let [fn,inp,mem] = hash.split('&');
      this.algoSource = decodeURIComponent(fn);
      this.inputSource = decodeURIComponent(inp);
      this.memoize = mem === 'true';
      this.readAlgo()
      this.readInput()
      this.readMemoize();
    }
  }
  
  selectTemplate(name) {
    if (!name) return;

    let algo = this.templates[name]

    this.memoize = false;
    this.globals = algo.globals || {};
    
    this.algoSource = algo.fn.toString()
      .replace(/^\s+/mg, v => v.replace(/\t|(    )/g, '  ').substring(11))
      
    let arr = Array.isArray(algo.sample) ? 
      algo.sample : (algo.sample as ()=>any)();
      
    this.inputSource = `[\n  ${(arr || []).map(r => JSON.stringify(r)).join(',\n  ')}\n]`
    
    this.readAlgo();
    this.readInput();
  }
  
  readMemoize() {
    this.reset();
  }
  
  readAlgo() {
    this.algo = eval(`(${this.algoSource})`);
    this.reset();    
  }  
  
  readInput() {
    this.input = JSON.parse(this.inputSource);  
    this.reset();
  }
  
  isValid() {
    return !!this.algo && !!this.input;
  }
  
  play() {
    if (!this.iterator) {
      this.reset();
      this.init();
      this.$timeout(() => this.play());
    } else {
      this.state = 'playing';
      this.delay = 250;
      this.step();
    }
  }
  
  pause() {
    this.state = 'stepping';
    this.delay = 0;
  }
  
  stop() {
    if (this.state === 'stopped') {
      this.reset();
    } else {
      this.delay = 0;
      delete this.iterator;
      this.state = 'stopped';
    }
  }
 
  init() {
    this.iterator = Analyzer.rewrite(this.algo as any, this.globals, this.memoize)(...this.input);
  }
  
  next() {
    if (!this.iterator) {
      this.reset();
      this.init();
      this.$timeout(() => this.next());
    } else {
      this.step();
    }
  }
 
  private reset() {
    if (this.algo && this.input) {
      this.$window.location.hash = `${encodeURIComponent(this.algoSource.replace(/\s+/g, ' '))}&${encodeURIComponent(this.inputSource)}&${this.memoize}`
    }
    delete this.root;
    delete this.state;    
    delete this.iterator;

    this.delay = 0;
    this.stack = [];
    this.visited = {};
    this.id = 1;
  }
   
  private step() {
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

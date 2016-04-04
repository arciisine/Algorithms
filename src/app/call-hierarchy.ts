import {mergeSort,merge} from '../data/index';
import {Analyzer} from '../analyzer/index';
import * as _ from "lodash";

type Node = {
  updated?:number,
  id:number,
  position:number,
  name : string,
  parent? : string,
  children?: Node[],
  done : boolean
}

export class CallHierarchy {
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
    if (next.done) return;
    
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
    
    if (res.action === 'return') {
      node.done = true; 
    }
    
    this.root.updated = new Date().getTime();
  }
}

export let Directive = ['$timeout', function($timeout) {
  let margin = 20;
  
  function update(root, svg, tree, diagonal) {
    // Compute the new tree layout.
    let nodes = tree.nodes(root).reverse();
    root.x = 500;
    
    let links = tree.links(nodes);


    // Normalize for fixed-depth.
    nodes.forEach(d => {
      if (d.depth > 0) {
        d.y = d.depth * 100;
        d.x = (d.parent.x + (d.position - d.parent.children.length/2 - 1) * 100)
      } 
    });

    // Declare the nodesâ€¦
    let node = svg.selectAll("g.node").data(nodes, d => d.id);

    // Enter the nodes.
    let nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodeEnter.append("circle")
      .attr("r", 10)
      .style("fill", "#fff");

    nodeEnter.append("text")
      .attr("y", d =>  d.children ? -13 : 13)
      .attr("dx", ".35em")
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.name)
      .style("fill-opacity", 1);

    // Declare the links
    let link = svg.selectAll("path.link")
      .data(links, d => d.target.id);

    // Enter the links.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", d => diagonal(d));
  }
  
  return {
    restrict : 'E',
    scope : {
      root : '=',
    },
    link : function(scope, el:ng.IAugmentedJQuery, attrs) {
      
      $timeout(() => {        
        let w = el.width();
        let h = el.height();
              
        let tree = d3.layout.tree()
          .size([w-margin*2, w-margin*2])
          //.nodeSize([70,40]);
          
        let diagonal = d3.svg.diagonal()
          .projection(d => [d.x, d.y]);
          
        let svg = d3.select(el[0].tagName.toLowerCase())
          .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
              .attr("transform", `translate(${margin},${margin})`);
              
        scope.$watch('root.updated', function(r) {
          if (r && scope.root) {
            update(_.cloneDeep(scope.root), svg, tree, diagonal);
          }
        });
      }, 100);
    }
  }
}];
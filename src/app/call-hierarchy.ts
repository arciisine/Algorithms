import * as _ from "lodash";
import * as d3 from "d3";

export let CallHierarchyDirective = ['$timeout', function($timeout) {
  let margin = 20;
  
  function update(root:any, svg:d3.Selection<any>, tree:d3.layout.Tree<any>, diagonal:d3.svg.Diagonal<d3.layout.tree.Link<any>, d3.layout.tree.Node>) {
    // Compute the new tree layout.
    let nodes = tree.nodes(root).reverse();
    
    let links = tree.links(nodes);


    // Declare the nodesâ€¦
    let node = svg.selectAll("g.node").data(nodes, d => d.id);

    // Enter the nodes.
    let nodeEnter = node.enter().append("g")  
      .attr("class", "node")
      
    nodeEnter
      .attr("transform", d => {
        d = d.parent || d;
        return `translate(${d.x0},${d.y0})` 
      })
      .transition().duration(1000)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodeEnter.append("circle")
      .attr("r", 3)
      .transition().duration(1000)
      .attr("r", 10)      
      .style("fill", "#fff");

    nodeEnter.append("text")
      .attr("y", 20)
      .attr("dx", ".5em")
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.name)
      .style("fill-opacity", 1);

    node
      .transition().duration(1000)
      .attr("transform", d => `translate(${d.x},${d.y})`)
      
    node.select("text")
      .attr("y", 20)
      .attr("dx", ".5em")

    // Declare the links
    let link = svg.selectAll("path.link")
      .data(links, d => d.target.id);

    // Enter the links.
    let linkEnter = link
      .enter().insert("path", "g")
      .attr("class", "link")
        
    linkEnter
      .attr("d", d => {
        var o = {x: d.source.x0, y: d.source.y0};
        return diagonal({source:o, target:o})
      })
      .transition().duration(1000)          
      .attr("d", d => diagonal(d))
        
    link
      .transition().duration(1000)    
      .attr("d", d => diagonal(d))        
        
    //link.exit()
    nodes.forEach(d => {
      console.log(d);
	    d.x0 = d.x;
	    d.y0 = d.y;
    });
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
          .nodeSize([100,60]);
          
        let diagonal = d3.svg.diagonal()
          .projection(d => [d.x, d.y]);
          
        let svg = d3.select(el[0].tagName.toLowerCase())
          .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
              .attr("transform", `translate(${margin + w/2},${margin})`);
        
        let first = true;
        
        scope.$watch('root.updated', function(r) {
          if (r && scope.root) {
            update(scope.root, svg, tree, diagonal);
          }
        });
      }, 100);
    }
  }
}];
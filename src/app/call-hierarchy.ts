import * as _ from "lodash";
import * as d3 from "d3";

export let CallHierarchyDirective = ['$timeout', function($timeout) {
  let margin = 20;
  
  function update(root:any, svg:d3.Selection<any>, tree:d3.layout.Tree<any>, diagonal:d3.svg.Diagonal<d3.layout.tree.Link<any>, d3.layout.tree.Node>) {
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

    node.attr("transform", d => `translate(${d.x},${d.y})`);
    
    node.select("text")
      .attr("y", d =>  d.children ? -13 : 13)
      .attr("dx", ".35em")

    // Declare the links
    let link = svg.selectAll("path.link")
      .data(links, d => d.target.id);

    // Enter the links.
    link
      .enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", d => diagonal(d))
        
    link.attr("d", d => diagonal(d))        
        
    //link.exit()
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
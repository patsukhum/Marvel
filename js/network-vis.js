/**
 * NetworkVis - Object constructor function
 *
 * Force-directed graph showing links between the Wikipedia pages of each
 * character
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- JSON containing nodes and edges
 * @constructor
 */
NetworkVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = _data;

  this.initVis();
};
NetworkVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.75;

  // Defining parameters for force simulation
  vis.strength = -500;
  vis.distance = 25;

  vis.svg = makeSvg(vis, 'network-vis');

  vis.gEdges = vis.svg.append('g')
      .attr('class', 'edges');
  vis.gNodes = vis.svg.append('g')
      .attr('class', 'nodes');

  vis.dragNode = d3.drag()
      .on('start', d => vis.dragStart(d, vis))
      .on('drag', d => vis.dragging(d, vis))
      .on('end', d => vis.dragEnd(d, vis));

  vis.scaleEdge = d3.scaleLinear()
      .range([1, 5]);

  vis.wrangleData();
};
NetworkVis.prototype.wrangleData = function() {
  var vis = this;

  // Filtering out all edges below 10 counts
  vis.displayData.edges = vis.data.edges.filter(d => d.count >= 5);

  // Converting bidirectional links to double-counts


  vis.updateVis();
};
NetworkVis.prototype.updateVis = function() {
  var vis = this;

  vis.scaleEdge.domain(d3.extent(vis.data.edges.map(d => d.count)));

  vis.force = d3.forceSimulation(vis.data.nodes)
      .force('charge', d3.forceManyBody().strength(vis.strength))
      .force('link', d3.forceLink(vis.data.edges).distance(vis.distance)
          .strength(link => link.count / 100))
      .force('center', d3.forceCenter().x(vis.width / 2).y(vis.height / 2));

  var edges = vis.gEdges.selectAll('.edge')
      .data(vis.data.edges)
      .enter().append('line')
        .attr('class', 'edge')
        .style('stroke-width', d => vis.scaleEdge(d.count) + 'px');

  var nodes = vis.gNodes.selectAll('.node')
      .data(vis.data.nodes)
      .enter().append('circle')
        .attr('class', 'node')
        .attr('r', 10); // For now... this will be determined by data after

  vis.force.on('tick', function() {
    edges.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    nodes.attr('cx', d => d.x)
        .attr('cy', d => d.y)
  });

  nodes.call(vis.dragNode);
};
NetworkVis.prototype.dragStart = function(d, vis) {
  if (!d3.event.activate) {
    vis.force.alphaTarget(0.3).restart();
  }
  d.fx = d.x;
  d.fy = d.y;
};
NetworkVis.prototype.dragging = function(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
};
NetworkVis.prototype.dragEnd = function(d, vis) {
  if (!d3.event.active) {
    vis.force.alphaTarget(0);
  }
  d.fx = null;
  d.fy = null;
};
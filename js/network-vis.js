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
  vis.strength = -200;
  vis.distance = 100;

  vis.svg = makeSvg(vis, 'network-vis');

  vis.gEdges = vis.svg.append('g')
      .attr('class', 'edges');
  vis.gNodes = vis.svg.append('g')
      .attr('class', 'nodes');

  vis.dragNode = d3.drag()
      .on('start', d => vis.dragStart(d, vis))
      .on('drag', d => vis.dragging(d, vis))
      .on('end', d => vis.dragEnd(d, vis));

  // Scales for node and edge attributes
  vis.scaleEdgeWidth = d3.scaleLinear()
      .range([1, 5]);
  vis.scaleEdgeOpacity = d3.scaleLinear()
      .range([0.01, 1.0]);
  vis.scaleNodeRadius = d3.scaleLinear()
      .range([1, 20])

  // Tooltip
  vis.tooltip = d3.tip()
      .attr('class','d3-tip')
      .html(d => d.name);

  vis.svg.call(vis.tooltip);

  vis.wrangleData();
};
NetworkVis.prototype.wrangleData = function() {
  var vis = this;

  // Filtering out all edges below 10 counts
  // vis.displayData.edges = vis.data.edges.filter(d => d.count >= 5);

  // Converting bidirectional links to double-counts


  vis.updateVis();
};
NetworkVis.prototype.updateVis = function() {
  var vis = this;

  vis.scaleEdgeWidth.domain(d3.extent(vis.displayData.edges.map(d => d.count)));
  vis.scaleEdgeOpacity.domain(d3.extent(vis.displayData.edges.map(d => d.count)));
  vis.scaleNodeRadius.domain(d3.extent(vis.displayData.nodes.map(d => d.centrality)))

  vis.force = d3.forceSimulation(vis.displayData.nodes)
      .force('charge', d3.forceManyBody()
          .strength(vis.strength))
      .force('link', d3.forceLink(vis.displayData.edges)
          .distance(vis.distance)
          .strength(link => link.count / 100))
      .force('center', d3.forceCenter()
          .x(vis.width / 2)
          .y(vis.height / 2));

  var edges = vis.gEdges.selectAll('.edge')
      .data(vis.displayData.edges)
      .enter().append('line')
        .attr('class', 'edge')
        .style('stroke-width', d => vis.scaleEdgeWidth(d.count) + 'px')
        .style('opacity', d => vis.scaleEdgeOpacity(d.count));

  var nodes = vis.gNodes.selectAll('.node')
      .data(vis.displayData.nodes)
      .enter().append('circle')
        .attr('class', 'node')
        .attr('r', d => vis.scaleNodeRadius(d.centrality))
        .on('mouseover', d => vis.nodeMouseover(d, vis))
        .on('mouseout', d => vis.nodeMouseout(d, vis)); // For now... this will be determined by data after

  vis.force.on('tick', function() {
    edges.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    nodes.attr('cx', d => d.x)
        .attr('cy', d => d.y);

    nodes.append('text')
        .text(d => d.name);

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
NetworkVis.prototype.nodeMouseover = function(d, vis) {
  vis.tooltip.show(d);
};
NetworkVis.prototype.nodeMouseout = function(d, vis) {
  vis.tooltip.hide(d);
};
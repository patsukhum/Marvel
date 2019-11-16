/**
 * LineChartVis - Object constructor function
 *
 * Force-directed graph showing links between the Wikipedia pages of each
 * character
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- Movies data
 * @constructor
 */
LineChartVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = _data;

  this.initVis();
};
LineChartVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.75;


  vis.svg = makeSvg(vis, 'linechart-vis');
  // create scales

  vis.wrangleData();
};
LineChartVis.prototype.wrangleData = function() {
  var vis = this;

  // Filtering out data


  vis.updateVis();
};
LineChartVis.prototype.updateVis = function() {
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

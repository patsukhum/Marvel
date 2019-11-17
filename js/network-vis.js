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
  vis.strength = -300;
  vis.distance = 150;

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
      .range([1, 20]);

  // Tooltip
  vis.tip = d3.tip()
      .attr('class','d3-tip')
      .html(d => d.name);

  vis.gNodes.call(vis.tip);

  vis.tooltip = d3.select('body').append('g')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  vis.wrangleData();
};
NetworkVis.prototype.wrangleData = function() {
  var vis = this;

  // Filtering out all edges below 10 counts
  // vis.displayData.edges = vis.data.edges.filter(d => d.count >= 5);

  // Converting bidirectional links to double-counts [... or maybe just don't]


  vis.updateVis();
};
NetworkVis.prototype.updateVis = function() {
  var vis = this;

  vis.scaleEdgeWidth.domain(d3.extent(vis.displayData.edges.map(d => d.count)));
  vis.scaleEdgeOpacity.domain(d3.extent(vis.displayData.edges.map(d => d.count)));
  vis.scaleNodeRadius.domain(d3.extent(vis.displayData.nodes.map(d => d.centrality)));

  vis.force = d3.forceSimulation(vis.displayData.nodes)
      .force('charge', d3.forceManyBody()
          .strength(vis.strength))
      .force('link', d3.forceLink(vis.displayData.edges)
          .distance(vis.distance)
          .strength(link => link.count / 100))
      .force('center', d3.forceCenter()
          .x(vis.width / 2)
          .y(vis.height / 2));

  vis.edges = vis.gEdges.selectAll('.edge')
      .data(vis.displayData.edges)
      .enter().append('line')
        .attr('class', 'edge')
        .style('stroke-width', d => vis.scaleEdgeWidth(d.count) + 'px')
        .style('opacity', d => vis.scaleEdgeOpacity(d.count));

  vis.nodes = vis.gNodes.selectAll('.node')
      .data(vis.displayData.nodes)
      .enter().append('circle')
        .attr('class', 'node')
        .attr('r', d => vis.scaleNodeRadius(d.centrality))
        .on('mouseover', d => vis.nodeMouseover(d, vis))
        .on('mouseout', d => vis.nodeMouseout(d, vis))
        .on('mousemove', d => vis.nodeMousemove(d, vis));

  vis.force.on('tick', function() {
    vis.edges.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    vis.nodes.attr('cx', d => d.x)
        .attr('cy', d => d.y);

    vis.nodes.append('text')
        .text(d => d.name);

  });

  vis.nodes.call(vis.dragNode);
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
  vis.tooltip.transition()
      .style('opacity', 0.8);

  vis.tooltip.html(`<h4>${d.name}</h4>` +
          `<p>Number of wikipedia pages: ${d.num_pages}</p>` +
          `<p>Average views per month: ${format1d(d.avg_monthly_views)}</p>` +
          `<p>Average references: ${format1d(d.num_refs)}</p>` +
          `<p>Average page links: ${format1d(d.num_links)}</p>` +
          `<p>Average word count: ${format1d(d.word_count)}</p>` +
          `<p>Network centrality: ${format1d(d.centrality)}</p>`)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY + 10) + "px");

  vis.edges.style('stroke', l => d === l.source || d === l.target ? '#f78f3f' : 'darkgray' )
      .style('opacity', l => d === l.source || d === l.target ? 1.0 : vis.scaleEdgeOpacity(d.count));
  vis.nodes.style('stroke', n => d === n ? "#f78f3f" : 'darkgray')
      .style('stroke-width', (d, n) => d === n ? '3px' : '2px');
};
NetworkVis.prototype.nodeMouseout = function(d, vis) {
  vis.tooltip.transition()
      .duration(100)
      .style("opacity", 0);
  vis.edges.style('stroke', 'darkgray')
      .style('opacity', l => vis.scaleEdgeOpacity(l.count));
  vis.nodes.style('stroke', 'darkgray')
      .style('stroke-width', '2px');
};
NetworkVis.prototype.nodeMousemove = function(d, vis) {
  vis.tooltip.style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY + 10) + "px");
};
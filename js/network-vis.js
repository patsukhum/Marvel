/**
 * NetworkVis - Object constructor function
 *
 * Force-directed graph showing links between the Wikipedia pages of each
 * character
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- JSON containing nodes and edges
 * @param _config         -- Configuration object
 * @param _eventHandler   -- Event handler
 * @constructor
 */
NetworkVis = function(_parentElement, _data, _config) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = _data;
  this.config = _config;
  this.selected = null;

  this.initVis();
};
NetworkVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = vis.config.margin || {'top': 40, 'bottom': 80, 'left': 40, 'right': 40};
  vis.width = vis.config.width || $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.config.height || vis.width * 0.7;

  // Defining parameters for force simulation
  vis.strength = vis.config.strength || -300;
  vis.distance = vis.config.distance || 110;

  // Whether to use tooltip
  vis.hideTooltip = vis.config.hideTooltip || false;

  // Whether to link to the matrix
  vis.linkToMatrix = vis.config.linkToMatrix || false;

  // Text to put at the top
  vis.topText = vis.config.topText || "";

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

  var minNodeRadius = vis.config.minNodeRadius || 5,
      maxNodeRadius = vis.config.maxNodeRadius || 30;
  vis.scaleNodeRadius = d3.scaleLinear()
      .range([minNodeRadius, maxNodeRadius]);

  // Tooltip
  if (!vis.hideTooltip) {
    vis.tip = d3.tip()
        .attr('class','d3-tip')
        .html(d => d.name);

    vis.gNodes.call(vis.tip);

    vis.tooltip = d3.select('body').append('g')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
  }

  vis.svg.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('class', 'annotation')
      .text(vis.topText);

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
          .y(vis.height / 2))
      .alphaDecay(0);

  vis.edges = vis.gEdges.selectAll('.edge')
      .data(vis.displayData.edges)
      .enter().append('line')
        .attr('class', 'edge')
        .style('stroke-width', d => vis.scaleEdgeWidth(d.count) + 'px')
        .style('opacity', d => vis.scaleEdgeOpacity(d.count));

  vis.nodes = vis.gNodes.selectAll('g.node')
      .data(vis.displayData.nodes);

  var nodeEnter = vis.nodes.enter()
      .append('g')
      .attr('class', 'node')
      .call(vis.dragNode)
      .on('mouseover', d => vis.nodeMouseover(d, vis))
      .on('mouseout', d => vis.nodeMouseout(d, vis))
      .on('mousemove', d => vis.nodeMousemove(d, vis))
      .on('click', (d, i) => vis.nodeClick(d, i, vis));

  nodeEnter.append('circle')
      .attr('r', d => vis.scaleNodeRadius(d.centrality));

  nodeEnter.append('image')
      .attr('xlink:href', d => getSvgIcon(d.name))
      .attr('width', d => 2 * vis.scaleNodeRadius(d.centrality))
      .attr('height', d => 2 * vis.scaleNodeRadius(d.centrality))
      .attr('x', d => -vis.scaleNodeRadius(d.centrality))
      .attr('y', d => -vis.scaleNodeRadius(d.centrality) * 0.8);

  vis.force.on('tick', function() {
    vis.edges.attr('x1', d => clamp(d.source.x, 0, vis.width))
        .attr('y1', d => clamp(d.source.y, 0, vis.height))
        .attr('x2', d => clamp(d.target.x, 0, vis.width))
        .attr('y2', d => clamp(d.target.y, 0, vis.height));

    nodeEnter.attr('transform', d => 'translate(' + clamp(d.x, 0, vis.width) + ',' + clamp(d.y, 0, vis.height) + ')');
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
  if (!vis.hideTooltip){
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
  }

  vis.edges.style('stroke', l => d === l.source || d === l.target ? '#f78f3f' : 'darkgray' )
      .style('opacity', l => d === l.source || d === l.target ? 1.0 : vis.scaleEdgeOpacity(d.count));
  vis.nodes.style('stroke', n => d === n ? "#f78f3f" : 'darkgray')
      .style('stroke-width', (d, n) => d === n ? '3px' : '2px');
};
NetworkVis.prototype.nodeMouseout = function(d, vis) {
  if (!vis.hideTooltip) {
    vis.tooltip.transition()
        .duration(100)
        .style("opacity", 0);
  }
    vis.edges.style('stroke', 'darkgray')
        .style('opacity', l => vis.scaleEdgeOpacity(l.count));
    vis.nodes.style('stroke', 'darkgray')
        .style('stroke-width', '2px');
};
NetworkVis.prototype.nodeMousemove = function(d, vis) {
  if (!vis.hideTooltip) {
    vis.tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
  }
};
NetworkVis.prototype.nodeClick = function(d, i, vis) {
  if (vis.linkToMatrix) {
    console.log(vis.linkToMatrix);
    if (vis.selected !== d) {
      vis.selected = d;
      matrixVis.highlightCol(d.name);
    } else {
      matrixVis.clearHighlight();
    }
  }
};

function setCircleLayout(nodes, idxSelected, vis) {
  var total = nodes.length - 1,
      r = Math.min(vis.width, vis.height) / 2 - 5,
      arc = 2 * Math.PI / total;
  nodes.filter((d, i) => i !== idxSelected).forEach(function(d, i) {
    var theta = arc * i;
    d.fx = Math.cos(theta) * r + vis.width / 2;
    d.fy = Math.sin(theta) * r + vis.height / 2;
  });
  nodes[idxSelected].fx = vis.width / 2;
  nodes[idxSelected].fy = vis.height / 2;
}
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
NetworkVis = function(_parentElement, _data, _config, _eventHandler) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = _data;
  this.config = _config;
  this.eventHandler = _eventHandler;

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
      .range([0.1, 1.0]);

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

  vis.wrangleData();
};
NetworkVis.prototype.wrangleData = function() {
  var vis = this;


  // Filtering out all edges below 10 counts
  vis.displayData.edges = vis.data.edges.filter(d => d.count >= 5);

  // Finding all links from each character to the others
  vis.connections = {};
  vis.displayData.nodes.forEach(d => vis.connections[d.name] = []);
  vis.displayData.edges.forEach(function(d) {
    var source = vis.displayData.nodes[d.source].name,
        target = vis.displayData.nodes[d.target].name;
    if (!(vis.connections[source].includes(target))) {
      vis.connections[source].push(target)
    }
    if (!(vis.connections[target].includes(source))) {
      vis.connections[target].push(source);
    }

  });

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
      .force('collision', d3.forceCollide().radius(d => vis.scaleNodeRadius(d.centrality)));

  vis.edges = vis.gEdges.selectAll('.edge')
      .data(vis.displayData.edges)
      .enter().append('line')
        .attr('class', 'edge')
        .style('stroke-width', d => vis.scaleEdgeWidth(d.count) + 'px')
        .style('opacity', d => vis.scaleEdgeOpacity(d.count));

  vis.nodes = vis.gNodes.selectAll('g.node')
      .data(vis.displayData.nodes)
      .enter()
        .append('g')
        .attr('class', 'node')
        .call(vis.dragNode)
        .on('mouseover', d => vis.nodeMouseover(d, vis))
        .on('mouseout', d => vis.nodeMouseout(d, vis))
        .on('mousemove', d => vis.nodeMousemove(d, vis));

  vis.nodes.append('circle')
      .attr('r', d => vis.scaleNodeRadius(d.centrality));

  vis.nodes.append('image')
      .attr('xlink:href', d => getSvgIcon(d.name))
      .attr('width', d => 2 * vis.scaleNodeRadius(d.centrality))
      .attr('height', d => 2 * vis.scaleNodeRadius(d.centrality))
      .attr('x', d => -vis.scaleNodeRadius(d.centrality))
      .attr('y', d => -vis.scaleNodeRadius(d.centrality) * 0.8);

  vis.force.on('tick', function() {
    vis.nodes
        .attr('transform', d => 'translate(' + clamp(d.x, 0, vis.width) + ',' + clamp(d.y, 0, vis.height) + ')');
    vis.edges
        .attr('x1', d => clamp(d.source.x, 0, vis.width))
        .attr('y1', d => clamp(d.source.y, 0, vis.height))
        .attr('x2', d => clamp(d.target.x, 0, vis.width))
        .attr('y2', d => clamp(d.target.y, 0, vis.height));
  });

  vis.nodes.call(vis.dragNode);
};
NetworkVis.prototype.dragStart = function(d, vis) {
  // $(vis.eventHandler).trigger("clickHighlight", d.name);
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
  // $(vis.eventHandler).trigger("clickClear");
  if (!d3.event.active) {
    vis.force.alphaTarget(0);
  }
  d.fx = null;
  d.fy = null;
};

NetworkVis.prototype.highlight = function(character) {
  var vis = this;

  vis.edges.style('stroke', l => edgeMatchesCharacter(l, character) ? '#f78f3f' : 'darkgray')
      .style('opacity', l => edgeMatchesCharacter(l, character) ? clamp(vis.scaleEdgeOpacity(l.count) * 2, 0.3, 1) : 0.15);
  vis.nodes.style('stroke', n => {
      if (nodeMatchesCharacter(n, character)) {
        return '#f78f3f';
      } else if (nodeConnectedToCharacter(n, character, vis.connections)) {
        return 'rgba(247,143,63,0.5)'
      } else{
        return 'darkgray';
      }
    })
      .style('stroke-width', n => nodeMatchesCharacter(n, character) ? '3px' : '2px')
      .style('opacity', n => {
          if (nodeMatchesCharacter(n, character) || nodeConnectedToCharacter(n, character, vis.connections)) {
            return 1;
          } else {
            return 0.3;
          }
        });
};
NetworkVis.prototype.clearHighlight = function() {
  var vis = this;

  vis.edges.style('stroke', 'darkgray').style('opacity', l => vis.scaleEdgeOpacity(l.count));
  vis.nodes.style('stroke', 'darkgray').style('stroke-width', '2px').style('opacity', 1);
};

NetworkVis.prototype.nodeMouseover = function(d, vis) {
  $(vis.eventHandler).trigger("mouseover", d.name);
};
NetworkVis.prototype.nodeMouseout = function(d, vis) {
  $(vis.eventHandler).trigger("mouseout");
};
NetworkVis.prototype.nodeMousemove = function(d, vis) {
  if (!vis.hideTooltip) {
    vis.tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
  }
};
NetworkVis.prototype.nodeClick = function(d, i, vis) {
  $(vis.eventHandler).trigger("clickHighlight", d.name);
};
NetworkVis.prototype.clickClear = function(vis) {
  $(vis.eventHandler).trigger("clickClear");
};

function edgeMatchesCharacter(l, character) {
  return character === l.source.name || character === l.target.name;
}
function nodeMatchesCharacter(n, character) {
  return n.name === character;
}
function nodeConnectedToCharacter(n, character, connections) {
  return connections[character].includes(n.name);
}
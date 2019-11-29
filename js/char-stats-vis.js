/**
 * CharStatsVis - Object constructor function
 *
 * @param _parentElement -- ID of HTML element that will hold vis
 * @param _data          -- Dataset for vis
 * @param _eventHandler  -- Event handler to pass transitions
 * @constructor
 */
CharStatsVis = function(_parentElement, _data, _eventHandler) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.eventHandler = _eventHandler;
  this.selected = null;

  this.initVis();
};
CharStatsVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 10,
    'bottom': 10,
    'left': 10,
    'right': 10
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.25;

  vis.colWidth = vis.width / 4;

  vis.svg = makeSvg(vis, 'char-stats-vis');

  vis.variables = [
    "centrality",
    "avg_monthly_views",
    "num_pages",
    "word_count",
  ];

  vis.maxVals = {};
  vis.variables.forEach(function(v) {
    vis.maxVals[v] = Math.round(d3.max(vis.data.map(d => d[v])));
  });

  vis.cols = vis.svg.selectAll('g.col')
      .data(vis.variables)
      .enter()
      .append('g')
      .attr('class', 'col')
      .attr('transform', (d, i) => 'translate(' + (vis.colWidth * i) + ',0)')
      .attr('id', d => 'col-' + d);

  vis.cols.append('text')
      .attr('y', vis.height - 20)
      .attr('x', 0)
      .text(d => titleCase(d))
      .style('font-size', '10px')
      .call(wrap, 20);

  vis.wrangleData();
};
CharStatsVis.prototype.wrangleData = function() {
  var vis = this;

  console.log(vis.data);

  if (vis.selected) {
    vis.displayData = vis.data.find(d => d.name === selected);
  } else {
    vis.displayData = null;
  }

  vis.updateVis();
};
CharStatsVis.prototype.updateVis = function() {
  var vis = this;

  if (vis.selected) {
    vis.cols.call(v => vis.drawMeter(vis, vis.displayData[v], vis.maxVals[v]))
  } else {
    vis.clearHighlight();
  }
};
CharStatsVis.prototype.clearHighlight = function() {
  var vis = this;
};
CharStatsVis.prototype.drawMeter = function(vis, val, max) {
  console.log(val);
  console.log(max);
};
CharStatsVis.prototype.highlight = function(character) {
  var vis = this;

  vis.selected = character;
  vis.wrangleData();
};
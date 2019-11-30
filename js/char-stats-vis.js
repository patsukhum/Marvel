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
  this.selected = "Iron Man";

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
  vis.colHeight = vis.height / 2;

  vis.svg = makeSvg(vis, 'char-stats-vis');

  // Defining variables, display names, and format functions
  vis.variables = [
    {
      name: "centrality",
      displayName: "Centrality",
      format: format1d
    },
    {
      name: "avg_monthly_views",
      displayName: "Average monthly views",
      format: formatValue
    },
    {
      name: "num_pages",
      displayName: "Number of pages",
      format: d3.format(".0f")
    },
    {
      name: "word_count",
      displayName: "Average word count",
      format: formatValue
    },
  ];


  vis.maxVals = {};
  vis.variables.forEach(function(d) {
    vis.maxVals[d.name] = Math.round(d3.max(vis.data.map(e => e[d.name])));
  });
  vis.maxVals.centrality = 0.5;

  vis.cols = vis.svg.selectAll('g.col')
      .data(vis.variables)
      .enter()
      .append('g')
      .attr('class', 'col')
      .attr('transform', (d, i) => 'translate(' + (vis.colWidth * (i % 2 + 2)) + ','
          + (clamp(i - 1, 0, 1) * vis.colHeight - 20) + ')')
      .attr('id', d => 'col-' + d.name);

  vis.cols.append('text')
      .attr('y', vis.height / 2 + 15)
      .attr('x', vis.colWidth / 2)
      .text(d => d.displayName)
      .style('font-size', '10px')
      .style('text-anchor', 'middle');

  vis.gMeters = vis.cols.append('g')
      .attr('class', 'meter')
      .datum(d => d)
      .attr('transform', 'translate(' + (vis.colWidth / 2) + ',' + (vis.colHeight) + ') rotate(-90)');

  // Arc generator
  vis.arc = d3.arc()
      .innerRadius(20)
      .outerRadius(27)
      .startAngle(0);

  // Drawing initial arcs
  vis.gMeters
      .append('path')
      .attr('class', 'arc background')
      .attr('d', vis.arc({endAngle: Math.PI}));

  // Creating text objects
  vis.gMeters.append('text')
      .attr('class', 'meter-text');

  // Name of selected character
  vis.charName = vis.svg.append('text')
      .attr('class', 'char-title h4')
      .style("text-anchor","middle")
      .attr('x', 170)
      .attr('y', 5);

  // Image of selected character
  vis.charImg = vis.svg.append('image')
      .attr('class', 'char-stats-img')
      .attr('x', 70)
      .attr('y', 15)
      .attr('height', 140)
      .attr('width', 210);

  vis.wrangleData();
};
CharStatsVis.prototype.wrangleData = function() {
  var vis = this;

  if (vis.selected) {
    vis.displayData = vis.data.find(d => d.name === vis.selected);
  } else {
    vis.displayData = null;
  }

  vis.updateVis();
};
CharStatsVis.prototype.updateVis = function() {
  var vis = this;

  if (vis.selected) {
    vis.gMeters
        .call(vis.drawMeter, vis);

    var meterText = vis.gMeters.select('text')
        .datum(d => d);
    meterText.enter()
        .append('text')
        .merge(meterText)
        .attr('x', 0)
        .attr('y', 0)
        .style('text-anchor', 'middle')
        .text(d => d.format(vis.displayData[d.name]))
        .attr('transform', 'rotate(90)')
        .style('font-size', 10);
    vis.charName.text(vis.selected);
    vis.charImg.attr('xlink:href', getJpgPath(vis.selected));
  }
};
CharStatsVis.prototype.drawMeter = function(elem, vis) {

  var arcs = elem.selectAll('path.arc.foreground')
      .data(d => [{endAngle: vis.displayData[d.name] / vis.maxVals[d.name] * Math.PI}]);

  arcs.enter()
      .append('path')
      .attr('class', 'arc foreground')
      .merge(arcs)
      .transition(300)
      .attrTween('d', (d, i) => arc2Tween(d, i, vis.arc));
};
CharStatsVis.prototype.highlight = function(character) {
  var vis = this;

  vis.selected = character;
  vis.wrangleData();
};

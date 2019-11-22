/**
 * PlotFlowVis - Object constructor function
 *
 * Flowchart that shows the progression of the plot through the MCU
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis (no '#')
 * @param _data           -- JSON dataset of each movie and links between them
 * @constructor
 */
PlotFlowVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = _data;
  this.branching = false;
  this.selected = {x: 'year', y: 'allFrac'};

  this.initVis();
};
PlotFlowVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 10,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.23;

  vis.svg = makeSvg(vis, 'plot-flow-vis');

  vis.rectHeight = 35;
  vis.rectWidth = 75;

  // Parsing data
  var yearCounts = {};
  vis.data.forEach((d) => {
    d.flows_into = d.flows_into.split(", ").filter(s => s !== "");
    d.year = new Date(+d.year, 0, 1);
    if (d.year in yearCounts) {
      d.yearCount = yearCounts[d.year];
      yearCounts[d.year]++;
    } else {
      yearCounts[d.year] = 1;
      d.yearCount = 0;
    }
  });
  vis.data.forEach(d => {
    d.yearTotal = yearCounts[d.year];
    d.yearFrac = (d.yearCount + 1) / d.yearTotal;
    d.allFrac = (d.yearCount + 1) / d3.max(Object.values(yearCounts));
  });

  vis.yMax = d3.max(vis.data.map(d => d.y));

  // Creating an object for the arrows
  vis.edges = vis.data.map(d => {
    if (d.flows_into.length > 0) {
      return d.flows_into.map(e => {
        var target = vis.data.find(a => a.movie === e);
        return [d, target];
      });
    }
  }).flat().filter(d => d !== undefined);

  // Set up scales
  vis.x = d3.scalePoint()
      .range([0, vis.width]);
  vis.y = d3.scaleBand()
      .paddingInner(10)
      .paddingOuter(10)
      .range([vis.height, 0]);

  // Set up x axis
  vis.xAxis = d3.axisBottom()
      .scale(vis.x)
      .tickFormat(formatYear);
  vis.gX = vis.svg
      .append('g').attr('class', 'x axis')
      .attr('transform', 'translate(0,' + vis.height + ')');

  // Group for films
  vis.gFilms = vis.svg.append('g')
      .attr('class', 'films');

  // Group for arrows
  vis.gArrows = vis.svg.append('g')
      .attr('class', 'arrows');

  // Line generator function
  vis.line = d3.linkHorizontal();

  vis.wrangleData();
};
PlotFlowVis.prototype.wrangleData = function() {
  var vis = this;

  // Nothing for now...
  vis.displayData = vis.data;

  vis.drawVis()

};
PlotFlowVis.prototype.drawVis = function() {
  var vis = this;

  vis.updateScales();

  var films = vis.gFilms.selectAll('rect')
      .data(vis.displayData, d => d.movie);

  films.enter()
      .append('rect')
        .attr('class', 'rect-film')
        .attr('height', vis.rectHeight)
        .attr('width', vis.rectWidth)
        .attr('opacity', 0)
      .transition()
        .on('start', function() {
          d3.select(this).style('opacity', 0);
        })
        .delay(vis.delayEnter)
        .duration(400)
        .style('opacity', 1)
      .selection()
        .call(vis.drawRect, vis);

  var titles = vis.gFilms.selectAll('text')
      .data(vis.displayData, d => d.movie);

  titles.enter()
      .append('text')
        .text(d => d.movie)
        .attr('class', 'film-title')
        .style('opacity', 0)
      .transition()
        .on('start', function() {
          d3.select(this).style('opacity', 0);
        })
        .delay(vis.delayEnter)
        .duration(400)
        .style('opacity', 1)
      .selection()
        .call(vis.drawLab, vis)
        .call(wrap, vis.rectWidth - 3);

  // d3.selectAll('.film-title').call(wrap, vis.rectWidth - 3);

  vis.xAxis.scale(vis.x);
  vis.gX.call(vis.xAxis);

};


PlotFlowVis.prototype.toggleBranching = function() {
  var vis = this;

  vis.branching = !vis.branching;
  if (vis.branching) {
    vis.selected.x = 'x';
    vis.selected.y = 'y';
  } else {
    vis.selected.x = 'year';
    vis.selected.y = 'allFrac';
  }

  var films = vis.gFilms.selectAll('rect')
      .data(vis.displayData, d => d.movie);
  var titles = vis.gFilms.selectAll('text')
      .data(vis.displayData, d => d.movie);

  vis.updateScales();

  films.transition()
      .duration(200)
      .call(vis.drawRect, vis);

  titles.transition()
      .duration(200)
      .call(vis.drawLab, vis);

  // Drawing arrows
  // TODO: Get the arrows to fade in (ideally draw themselves using attrTween)
  if (vis.branching) {
    var arrows = vis.gArrows.selectAll('path')
        .data(vis.edges)
        .enter()
        .append('path')
          .attr('class', 'arrow')
          .style('opacity', 0)
          .call(vis.drawArrow, vis)
        .transition()
          .on('start', function() {
            d3.select(this).style('opacity', 0)
          })
          .delay(d => 200 + d[0].year * 100)
          .duration(200)
          .style('opacity', 1)
  } else {
    vis.gArrows.selectAll('path')
        .transition()
        .style('opacity', 0)
        .remove();
  }



  if (!vis.branching) {
    vis.xAxis.scale(vis.x);
    vis.gX.call(vis.xAxis);
  } else {
    vis.gX.selectAll('.tick')
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .remove();
  }
};

PlotFlowVis.prototype.drawRect = function(elem, vis) {
  elem.attr('x', d => vis.x(d[vis.selected.x]) - vis.rectWidth / 2)
      .attr('y', d => vis.y(d[vis.selected.y]) - vis.rectHeight / 2);
};
PlotFlowVis.prototype.drawLab = function(elem, vis) {
  elem.attr('x', function(d) {
    d3.select(this).selectAll('tspan')
        .transition()
        .duration(200)
        .attr('x', vis.x(d[vis.selected.x]))
        .attr('y', vis.y(d[vis.selected.y]));
    return vis.x(d[vis.selected.x])
  })
      .attr('y', d => vis.y(d[vis.selected.y]));
};
// Need to add arrowheads
PlotFlowVis.prototype.drawArrow = function(elem, vis) {
  elem.attr('d', d => {
    return vis.line({
      source: [vis.x(d[0].x) + vis.rectWidth / 2, vis.y(d[0].y)],
      target: [vis.x(d[1].x) - vis.rectWidth / 2, vis.y(d[1].y)]
    });
  });
};

PlotFlowVis.prototype.delayEnter = function(d) {
  return (d.year.getFullYear() - 2008) * 1000 + 300 * d.yearCount;
};
PlotFlowVis.prototype.updateScales = function() {
  var vis = this;

  vis.x.domain(vis.displayData.map(d => d[vis.selected.x]).sort((a, b) => a - b));
  vis.y.domain(vis.displayData.map(d => d[vis.selected.y]).sort((a, b) => a - b));
};
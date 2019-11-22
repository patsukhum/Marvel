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
  vis.height = vis.width * 0.25;

  vis.svg = makeSvg(vis, 'plot-flow-vis');

  vis.rectHeight = 25;
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

  vis.updateVis()

};
PlotFlowVis.prototype.updateVis = function() {
  var vis = this;

  var xSelected, ySelected;
  if (vis.branching) {
    xSelected = 'x';
    ySelected = 'y';
  } else {
    xSelected = 'year';
    ySelected = 'allFrac';
  }
  vis.x.domain(vis.displayData.map(d => d[xSelected]).sort((a, b) => a - b));
  vis.y.domain(vis.displayData.map(d => d[ySelected]).sort((a, b) => a - b));

  var films = vis.gFilms.selectAll('rect')
      .data(vis.displayData);

  var filmsEnter = films.enter()
      .append('rect')
        .attr('class', 'rect-film')
        .attr('height', vis.rectHeight)
        .attr('width', vis.rectWidth)
        .attr('opacity', 0);

  filmsEnter.transition()
      .on('start', function() {
        d3.select(this).style('opacity', 0);
      })
      .delay(d => (d.year.getFullYear() - 2008) * 1000 + 1000)
      .duration(200)
      .style('opacity', 1)
      .selection()
      .merge(films)
        .attr('x', d => vis.x(d[xSelected]) - vis.rectWidth / 2)
        .attr('y', d => vis.y(d[ySelected]) - vis.rectHeight / 2);

  var titles = vis.gFilms.selectAll('text')
      .data(vis.displayData);

  var titlesEnter = titles.enter()
      .append('text')
        .text(d => d.movie)
        .attr('class', 'film-title')
        .style('opacity', 0);

  titlesEnter
      .transition()
        .on('start', function() {
          d3.select(this).style('opacity', 0);
        })
        .delay(d => (d.year.getFullYear() - 2008) * 1000 + 1000)
        .duration(200)
        .style('opacity', 1)
        .selection()
      .merge(titles)
        .attr('x', d => vis.x(d[xSelected]))
        .attr('y', d => vis.y(d[ySelected]));

  d3.selectAll('.film-title')
      .call(wrap, vis.rectWidth - 2);

  // Drawing arrows
  if (vis.branching) {
    var arrows = vis.gArrows.selectAll('path')
        .data(vis.edges);
    arrows.enter()
        .append('path')
        .attr('d', d => vis.drawArrow(d, vis))
        .attr('class', 'arrow');
  } else {
    vis.gArrows.selectAll('path').remove();
  }
  if (!vis.branching) {
    vis.xAxis.scale(vis.x);
    vis.gX.call(vis.xAxis);
  } else {
    vis.gX.selectAll('.tick').transition().remove();
  }
};
PlotFlowVis.prototype.scaleY = function(d, vis) {
  if (vis.branching) {
    return vis.y(d.y) - vis.rectHeight / 2 + vis.height / (2 * vis.yMax);
  } else {
    return vis.y(d.allFrac) - vis.rectHeight / 2;
  }
};
PlotFlowVis.prototype.drawArrow = function(d, vis) {
  return vis.line({
      source: [vis.x(d[0].x) + vis.rectWidth / 2, vis.y(d[0].y)],
      target: [vis.x(d[1].x) - vis.rectWidth / 2, vis.y(d[1].y)]
  });
};
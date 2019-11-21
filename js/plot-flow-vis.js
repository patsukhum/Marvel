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

  this.initVis();
};
PlotFlowVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.25;

  vis.svg = makeSvg(vis, 'plot-flow-vis');

  vis.rectHeight = 25;
  vis.rectWidth = 65;

  // Parsing data
  var yearCounts = {};
  vis.data.forEach((d) => {
    d.flows_into = d.flows_into.split(", ");
    d.year = new Date(d.year);
    if (d.year in yearCounts) {
      d.yearCount = yearCounts[d.year];
      yearCounts[d.year]++;
    } else {
      yearCounts[d.year] = 1;
      d.yearCount = 0;
    }
  });

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

  console.log(vis.displayData);

  vis.x.domain(vis.displayData.map(d => d.year).sort((a, b) => a - b));
  vis.y.domain(vis.displayData.map(d => d.yearCount).sort((a, b) => a - b));

  var films = vis.gFilms.selectAll('rect')
      .data(vis.displayData);

  films.enter()
      .append('rect')
        .attr('class', 'rect-film')
        .attr('height', vis.rectHeight)
        .attr('width', vis.rectWidth)
      .merge(films)
        .attr('x', d => vis.x(d.year) - vis.rectWidth / 2)
        .attr('y', d => vis.y(d.yearCount));

  var titles = vis.gFilms.selectAll('text')
      .data(vis.displayData);

  titles.enter()
      .append('text')
      .merge(titles)
        .text(d => d.movie)
        .attr('class', 'film-title')
      .attr('x', d => vis.x(d.year))
      .attr('y', d => vis.y(d.yearCount) + vis.rectHeight / 2);

  d3.selectAll('.film-title')
      .call(wrap, vis.rectWidth);

  vis.xAxis.scale(vis.x);
  vis.gX.call(vis.xAxis);
};

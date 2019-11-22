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
  this.branching = true;

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
  console.log(vis.edges);

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
  vis.line = d3.line()
      .curve(d3.curveCardinal);

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

  vis.x.domain(vis.displayData.map(d => d.year).sort((a, b) => a - b));
  vis.y.domain(vis.displayData.map(d => d.yearFrac).sort((a, b) => a - b));

  var films = vis.gFilms.selectAll('rect')
      .data(vis.displayData);

  films.enter()
      .append('rect')
        .attr('class', 'rect-film')
        .attr('height', vis.rectHeight)
        .attr('width', vis.rectWidth)
      .merge(films)
        .attr('x', d => vis.x(d.year) - vis.rectWidth / 2)
        .attr('y', d => vis.scaleY(d, vis));

  var titles = vis.gFilms.selectAll('text')
      .data(vis.displayData);

  titles.enter()
      .append('text')
      .merge(titles)
        .text(d => d.movie)
        .attr('class', 'film-title')
      .attr('x', d => vis.x(d.year))
      .attr('y', d => vis.scaleY(d, vis) + vis.rectHeight / 2);

  d3.selectAll('.film-title')
      .call(wrap, vis.rectWidth - 2);

  // Drawing arrows
  if (vis.branching) {
    var arrows = vis.gArrows.selectAll('path')
        .data(vis.edges);
    arrows.enter()
        .append('path')
        .attr('d', d => {
          var res = [[], []];
          console.log(d);
          res[0][0] = vis.x(d[0].year) + vis.rectWidth / 2;
          res[0][1] = vis.scaleY(d[0], vis) + vis.rectHeight / 2;
          res[1][0] = vis.x(d[1].year) - vis.rectWidth / 2;
          res[1][1] = vis.scaleY(d[1], vis) + vis.rectHeight / 2;
          console.log(res);
          return vis.line(res);
        })
        .attr('class', 'arrow');
  } else {
    vis.gArrows.selectAll('path').remove();
  }

  vis.xAxis.scale(vis.x);
  vis.gX.call(vis.xAxis);
};
PlotFlowVis.prototype.scaleY = function(d, vis) {
  if (vis.branching) {
    return vis.y(d.y) - vis.rectHeight / 2 + vis.height / (2 * vis.yMax);
  } else {
    return vis.y(d.allFrac) - vis.rectHeight / 2;
  }
};
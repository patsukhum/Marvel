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
  this.displayDc = null;
  this.displayMarvel = null;

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

  // line chart plotting help from: https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
  // parse the date / time
  var parseTime = d3.timeParse("%Y");

  // create scales
  vis.x = d3.scaleTime().range([0, width]);
  vis.y = d3.scaleLinear().range([height, 0]);

  // define the line
  vis.line = d3.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.close); });

  vis.wrangleData();
};
LineChartVis.prototype.wrangleData = function() {
  var vis = this;

  // convert strings to numerical values
  data.forEach(movie => {
    movie.Year = +movie.Year;
    movie.Metascore = +movie.Metascore;
    movie.imdbRating = +movie.imdbRating;
    movie.imdbVotes = +movie.imdbVotes;
  })

  // Filtering out data

  // revenue
  // # of movies
  // # 

  // divide up to MCU and DC films
  var dcMovies = vis.data.filter((movie) => {
    return movie['DC Film'] == "1";
  })
  var marvelMovies = vis.data.filter((movie) => {
    return movie['Marvel Film'] == "1";
  })
  console.log(dcMovies)
  console.log(marvelMovies)

  // update display data for visualization
  vis.displayDc = dcMovies;
  vis.displayMarvel = marvelMovies;

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

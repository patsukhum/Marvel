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

 // line chart plotting help from: https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0

LineChartVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = [];

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


  // create scales
  vis.x = d3.scaleTime().range([0, vis.width]);
  vis.y = d3.scaleLinear().range([vis.height, 0]);


  // add custom legend
  // code help from: https://www.d3-graph-gallery.com/graph/custom_legend.html

  var legend = this.svg.append("g").attr("class","legend")
        .attr("transform","translate(0,50)");
  legend.append("circle").attr("cx",50).attr("cy",20).attr("r", 6).style("fill", "#e23636")
  legend.append("circle").attr("cx",50).attr("cy",50).attr("r", 6).style("fill", "#0476F2")
  legend.append("text").attr("x", 60).attr("y", 20).text("Marvel").style("font-size", "15px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 60).attr("y", 50).text("DC Comics").style("font-size", "15px").attr("alignment-baseline","middle")



  vis.wrangleData();
};


LineChartVis.prototype.wrangleData = function() {
  var vis = this;


  // convert strings to numerical values
  this.data.forEach(movie => {
      movie.BoxOfficeWorldwide = +movie.BoxOfficeWorldwide;
      movie.Year = +movie.Year;
      //movie.Metascore = +movie.Metascore;
      movie.imdbRating = +movie.imdbRating;
      movie.imdbVotes = +movie.imdbVotes;
  })

  // Reorganize data so that array contains objects, where each object looks like:
  // {year: 2019, revenue: {dc: 10, marvel: 100}, averageRating: {dc: X, marvel: X}, ...}

  // selections: revenue, # of movies, average imdb rating, average imdb votes

  // in the future we may add 1-year average Wikipedia pageViews for each movie

  var years = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019]
  years.forEach(element => {
    var dictionary = {};
    dictionary.year = element;
    dictionary.numMovies = {dc: 0, marvel: 0};
    dictionary.boxOfficeWorldwide = {dc:0, marvel: 0};
    dictionary.avgRating = {dc: 0, marvel: 0};
    dictionary.avgVotes = {dc: 0, marvel: 0};
    // dictionary.pageViews = {dc: 0, marvel: 0};


    this.data.forEach(movie => {

      if(movie.Year == element) {

        if(movie['DC Film'] == "1") {
          dictionary.numMovies.dc += 1;
          dictionary.boxOfficeWorldwide.dc += movie.BoxOfficeWorldwide;
          dictionary.avgRating.dc += movie.imdbRating;
          dictionary.avgVotes.dc += movie.imdbVotes;

        }
        else {
          dictionary.numMovies.marvel += 1;
          dictionary.boxOfficeWorldwide.marvel += movie.BoxOfficeWorldwide;
          dictionary.avgRating.marvel += movie.imdbRating;
          dictionary.avgVotes.marvel += movie.imdbVotes;
        }

      }
    })

    // average values
    if(dictionary.numMovies.dc != 0) {
      dictionary.avgRating.dc = dictionary.avgRating.dc / dictionary.numMovies.dc;
      dictionary.avgVotes.dc = dictionary.avgVotes.dc / dictionary.numMovies.dc;
    }

    if(dictionary.numMovies.marvel != 0) {
      dictionary.avgRating.marvel = dictionary.avgRating.marvel / dictionary.numMovies.marvel;
      dictionary.avgVotes.marvel = dictionary.avgVotes.marvel / dictionary.numMovies.marvel;
    }

    vis.displayData.push(dictionary);

  })

  console.log(vis.displayData)

  vis.updateVis();
};


LineChartVis.prototype.updateVis = function(selection=null) {
  var vis = this;

  if(!selection){
      selection="boxOfficeWorldwide";
  }

  // define the lines
  vis.lineDC = d3.line()
  .x(function(d) { return vis.x(parseTime(d.year)); })
  .y(function(d) { return vis.y(d[selection].dc); });

  vis.lineMarvel = d3.line()
  .x(function(d) { return vis.x(parseTime(d.year)); })
  .y(function(d) { return vis.y(d[selection].marvel); });


  // Scale the range of the data

  vis.x.domain(d3.extent(vis.displayData, function(d) { return parseTime(d.year); }));
  vis.y.domain([0, d3.max(vis.displayData, function(d) {
      var dcValue = d[selection].dc;
      var marvelValue = d[selection].marvel;
      return Math.max(dcValue, marvelValue);
    })
  ]);


  // var DCPath = vis.svg.selectAll(".lineDC").data([vis.displayData]);

  // DCPath.enter().append("path").attr("class", "lineDC linechart").attr("d", vis.lineDC);

  // //DCPath.transition().duration().attr("d", vis.lineDC).attr("class", "lineDC linechart");
  // DCPath.exit().remove();


  this.svg.selectAll(".linechart").remove();

  // Add DC line path.
  var DCPath = vis.svg.append("path")
          .data([this.displayData])
          .attr("class", "lineDC linechart")
          .attr("d", vis.lineDC);

  // Add Marvel line path.
  vis.svg.append("path")
      .data([this.displayData])
      .attr("class", "lineMarvel linechart")
      .attr("d", vis.lineMarvel);

  

  vis.svg.selectAll(".axis").remove();

  // axis rotation code help from: https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
  // Add the X Axis
  vis.svg.append("g")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(d3.axisBottom(vis.x).tickFormat(d3.timeFormat("%Y")))
      .selectAll("text")
        .attr("class", "xAxis axis")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

  // Add the Y Axis
  this.svg.append("g")
      // tick format help from: https://stackoverflow.com/a/19908589
      .call(d3.axisLeft(vis.y).tickFormat(function(d) {return '$' +formatValue(d).replace("G","B")}))
      .selectAll("text")
      .attr("class", "yAxis axis");

  // add title
  this.svg.append("g")
    .attr("class","visTitle")
    .attr("transform", `translate(${vis.width/7},-10)`)
    .append("text")
      .text("Yearly Worldwide Box Office Revenues")
      .style("fill","black")
      .style("text-anchor","center");



};

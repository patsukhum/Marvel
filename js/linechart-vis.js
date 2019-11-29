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
  this.drawn = false;

  this.initVis();
};
LineChartVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 50,
    'bottom': 60,
    'left': 65,
    'right': 50
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.75;


  vis.svg = makeSvg(vis, 'linechart-vis');


  // create scales
  vis.x = d3.scaleTime().range([0, vis.width]);
  vis.y = d3.scaleLinear().range([vis.height, 0]);


  // initialize tooltip

  // code help from: http://bl.ocks.org/Caged/6476579
  vis.tipDC = d3.tip()
    .attr('class', 'd3-tip d3-tipDC')
    .offset([-10, 0]);

  vis.tipMarvel = d3.tip()
    .attr('class', 'd3-tip d3-tipMarvel')
    .offset([-10, 0]);




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
    // dictionary.avgRating = {dc: 0, marvel: 0};
    // dictionary.avgVotes = {dc: 0, marvel: 0};
    dictionary.movieNames = {dc:[], marvel:[]};
    // dictionary.pageViews = {dc: 0, marvel: 0};


    this.data.forEach(movie => {

      if(movie.Year == element) {

        if(movie['DC Film'] == "1") {
          dictionary.numMovies.dc += 1;
          dictionary.boxOfficeWorldwide.dc += movie.BoxOfficeWorldwide;
          // dictionary.avgRating.dc += movie.imdbRating;
          // dictionary.avgVotes.dc += movie.imdbVotes;
          dictionary.movieNames.dc.push(movie.Title);

        }
        else {
          dictionary.numMovies.marvel += 1;
          dictionary.boxOfficeWorldwide.marvel += movie.BoxOfficeWorldwide;
          // dictionary.avgRating.marvel += movie.imdbRating;
          // dictionary.avgVotes.marvel += movie.imdbVotes;
          dictionary.movieNames.marvel.push(movie.Title);
        }

      }
    })

    // average values
    // if(dictionary.numMovies.dc != 0) {
    //   dictionary.avgRating.dc = dictionary.avgRating.dc / dictionary.numMovies.dc;
    //   dictionary.avgVotes.dc = dictionary.avgVotes.dc / dictionary.numMovies.dc;
    // }

    // if(dictionary.numMovies.marvel != 0) {
    //   dictionary.avgRating.marvel = dictionary.avgRating.marvel / dictionary.numMovies.marvel;
    //   dictionary.avgVotes.marvel = dictionary.avgVotes.marvel / dictionary.numMovies.marvel;
    // }

    vis.displayData.push(dictionary);

  })

  console.log(vis.displayData)

  //vis.updateVis();
};


LineChartVis.prototype.updateVis = function() {
  var vis = this;

    selection="boxOfficeWorldwide";

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




  //  this.svg.selectAll(".linechart").remove();

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

  // add circles to graph
	// codes adapted from: https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
	var circle = this.svg.selectAll("circle").data(vis.displayData);


    circle.enter().append("circle")
		.attr("class", "tooltip-circle lineDC-circle") // Assign a class for styling
		.attr("cx", function(d) { return vis.x(parseTime(d.year)) })
		.attr("cy", function(d) { return vis.y(d[selection].dc) })
		.attr("r", 5)
		.on("mouseover", vis.tipDC.show)
    .on("mouseout", vis.tipDC.hide);

    circle.enter().append("circle")
		.attr("class", "tooltip-circle lineMarvel-circle") // Assign a class for styling
		.attr("cx", function(d) { return vis.x(parseTime(d.year)) })
		.attr("cy", function(d) { return vis.y(d[selection].marvel) })
		.attr("r", 5)
		.on("mouseover", vis.tipMarvel.show)
		.on("mouseout", vis.tipMarvel.hide);



  // drawing line chart effect help from: http://bl.ocks.org/markmarkoh/8700606
  /* Add 'curtain' rectangle to hide entire graph */
  var curtain = vis.svg.append('rect')
  .attr('x', -1 * (vis.width+5))
  .attr('y', -1 * (vis.height+5))
  .attr('height', vis.height+10)
  .attr('width', vis.width+10)
  .attr('class', 'curtain')
  .attr('transform', 'rotate(180)')
  .style('fill', '#ffffff')

  /* Create a shared transition for anything we're animating */
  var t = vis.svg.transition()
    .delay(750)
    .duration(4000)
    .ease(d3.easeLinear)

  t.select('rect.curtain')
    .attr('width', 0);


  //vis.svg.selectAll(".axis").remove();

  // axis rotation code help from: https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
  // Add the X Axis
  vis.svg.append("g")
      .attr("transform", `translate(0, ${vis.height+5})`)
      .call(d3.axisBottom(vis.x).tickFormat(d3.timeFormat("%Y")))
      .selectAll("text")
        .attr("class", "xAxis axis")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

  // Add the Y Axis
  this.svg.append("g")
      .attr("transform", `translate(-5, 0)`)
      // tick format help from: https://stackoverflow.com/a/19908589
      .call(d3.axisLeft(vis.y).tickFormat(function(d) {return '$' +formatValue(d).replace("G","B")}))
      .selectAll("text")
      .attr("class", "yAxis axis");

  // add title
  this.svg.append("g")
    .attr("class","visTitle")
    .attr("transform", `translate(${vis.width/2},-10)`)
    .append("text")
      .text("Yearly Worldwide Box Office Revenues")
      .style("fill","black")
      .style("text-anchor","middle");

  // add custom legend
  // code help from: https://www.d3-graph-gallery.com/graph/custom_legend.html

  var legend = this.svg.append("g").attr("class","legend")
        .attr("transform","translate(0,50)");
  legend.append("circle").attr("cx",50).attr("cy",20).attr("r", 6).style("fill", "#e23636")
  legend.append("circle").attr("cx",50).attr("cy",50).attr("r", 6).style("fill", "#0476F2")
  legend.append("text").attr("x", 60).attr("y", 20).text("Marvel").style("font-size", "15px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 60).attr("y", 50).text("DC Comics").style("font-size", "15px").attr("alignment-baseline","middle")

	// update tooltip
	vis.tipDC.html(function(d) {
    // append corresponding movie names
    var movieNames = "<ul>"
    for(name of Object.values(d.movieNames.dc)) {
      movieNames += "<li>"
      movieNames += name
      movieNames += "</li>"
    }
    if(movieNames == "<ul>") {
      movieNames = "None<br>";
    }
    else {
      movieNames += "</ul>";
    }
		return `Movies in ${d.year}: ${movieNames}Revenue: $${formatComma(d[selection].dc)}`;
	})
  vis.svg.call(vis.tipDC);

 	vis.tipMarvel.html(function(d) {
    // append corresponding movie names
    var movieNames = "<ul>"
    for(name of Object.values(d.movieNames.marvel)) {
      movieNames += "<li>"
      movieNames += name
      movieNames += "</li>"
    }
    if(movieNames == "<ul>") {
      movieNames = "None<br>";
    }
    else {
      movieNames += "</ul>";
    }

		return `Movies in ${d.year}: ${movieNames}Revenue: $${formatComma(d[selection].marvel)}`;
	})
  vis.svg.call(vis.tipMarvel);


  // create a horizontal revenue line for DC
  var line = vis.svg.append("g")
  line.append("line")
    .attr("class","horizontal-DCline")
    .style("stroke", "#0476F2")
    .style("stroke-width", 3)
    .style("stroke-dasharray", ("10,3"))
    .attr("x1", 0)   
    .attr("y1", 210) 
    .attr("x2", 420)  
    .attr("y2", 210);


  line.style("opacity", 0.0)
  .transition()
  .duration(1500).delay(5000)
  .style("opacity", 1);

  line.append("text")
    .attr('text-anchor', 'middle')
    .attr("x", 80)
    .attr("y", 205)
    .attr("class", "linechart-annotation")
    .text("DC Comic's maximum revenue")


    // add annotations
    // annotation code help from: https://bl.ocks.org/susielu/a464c24d8b42f0c4d9fafe7b48e9e60a, https://d3-annotation.susielu.com/
    const annotations = [{
        //below in makeAnnotations has type set to d3.annotationLabel
        //you can add this type value below to override that default
        type: d3.annotationCalloutCircle,
        note: {
          label: "No movies were released.",
          wrap: 120
        },
        //settings for the subject, in this case the circle radius
        subject: {
          radius: 30
        },
        x: 245,
        y: 310,
        dx: 50,
        dy: -30,
      },
      {
        type: d3.annotationCalloutCircle,
        note: {
          label: "Avengers:Endgame was a major hit.",
          wrap: 120
        },
        //settings for the subject, in this case the circle radius
        subject: {
          radius: 10
        },
        x: 415,
        y: 0,
        dx: -50,
        dy: 30,
      }
    
    ].map(function(d){ d.color = "grey"; return d})

      const makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations)

    
      var annotationsOnPlot = line.append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations);
      
      annotationsOnPlot.style("opacity", 0.0)
      .transition()
      .duration(700).delay(6500)
      .style("opacity", 1.0);

  vis.drawn = true;
};

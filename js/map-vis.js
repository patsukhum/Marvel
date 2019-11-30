/**
 * MapVis - Object constructor function
 *
 * Map Vis
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- Box Office Revenue data (w/ country names)
 * @param _mapData        -- GeoJSON data (w/ country ids)
 * @param _countryCodes   -- Mapping between country id and names
 * @constructor
 */

MapVis = function(_parentElement, _data, _mapData, _countryCodes, _auxData) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.allData = _data;
  this.mapDataRaw = _mapData;
  this.countryCodes = _countryCodes;
  this.auxData = _auxData;

  this.initVis();
};


MapVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 200,
    'bottom': 30,
    'left': 40,
    'right': 40
  };
  vis.width = 1100- vis.margin.left - vis.margin.right;
  vis.height = 100;
  vis.svg = makeSvg(vis, 'map-vis');

  vis.tooltip = d3.select('body').append('g')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  vis.color = d3.scaleThreshold();

  vis.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  vis.selectedMovie = vis.allData[0];
  vis.nameToAllDataIdx = {};
  vis.allData.forEach((d, i) => {
    vis.nameToAllDataIdx[d.Name] = i;
  })

  // Column 2
  vis.xCol2 = 650;
  vis.barY = d3.scaleBand()
    .range([vis.height, 0]);

  vis.barX = d3.scaleLinear()
    .range([0, vis.width]);

  vis.svgCol2 = vis.svg.append("g")
    .attr("class", "map-col2")
    .attr("transform", "translate(" + vis.xCol2 +
      ",-120)");


  vis.svgCol2.append("text")
    .attr("class", "col2-text")
    .text('IMDB')
    .attr("x", 0)
    .attr("y", 70)
    .attr("fill", "black")
    .style("font-size", 15);

  vis.svgCol2.append("text")
    .attr("class", "col2-text")
    .text('Metacritic')
    .attr("x", 0)
    .attr("y", 90)
    .attr("fill", "black")
    .style("font-size", 13);

  var options = {
    max_value: 5,
    step_size: 0.1,
    initial_value: 5,
  }
  var options2 = {
    max_value: 5,
    step_size: 0.1,
    initial_value: 5,
  }

  $(".stars-imdb").rate(options);
  $(".stars-meta").rate(options2);

  vis.mapGroup = vis.svg.append("g")
    .attr('class', 'map');

  vis.svg.append("g")
    .append("text")
    .attr("class", "legend-text")
    .text('Gross Revenue ($)')
    .attr("x", 23)
    .attr("y", -10)
    .attr("fill", "black")
    .style("font-size", 15);

  var pieXOffset = 250;
  var pieYOffset = 60;
  vis.pieGroup = vis.svgCol2.append("g")
    .attr("class", "pie-group")
    .attr("transform", "translate(" + pieXOffset +
      "," + pieYOffset + ")");

  vis.wrangleData();
};

MapVis.prototype.wrangleData = function() {
  var vis = this;

  vis.mapData = topojson.feature(vis.mapDataRaw, vis.mapDataRaw.objects.countries).features;

  vis.idToCountry = {};
  vis.countryToId = {};
  vis.countryCodes.forEach((d) => {
    vis.idToCountry[+d['country-code']] = d.name;
    vis.countryToId[d.name] = +d['country-code'];
  })

  vis.auxData.forEach((d) => {
    d.imdbRating = +d.imdbRating;
    d.Metascore = +d.Metascore;
    d.Year = +d.Year;
    d.Domestic = +d.Domestic;
    d.International = +d.International;
  })

  vis.movieYearRangeArr = [
    [],
    [],
    []
  ];

  vis.auxData.forEach((d) => {
    if (d.Year <= 2013) {
      vis.movieYearRangeArr[0].push(d.Title);
    } else if (d.Year <= 2017) {
      vis.movieYearRangeArr[1].push(d.Title);
    } else {
      vis.movieYearRangeArr[2].push(d.Title);
    }
  });

  vis.updateDataSelection();
  vis.updateVis();
};


MapVis.prototype.updateDataSelection = function() {
  var vis = this;

  vis.movieNames = vis.data.map((d) => d.Name);
  var curMovie = [];
  var movieKeys = Object.keys(vis.selectedMovie)
  for (var key of movieKeys) {
    if (key in vis.countryToId) {
      var obj = {
        'Market': key,
        'Gross': vis.selectedMovie[key]
      };
      curMovie.push(obj);
    }
  }
  vis.data = curMovie;

  var allCountryIds = []
  vis.data.forEach((d) => {
    var countryId = vis.countryToId[d.Market];
    allCountryIds.push(countryId);

    d.Gross = +d.Gross;
  })

  var countriesExcluded = ['Antarctica', 'Fiji', 'French Southern Territories']
  vis.countryInfo = vis.mapData.filter((d) => {
    var countryName = vis.idToCountry[d.id];
    return !countriesExcluded.includes(countryName);
  });

  vis.idToRevenue = {};
  vis.data.forEach((d) => {
    vis.idToRevenue[vis.countryToId[d.Market]] = d.Gross;
  })

  var sorted = vis.data.sort((a, b) => a.Gross > b.Gross ? -1 : 1);
  vis.topGross = sorted.slice(0, 3);

  vis.updateVis();
};

MapVis.prototype.updateVis = function() {
  var vis = this;

  vis.color.domain([0.1, 100000, 1000000, 10000000, 100000000, 500000000, 1000000000]);

  var emptyColor = ["lightgray"];
  var colors = emptyColor.concat(d3.schemeReds[6]);
  vis.color.range(colors);

  var projection = d3.geoMercator()
    .translate([320, vis.height-60])
    .center([0, 0]).scale(73);

  var chmap = vis.mapGroup.selectAll(".mapPath")
    .data(vis.countryInfo);

  chmap.enter()
    .append("path")
    .attr("class", "mapPath")
    .attr("d", d3.geoPath()
      .projection(projection)
    )
    .merge(chmap)
    .on("mouseover", (d) => {
      vis.tooltip.transition()
        .duration(800)
        .style("opacity", .8);
      var txt = vis.idToCountry[d.id] + "<br>" + formatRevenue(vis.idToRevenue[d.id]);
      vis.tooltip.html(txt)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", (d) => {
      vis.tooltip.transition()
        .duration(600).style("opacity", 0);
    })
    .attr("fill", function(d, i) {
      if (d.id in vis.idToRevenue)
        return vis.color(vis.idToRevenue[d.id]);
      return vis.color(0);
    });
  chmap.exit().remove();

  // Map legend
  var legendHeight = 130;
  var length = vis.color.range().length;

  var yLegend = d3.scaleLinear()
    .domain([1, length - 1])
    .rangeRound([legendHeight * (length - 1) / length, legendHeight / length]);

  var legendRects = vis.svg.selectAll(".legend-rect")
    .data(vis.color.range());

  legendRects.enter()
    .append("rect")
    .attr("class", "legend-rect")
    .merge(legendRects)
    .attr("x", (d, i) => {
      return 30;
    })
    .attr("y", (d, i) => {
      return yLegend(i) - 20;
    })
    .attr("width", (d) => {
      return 20;
    })
    .attr("height", (d) => {
      return 20;
    })
    .attr("fill", (d) => d);
  legendRects.exit().remove();

  var legendTexts = ['No Data', '0-100K', '100K-1M', '1M-10M', '10M-100M', '100M-500M', '500M-1B'];
  var texts = vis.svg.selectAll(".texts")
    .data(legendTexts);

  texts.enter()
    .append("text")
    .attr("class", "texts")
    .merge(texts)
    .attr("x", (d, i) => {
      return 55;
    })
    .attr("y", (d, i) => {
      return -5 + yLegend(i);
    })
    .text((d, i) => {
      return d;
    })
    .attr("fill", "black")
    .style("font-size", 11)
    .style("text-anchor", "start");
  texts.exit().remove();

  // Col 2 movie title header
  var movieTitle = vis.svgCol2.selectAll(".movie-name")
    .data([vis.selectedMovie])

  movieTitle.enter()
    .append("text")
    .merge(movieTitle)
    .attr("class", "movie-name")
    .attr("x", 0)
    .attr("y", 10)
    .text((d) => {
      return d.Name;
    })
    .call(wrap, 400)
    .attr("fill", "black")
  movieTitle.exit().remove();

  // Col 2 Charts
  var selectedMovieAux = vis.auxData.filter((d) => {
    return vis.selectedMovie.Name === d.Title;
  })[0];

  $(".stars-imdb .rate-select-layer").css("width", selectedMovieAux['imdbRating'] / 5 * 100);
  $(".stars-meta .rate-select-layer").css("width", selectedMovieAux['Metascore'] / 5 * 100);

  // Pie chart
  var pieData = {
    'International': selectedMovieAux['International'],
    'Domestic': selectedMovieAux['Domestic'],
  }

  var radius = 40;

  var piecolor = d3.scaleOrdinal()
    .domain(["International", "Domestic"])
    .range(['#3268bd', '#A2CD48']);

  var pie = d3.pie()
    .value(function(d) {
      return d.value;
    })
  var data_ready = pie(d3.entries(pieData))

  var pieXOffset = 250;
  var pieYOffset = 60;
  var u = vis.pieGroup.selectAll(".pie")
    .data(data_ready)

  var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

  u.enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d) {
      return (piecolor(d.data.key))
    })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1)

  vis.pieGroup
    .selectAll('.pie')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function(d) {
      return d.data.value + '%';
    })
    .attr("transform", function(d) {
      var centroid = arcGenerator.centroid(d);
      // var x = centroid[0] + pieXOffset;
      // var y = centroid[1] + pieYOffset;
      var x = centroid[0];
      var y = centroid[1];
      return "translate(" + x + "," + y + ")";
    })
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .style('fill', 'white')

  var pieLegends = ['Domestic', 'International', ];
  var pieColors = ['#A2CD48', '#3268bd'];
  var legendPie = vis.svgCol2.selectAll(".pie-legend")
    .data(pieColors);

  legendPie.enter()
    .append("rect")
    .attr("class", "pie-legend")
    .merge(legendPie)
    .attr("x", (d, i) => {
      return 310;
    })
    .attr("y", (d, i) => {
      return 30 + 15 * (i);
    })
    .attr("width", (d) => {
      return 10;
    })
    .attr("height", (d) => {
      return 10;
    })
    .attr("fill", (d) => d);
  legendPie.exit().remove();

  var legendPieText = vis.svgCol2.selectAll(".pie-legend-text")
    .data(pieLegends);

  legendPieText.enter()
    .append("text")
    .attr("class", "pie-legend-text")
    .merge(legendPieText)
    .attr("x", (d, i) => {
      return 325;
    })
    .attr("y", (d, i) => {
      return 40 + 15 * (i);
    })
    .text((d) => d)
    .attr("fill", (d, i) => pieColors[i])
    .style('font-size', 13);
  legendPieText.exit().remove();


  vis.barX.domain(d3.extent(vis.topGross, function(d) {
    return d.value;
  }));
  var keys = vis.topGross.map((d) => d.Market);

  vis.barY.domain(keys);
  var rects = vis.svgCol2.selectAll(".rects")
    .data(vis.topGross);

  rects.enter()
    .append("rect")
    .attr("class", "rects")
    .merge(rects)
    .transition()
    .duration(800)
    .attr("y", function(d, i) {
      return 120 + i * 20;
    })
    .attr("x", function(d) {
      return 20;
    })
    .attr("width", function(d) {
      return d.Gross / 3000000;
    })
    .attr("height", function(d) {
      return 15;
    })
    .attr("fill", (d) => {
      return vis.color(d.Gross);
    });
  rects.exit().remove();

  var topCountryNames = vis.svgCol2.selectAll(".top-country-names")
    .data(vis.topGross)

  topCountryNames.enter()
    .append("text")
    .merge(topCountryNames)
    .attr("class", "top-country-names")
    .attr("x", function(d) {
      return 0;
    })
    .attr("y", function(d, i) {
      return 130 + i * 20;
    })
    .text((d) => {
      return mapCountryName(d.Market);
    })
    .attr("fill", "gray")
    .style("text-anchor", "end")
    .style("font-size", "13");
  topCountryNames.exit().remove();

  var values = vis.svgCol2.selectAll(".values")
    .data(vis.topGross)

  values.enter()
    .append("text")
    .merge(values)
    .attr("class", "values")
    .attr("x", function(d) {
      return d.Gross / 3000000 + 30;
    })
    .attr("y", function(d, i) {
      return 130 + i * 20;
    })
    .text((d) => {
      return formatMillions(d.Gross);
    })
    // .attr("fill", "gray")
    .attr("fill", (d) => {
      return vis.color(d.Gross);
    })
    .style("font-size", "13");
  values.exit().remove();
}

function createRange(maxVal, numCounts) {
  var ret = [0];
  for (var i = 1; i < numCounts; i++) {
    ret.push(i * maxVal / numCounts);
  }
  return ret;
}

function formatRevenue(num) {
  if (num === 0 || num === undefined) {
    return "No Data";
  }
  return "$" + formatMillions(num);

}

function mapCountryName(name) {
  var mapping = {
    'United States of America': 'USA',
    'United Kingdom of Great Britain and Northern Ireland': 'UK',
    'Korea, Republic of': 'South Korea'
  };
  if (name in mapping) {
    return mapping[name];
  }
  return name;
}

function clicked(i, vis) {
  console.log(i);
  vis.selectedMovie = vis.allData[i];
  vis.updateDataSelection();
}

function formatMillions(num) {
  num = +num;
  if (num >= 1000000000) {
    num1 = Math.floor(num / 1000000000);
    num2 = Math.floor(num % 1000000000 / 1000000);
    return num1 + "." + num2 + "B";
  } else if (num >= 1000000) {
    num = Math.floor(num / 1000000);
    return num + "M";
  } else if (num >= 1000) {
    num = Math.floor(num / 1000);
    return num + "K";
  }
  return num;
}

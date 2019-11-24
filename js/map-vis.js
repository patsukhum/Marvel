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

MapVis = function(_parentElement, _data, _mapData, _countryCodes) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.allData = _data;
  this.mapDataRaw = _mapData;
  this.countryCodes = _countryCodes;

  console.log(this.data);
  this.initVis();
};


MapVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  // vis.width = 1000 - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 1;
  vis.svg = makeSvg(vis, 'map-vis');

  vis.tooltip = d3.select('body').append('g')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // vis.color = d3.scaleQuantile();
  vis.color = d3.scaleThreshold();

  vis.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  vis.selectedMovie = vis.allData[0];
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

  // test begin
  // vis.selectedMovie = vis.data[0];

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
  // vis.dataRange = vis.data.filter((d) => {
  //   return d['Market'] !== 'United States of America' && d['Market'] !== 'China';
  // })
  console.log("vis.data");
  console.log(vis.allData);

  // test end

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

  // vis.countryInfo.forEach((d) => {
  //   var country = idToCountry[d.id];
  //   d.Gross = vis.mapData.reduce((d) => d.country);
  // });
  vis.idToRevenue = {};
  vis.data.forEach((d) => {
    vis.idToRevenue[vis.countryToId[d.Market]] = d.Gross;
  })

  vis.updateVis();
};


MapVis.prototype.updateVis = function() {
  var vis = this;
  // --> Choropleth implementation
  // var maxVal = d3.max(vis.dataRange, (d) => {
  //   return d.Gross;
  // });

  vis.color.domain([0.1, 100000, 1000000, 10000000, 100000000, 500000000, 1000000000]);
  console.log('vis.color.domain')
  console.log(vis.color.domain)
  // vis.color.range(d3.schemeReds[8].slice(2, 8));
  var emptyColor = ["lightgray"];
  var colors = emptyColor.concat(d3.schemeReds[6]);

  vis.color.range(colors);
  console.log(colors)
  console.log(vis.color(0));
  console.log(vis.color(2));
  console.log(vis.color(800000000));

  console.log(d3.schemeReds[8].slice(3, 8));
  // var rangeArr = createRange(maxVal, 8);

  var projection = d3.geoConicEqualArea()
    .translate([vis.width / 4, vis.height / 5])
    .center([0, 0]).scale(100);

  var chmap = vis.svg.append("g")
    .selectAll("path")
    .data(vis.countryInfo);

  var allColors = new Set();
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
      // var code = d.properties.adm0_a3_is;
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
      // allColors.add(vis.color(vis.idToRevenue[d.id]));
      // if (d['Market'] === 'United States of America' && d['Market'] === 'China')
      //   return vis.color(maxVal);
      // return vis.color(vis.idToRevenue[d.id]);
    });
  chmap.exit().remove();

  vis.svg.selectAll('text')
    .data(vis.movieNames)
    .enter().append('text')
    .attr('x', (d, i) => 20 + 145 * (i % 8))
    .attr('y', (d, i) => {
      if (i < 8)
        return 300;
      else if (i < 16)
        return 350;
      else
        return 400;
    })
    .text((d) => d)
    .attr('class', 'film-title')
    .on('mouseover', function(d, i) {
      clicked(d, i, vis);
      d3.select(this)
        .style('fill', 'red')
        .style('text-decoration', 'underline')
    })
    .on('mouseout', function(d, i) {
      d3.select(this)
        .style('fill', 'black')
        .style('text-decoration', 'none');
    });

  // LEGEND

  var legendHeight = 130;
  var length = vis.color.range().length;

  var yLegend = d3.scaleLinear()
    .domain([1, length - 1])
    .rangeRound([legendHeight * (length - 1) / length, legendHeight / length]);

  var rects = vis.svg.selectAll("rect")
    .data(vis.color.range());

  rects.enter()
    .append("rect")
    .attr("class", "rects")
    .merge(rects)
    .attr("x", (d, i) => {
      return 0;
    })
    .attr("y", (d, i) => {
      return 80 + yLegend(i);
    })
    .attr("width", (d) => {
      return 20;
    })
    .attr("height", (d) => {
      return 20;
    })
    .attr("fill", (d) => d);
  rects.exit().remove();

  var legendTexts = ['No Data', '0-100K', '100K-1M', '1M-10M', '10M-100M', '100M-500M', '500M-1B'];
  var texts = vis.svg.selectAll(".texts")
    .data(legendTexts);

  texts.enter()
    .append("text")
    .attr("class", "texts")
    .merge(texts)
    .attr("x", (d, i) => {
      return 30;
    })
    .attr("y", (d, i) => {
      return 95 + yLegend(i);
    })
    .text((d, i) => {
      return d;
    })
    .attr("fill", "black")
    .style("font-size", 11)
    .style("text-anchor", "start");
  texts.exit().remove();

  vis.svg.append("g")
    .append("text")
    .attr("class", "legend-text")
    .text('Gross Revenue')
    .attr("x", 0)
    .attr("y", 90)
    .attr("fill", "black")
    .style("font-size", 15);

  var xCol2 = 650;
  vis.svgCol2 = vis.svg.append("g")
    .attr("class", "map-col2")
    .attr("transform", "translate(" + xCol2 +
      ",0)");

  vis.svgCol2.append("text")
    .attr("class", "col2-text")
    .text('[MOVIE NAME]')
    .attr("x", 0)
    .attr("y", 30)
    .attr("fill", "black")
    .style("font-size", 15);

  vis.svgCol2.append("text")
    .attr("class", "col2-text")
    .text('Metacritic')
    .attr("x", 0)
    .attr("y", 70)
    .attr("fill", "black")
    .style("font-size", 15);

  vis.svgCol2.append('text')
    .attr('font-family', 'FontAwesome')
    .style('font-size', '20')
    .attr('x', 80)
    .attr('y', 70)
    .text(function(d) {
      return '\uf005 \uf005 \uf005 \uf005 \uf005'
    });


  vis.svgCol2.append("text")
    .attr("class", "col2-text")
    .text('IMDB')
    .attr("x", 0)
    .attr("y", 90)
    .attr("fill", "black")
    .style("font-size", 13);

  vis.svgCol2.append('text')
    .attr('font-family', 'FontAwesome')
    .style('font-size', '20')
    .attr('x', 80)
    .attr('y', 90)
    .text(function(d) {
      return '\uf005 \uf005 \uf005 \uf005 \uf005'
    });

  // var data1 = {
  //   a: 9,
  //   b: 20,
  //   c: 30,
  //   d: 8,
  //   e: 12
  // }
  //
  // var radius = Math.min(width, height) / 2 - margin
  // var color = d3.scaleOrdinal()
  //   .domain(["a", "b", "c", "d", "e", "f"])
  //   .range(d3.schemeDark2);
  //
  // var width = 450,
  //   height = 450,
  //   margin = 40;
  //
  //
  //
  // // Compute the position of each group on the pie:
  // var pie = d3.pie()
  //   .value(function(d) {
  //     return d.value;
  //   })
  //   .sort(function(a, b) {
  //     console.log(a);
  //     return d3.ascending(a.key, b.key);
  //   }) // This make sure that group order remains the same in the pie chart
  // var data_ready = pie(d3.entries(data1))
  // console.log('data_ready')
  // console.log(data_ready)
  // // map to data
  // var u = vis.svgCol2.selectAll(".pie")
  //   .data(data_ready)
  //
  // // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  // u.enter()
  //   .append('path')
  //   .attr("class", "pie")
  //   .merge(u)
  //   .transition()
  //   .duration(1000)
  //   .attr('d', d3.arc()
  //     .innerRadius(0)
  //     .outerRadius(radius)
  //   )
  //   .attr('fill', function(d) {
  //     return (color(d.data.key))
  //   })
  //   .attr("stroke", "white")
  //   .style("stroke-width", "2px")
  //   .style("opacity", 1)
  //
  // u.exit()
  //   .remove()
  //
  //

}

function createRange(maxVal, numCounts) {
  var ret = [0];
  for (var i = 1; i < numCounts; i++) {
    ret.push(i * maxVal / numCounts);
  }
  return ret;
}

function formatRevenue(num) {
  // TODO
  return "$" + num;

}

function clicked(d, i, vis) {
  console.log(i);
  vis.selectedMovie = vis.allData[i];
  console.log(vis.selectedMovie);
  vis.wrangleData();
  vis.updateVis();
}

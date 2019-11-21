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
  this.mapDataRaw = _mapData;
  this.countryCodes = _countryCodes;

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
  vis.height = vis.width * 1;
  vis.svg = makeSvg(vis, 'map-vis');

  vis.tooltip = d3.select('body').append('g')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  vis.color = d3.scaleQuantile();

  vis.tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

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

  // vis.data = vis.data.filter((d) => {
  //   return d.Market != 'United States of America';
  // })

  var allCountryIds = []
  vis.data.forEach((d) => {
    var countryId = vis.countryToId[d.Market];
    allCountryIds.push(countryId);

    d.Opening = +d.Opening;
  })

  vis.countryInfo = vis.mapData.filter((d) => {
    return allCountryIds.includes(d.id);
  })

  // vis.countryInfo.forEach((d) => {
  //   var country = idToCountry[d.id];
  //   d.Opening = vis.mapData.reduce((d) => d.country);
  // });
  vis.idToRevenue = {};
  vis.data.forEach((d) => {
    vis.idToRevenue[vis.countryToId[d.Market]] = d.Opening;
  })

  vis.updateVis();
};


MapVis.prototype.updateVis = function() {
  var vis = this;
  // --> Choropleth implementation
  var maxVal = d3.max(vis.data, (d) => {
    return d.Opening;
  });
  var rangeArr = createRange(maxVal, 5);
  vis.color.domain([0, maxVal]);
  vis.color.range(d3.schemeBlues[8].slice(3, 8));

  console.log(d3.schemeBlues[8].slice(3, 8));
  // var rangeArr = createRange(maxVal, 8);
  var width = 600;
  var height = 600;
  var projection = d3.geoConicEqualArea()
    .translate([width / 3, height / 3])
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
      var txt = vis.idToCountry[d.id]+"<br>"+formatRevenue(vis.idToRevenue[d.id]);
      vis.tooltip.html(txt)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", (d) => {
      vis.tooltip.transition()
        .duration(600).style("opacity", 0);
    })
    .attr("fill", function(d, i) {
      allColors.add(vis.color(vis.idToRevenue[d.id]));
      return vis.color(vis.idToRevenue[d.id]);
    });
  chmap.exit().remove();
  console.log(allColors);
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
  return "$"+num;

}

/**
 * CookieChartVis - Object constructor function
 *
 * Cookie Chart (Force Layout Graph) showing revenues of
 * movies by genre data
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- Genres of movies data
 * @constructor
 */
// Forced layout starter reference: https://www.d3indepth.com/force-layout/

CookieChartVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.drawn = false;

  this.initVis();
};


CookieChartVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 100,
    'bottom': 10,
    'left': 20,
    'right': 10
  };
  vis.width = $('#' + vis.parentElement).width() +30 - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.8;
  vis.svg = makeSvg(vis, 'cookiechart-vis');

  vis.tooltip = d3.select('body').append('g')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  vis.wrangleData();
};

CookieChartVis.prototype.wrangleData = function() {
  var vis = this;

  var allGenres = new Set();

  console.log(vis.data)
  vis.data.forEach((d) => {
    d.revenues = +d.revenues;
    allGenres.add(d.genres);
  })

  console.log(allGenres)
  vis.genreToIdx = {};
  vis.idxToGenre = [];

  // Need to create idx for the loop b/c looping through set
  var idx = 0;
  allGenres.forEach((d) => {
    vis.genreToIdx[d] = idx;
    vis.idxToGenre.push(d);
    idx += 1;
  });
  console.log(vis.idxToGenre)

  //vis.updateVis();
};


CookieChartVis.prototype.updateVis = function() {
  var vis = this;

  var width = vis.width,
    height = vis.height;

  var colorScale = ['pink', 'darkred', 'black', 'lightblue', 'green', 'orange', "#e23636", 'gray', "#0476F2"];

  // Generate x and y center locations for clusters
  var xCenter = []
  for (var i = 0; i < 3; i++) {
    var init = 90;
    for (var j = 0; j < 3; j++) {
      var offset = 220;
      xCenter.push(init + offset * j);
    }
  }

  var yCenter = []
  for (var i = 0; i < 3; i++) {
    var pos = 200 * i;
    for (var j = 0; j < 3; j++) {
      yCenter.push(pos);
    }
  }

  console.log(xCenter)

  vis.nodes = [];
  vis.data.forEach((d, i) => {
    vis.nodes.push({
      radius: d.revenues / 60000000,
      category: vis.genreToIdx[d.genres],
      name: d.title,
      revenue: d.revenues
    })
  });

  var simulation = d3.forceSimulation(vis.nodes)
    .force('charge', d3.forceManyBody().strength(0))
    .force('x', d3.forceX().x(function(d) {
      return xCenter[d.category];
    }))
    .force('y', d3.forceY().y(function(d) {
      return yCenter[d.category];
    }))
    .force('collision', d3.forceCollide().radius(function(d) {
      return d.radius;
    }))
    .on('tick', ticked);

  function ticked() {
    vis.u = d3.select('svg g')
      .selectAll('circle')
      .data(vis.nodes);

    vis.u.enter()
      .append('circle')
      .attr('r', function(d) {
        return d.radius;
      })
      .on('mouseover', d => vis.nodeMouseover(d, vis))
      .on('mouseout', d => vis.nodeMouseout(d, vis))
      .style('fill', function(d) {
        return colorScale[d.category];
      })
      .style('opacity', 0.77)
      .merge(vis.u)
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      })

    vis.u.exit().remove();
  }

  var xOffsetText = 0;
  var yOffsetText = 0;
  var texts = vis.svg.selectAll("text")
    .data(vis.idxToGenre);

  texts.enter()
    .append("text")
    .attr("class", "texts genre-label")
    .merge(texts)
    .attr("x", (d, i) => {
      return xCenter[i] - xOffsetText;
    })
    .attr("y", (d, i) => {
      return yCenter[i] - yOffsetText;
    })
    .text((d, i) => {
      return d;
    })
    .attr("fill", "black")
    .style("text-anchor","middle");
  texts.exit().remove();

  vis.drawn = true;
}

CookieChartVis.prototype.nodeMouseover = function(d, vis) {
  vis.u.filter(function(data) { return data == d; })
    .style('stroke', 'darkgray')
    .style('stroke-width', '3px');

  vis.tooltip.transition()
    .style('opacity', 0.8);

  vis.tooltip.html(`<h4>${d.name}</h4>` +`<p>Revenue: ${formatMillions(d.revenue)}</p>`)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY + 10) + "px");


};

CookieChartVis.prototype.nodeMouseout = function(d, vis) {
  vis.tooltip.transition()
    .duration(100)
    .style("opacity", 0);

  vis.u.style('stroke', 'none')
    .style('stroke-width', 'none');
};

function formatMillions(num) {
  num = +num;
  if (num >= 1000000000) {
    num1 = Math.floor(num / 1000000000);
    num2 = Math.floor(num%1000000000 / 1000000);
    return num1+"."+num2 + "B";
  } else if (num >= 1000000) {
    num = Math.floor(num / 1000000);
    return num + "M";
  }
  return num;
}

/**
 * CookieChartVis - Object constructor function
 *
 * Cookie Chart (officially called Circle Packing Chart) showing revenues of
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

  this.initVis();
};


CookieChartVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 40,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 1;
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

  console.log('vis.data')
  console.log(vis.data)
  vis.data.forEach((d) => {
    d.revenues = +d.revenues;
    allGenres.add(d.genres);
  })

  vis.genreToIdx = {};
  vis.idxToGenre = [];
  var idx = 0;

  allGenres.forEach((d) => {
    vis.genreToIdx[d] = idx;
    vis.idxToGenre.push(d);
    idx += 1;
  });

  vis.updateVis();
};


CookieChartVis.prototype.updateVis = function() {
  var vis = this;

  var width = vis.width,
    height = vis.height;

  var colorScale = ['pink', 'darkred', 'black', 'lightblue', 'green', 'orange', 'red', 'gray', 'blue'];

  var xCenter = []
  for (var i = 0; i < 3; i++) {
    var init = 100;
    for (var j = 0; j < 3; j++) {
      var offset = 350;
      xCenter.push(init + offset * j);
    }
  }

  var yCenter = []
  for (var i = 0; i < 3; i++) {
    var pos = 200 + 300 * i;
    for (var j = 0; j < 3; j++) {
      yCenter.push(pos);
    }
  }

  var nodes = [];
  vis.data.forEach((d, i) => {
    nodes.push({
      radius: d.revenues / 50000000,
      category: vis.genreToIdx[d.genres],
      name: d.title,
      revenue: d.revenues
    })
  });

  var simulation = d3.forceSimulation(nodes)
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
    var u = d3.select('svg g')
      .selectAll('circle')
      .data(nodes);

    u.enter()
      .append('circle')
      .attr('r', function(d) {
        return d.radius;
      })
      .on('mouseover', d => vis.nodeMouseover(d, vis))
      .on('mouseout', d => vis.nodeMouseout(d, vis))
      .style('fill', function(d) {
        return colorScale[d.category];
      })
      .style('opacity', 0.8)
      .merge(u)
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      })

    u.exit().remove();
  }

  var texts = vis.svg.selectAll("text")
    .data(vis.idxToGenre);

  texts.enter()
    .append("text")
    .attr("class", "texts")
    .merge(texts)
    .attr("x", (d, i) => {
      return xCenter[i] - 80;
    })
    .attr("y", (d, i) => {
      return yCenter[i] - 120;
    })
    .text((d, i) => {
      return d;
    })
    .attr("fill", "black");
  texts.exit().remove();
}

CookieChartVis.prototype.nodeMouseover = function(d, vis) {
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
};
CookieChartVis.prototype.nodeMousemove = function(d, vis) {
  vis.tooltip.style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY + 10) + "px");
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

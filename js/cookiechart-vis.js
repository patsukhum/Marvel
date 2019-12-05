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

CookieChartVis = function(_parentElement, _data, _data1, _data2, _data3, _data4) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.dataStage1 = _data1;
  this.dataStage2 = _data2;
  this.dataStage3 = _data3;
  this.dataStage4 = _data4;
  this.drawn = false;

  this.initVis();
};


CookieChartVis.prototype.initVis = function() {
  var vis = this;

  vis.stage = 1;
  vis.margin = {
    'top': 100,
    'bottom': 10,
    'left': 20,
    'right': 10
  };

  vis.width = $('#' + vis.parentElement).width() + 30 - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.8 - vis.margin.top;

  vis.svg = makeSvg(vis, 'cookiechart-vis');

  vis.tooltip = d3.select('body').append('g')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Generate x and y center locations for clusters
  vis.xCenter = [];
  vis.xCenterText = [];
  for (var i = 0; i < 3; i++) {
    var init = 90;
    for (var j = 0; j < 3; j++) {
      var offset = 220;
      vis.xCenter.push(init + offset * j);
      vis.xCenterText.push(init + offset * j);
    }
  }

  vis.yCenter = [];
  vis.yCenterText = [];
  for (var i = 0; i < 3; i++) {
    var pos = 200 * i;
    for (var j = 0; j < 3; j++) {
      vis.yCenter.push(pos);
      var textOffset = 100;
      if (i === 2)
        vis.yCenterText.push(pos - textOffset * 1.1);
      else
        vis.yCenterText.push(pos + textOffset);
    }
  }

  // Used to indicate combined genres for stage 2
  vis.specialGenres = [6, 7, 8];

  var rect = [5];
  vis.svg.select('.scroll-rect')
    .data(rect)
    .enter()
    .append('rect')
    .attr("x", (d, i) => {
      return 30;
    })
    .attr("y", (d, i) => {
      return 50;
    })
    .attr("width", (d) => {
      return 320;
    })
    .attr("height", (d) => {
      return 320;
    })
    .attr("fill", 'black');

  //// slider ///// https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763?fbclid=IwAR2cq8_8uLWVqEyuU-XYEY-m6g4yIoUmXuiV3X0TUgnzJBTKQ_a_4WAc24w

  vis.slidersvg = d3.select('#slider')
    .append('svg')
    .attr('width', vis.width)
    .attr('height', 60);

  var currentValue = 0;

  var x = d3.scaleLinear()
    .domain([0, 3])
    .range([0, vis.width - vis.margin.left - vis.margin.right])
    .clamp(true);

  var slider = vis.slidersvg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + vis.margin.left + "," + 30 + ")");

  slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "track-inset")
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "track-overlay")
    .call(d3.drag()
      .on("start.interrupt", function() {
        slider.interrupt();
      })
      .on("start drag", function() {
        currentValue = d3.event.x;
        update(x.invert(currentValue));
      })
    );

  slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(3))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d
    });

  //dragging handle
  var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

  function update(h) {
    var h = Math.round(h)
    handle.attr("cx", x(h));
    vis.toggleCookie(h);
  }


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
};

CookieChartVis.prototype.toggleCookie2 = function() {
  var vis = this;
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vis.titleToInfo));
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "data.json");
  dlAnchorElem.click();
  vis.updateVis();
}

CookieChartVis.prototype.toggleCookie = function(h) {
  var vis = this;

  vis.stage = Math.floor(h) % 4 + 1;

  vis.updateVis();
}

CookieChartVis.prototype.updateVis = function() {
  var vis = this;

  var width = vis.width,
    height = vis.height;

  vis.colorScale = ['purple', 'darkred', 'black', 'darkblue', 'green', 'orange', "#e23636", 'gray', "#0476F2"];


  vis.nodes = [];
  vis.data.forEach((d, i) => {
    var genre = vis.genreToIdx[d.genres];
    if (vis.stage === 2 && (genre === 6 || genre === 8)) {
      genre = 5;
    }
    vis.nodes.push({
      radius: d.revenues / 60000000,
      category: genre,
      name: d.title,
      revenue: d.revenues
    })
  });

  // Non-Simulation
  vis.drawCircles();

  // vis.runSimulation();
  vis.yOffsetTextHover = {
    0: 120,
    1: 120,
    2: 80,
    3: 120,
    4: 120,
    5: 130,
    6: -130,
    7: -80,
    8: -70
  };

  var xOffsetText = 0;
  var yOffsetText = 0;
  vis.texts = vis.svg.selectAll("text")
    .data(vis.idxToGenre);

  vis.texts.enter()
    .append("text")
    .attr("class", "texts genre-label")
    .merge(vis.texts)
    .attr("x", (d, i) => {
      if (vis.stage === 1)
        return vis.xCenter[4] - xOffsetText;
      if (vis.stage === 4 && d === 'Marvel') {
        return vis.xCenter[3] - xOffsetText;
      } else if (vis.stage === 4 && d === 'DC') {
        return vis.xCenter[5] - xOffsetText;
      }
      return vis.xCenter[i] - xOffsetText;
    })
    .attr("y", (d, i) => {
      if (vis.stage === 1)
        return vis.yCenter[4] - yOffsetText;
      if (vis.stage === 4 && d === 'Marvel') {
        return vis.yCenter[3] - yOffsetText;
      } else if (vis.stage === 4 && d === 'DC') {
        return vis.yCenter[5] - yOffsetText;
      }
      return vis.yCenter[i] * 1.1 - yOffsetText - 25;
    })
    .text((d, i) => {
      if (vis.stage === 1) {
        if (i === 0) {
          return 'All Genres'
        }
        return "";
      } else if (vis.stage === 2) {
        if (d === 'Marvel' || d === 'DC') {
          return "";
        }
      } else if (vis.stage === 4) {
        if (d !== 'Marvel' && d !== 'DC') {
          return "";
        }
      }
      return d;
    })
    // .on('mouseover', (d)=>vis.textMouseover(d))
    // .on('mouseout', (d)=>vis.textMouseout(d))
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .style('text-shadow', ' -3px 0 black, 0 3px black, 3px 0 black, 0 -3px black')
    .call(wrapDelimited, 70, '/');
  vis.texts.exit().remove();

  vis.drawn = true;
}

CookieChartVis.prototype.drawCircles = function() {
  var vis = this;
  var categoriesArr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  var radiusArr = [70, 70, 50, 90, 100, 140, 90, 50, 50];
  vis.enclosingCircles = vis.svg
    .selectAll('.big-cookie-nodes')
    .data(categoriesArr);
  vis.enclosingCircles.enter()
    .append('circle')
    .attr('class', 'big-cookie-nodes')
    .merge(vis.enclosingCircles)
    .attr('cx', function(d, i) {
      return vis.xCenter[i];
    })
    .attr('cy', function(d, i) {
      return vis.yCenter[i];
    })
    .attr('r', (d, i) => {
      if (vis.stage === 1) return 0;
      if (vis.stage === 2 && (i === 6 || i === 8))
        return 0;
      if (vis.stage === 3 && i === 5)
        return 100;
      if (vis.stage === 4) {
        if (i === 3) return 90;
        if (i === 5) return 50;
        return 0;
      }
      return radiusArr[i];
    })
    .style('fill', 'white')
    // .style('stroke', 'white')
    .on('mouseover', (d, i) => vis.setGenreTextVisible(i, vis))
    .on('mouseout', (d, i) => vis.setGenreTextInvisible(i, vis))
  vis.enclosingCircles.exit();

  vis.u = vis.svg
    .selectAll('.cookie-nodes')
    .data(vis.nodes, (d) => d.name);

  vis.u.enter()
    .append('circle')
    .attr('class', 'cookie-nodes')
    .on('mouseover', function(d) {
      vis.nodeMouseover(d, vis, d3.select(this))
    })
    .on('mouseout', function(d) {
      vis.nodeMouseout(d, vis, d3.select(this))
    })
    .style('opacity', 0.77)
    .merge(vis.u)
    .transition()
    .duration(500)
    .attr('r', function(d) {
      if (vis.stage === 4 && d.category !== 6 && d.category !== 8) {
        return 0;
      }
      return d.radius;
    })
    .attr('cx', function(d) {
      if (vis.stage === 1) {
        return vis.dataStage1[d.name]['x'];
      } else if (vis.stage === 2 || ((d.category < 5 || d.category == 7) && vis.stage !== 4)) {
        return vis.dataStage2[d.name]['x'];
      } else if (vis.stage === 4) {
        return vis.dataStage4[d.name]['x'];
      }
      return vis.dataStage3[d.name]['x'];
    })
    .attr('cy', function(d) {
      if (vis.stage === 1) {
        return vis.dataStage1[d.name]['y'];
      } else if (vis.stage === 2 || ((d.category < 5 || d.category == 7) && vis.stage !== 4)) {
        return vis.dataStage2[d.name]['y'];
      } else if (vis.stage === 4) {
        return vis.dataStage4[d.name]['y'];
      }
      return vis.dataStage3[d.name]['y'];
    })
    .style('fill', function(d) {
      if (vis.stage === 1) {
        if (vis.dataStage3[d.name]['color'] === 'pink')
          return 'purple';
        if (vis.dataStage3[d.name]['color'] === 'lightblue')
          return 'darkblue';
        return vis.dataStage3[d.name]['color'];
      } else if (vis.stage === 2) {
        if (vis.dataStage2[d.name]['color'] === 'pink')
          return 'purple';
        if (vis.dataStage2[d.name]['color'] === 'lightblue')
          return 'darkblue';
        return vis.dataStage2[d.name]['color'];
      } else if (vis.stage === 3) {
        if (vis.dataStage2[d.name]['color'] === 'pink')
          return 'purple';
        if (vis.dataStage2[d.name]['color'] === 'lightblue')
          return 'darkblue';
        return vis.dataStage3[d.name]['color'];
      }
      return vis.dataStage4[d.name]['color'];
    })

  vis.u.exit().remove();
}

CookieChartVis.prototype.runSimulation = function() {
  var vis = this;
  vis.titleToInfo = {};
  vis.nodes.forEach((d) => {
    vis.titleToInfo[d.name] = {};
  });

  vis.simulation = d3.forceSimulation(vis.nodes)
    .force('charge', d3.forceManyBody().strength(0))
    .force('x', d3.forceX().x(function(d) {
      if (vis.stage === 1) {
        // Only one center
        return vis.xCenter[4];
      }
      return vis.xCenter[d.category];
    }))
    .force('y', d3.forceY().y(function(d) {
      if (vis.stage === 1) {
        // Only one center
        return vis.yCenter[4];
      } else if (vis.stage === 4) {
        return vis.yCenter[d.category] - 200;
      }
      return vis.yCenter[d.category];
    }))
    .force('collision', d3.forceCollide().radius(function(d) {
      return d.radius + 2;
    }))
    .on('tick', ticked);

  function ticked() {
    vis.u = vis.svg
      .selectAll('.cookie-nodes')
      .data(vis.nodes);

    vis.u.enter()
      .append('circle')
      .attr('class', 'cookie-nodes')
      .attr('r', function(d) {
        if (vis.stage === 4 && (d.category !== 6 && d.category !== 8)) {
          return 0;
        }
        return d.radius;
      })
      .on('mouseover', d => vis.nodeMouseover(d, vis))
      .on('mouseout', d => vis.nodeMouseout(d, vis))
      .style('fill', function(d) {
        var color = vis.colorScale[d.category];
        if (vis.stage === 1) {
          color = 'gray';
        }
        vis.titleToInfo[d.name]['category'] = d.category;
        vis.titleToInfo[d.name]['color'] = vis.colorScale[d.category];
        return color;
      })
      .style('opacity', 0.77)
      .merge(vis.u)
      .attr('cx', function(d) {
        vis.titleToInfo[d.name]['x'] = d.x;
        return d.x;
      })
      .attr('cy', function(d) {
        vis.titleToInfo[d.name]['y'] = d.y;
        return d.y;
      })

    vis.u.exit().remove();
  }
}

// CookieChartVis.prototype.textMouseover = function(d, vis) {
//   var vis = this;
//   vis.texts.filter((data)=>{
//     return data === d;
//   }).style('opacity',0)
// }
//
// CookieChartVis.prototype.textMouseout = function(d, vis) {
//   var vis = this;
//   vis.texts.filter((data)=>{
//     return data === d;
//   }).style('opacity',1)
// }

CookieChartVis.prototype.setGenreTextVisible = function(category, vis) {
  vis.u.filter(function(data) {
      return data.category !== category;
    })
    .style('opacity', '0.1')

  vis.texts.filter((data, idx) => {
    return idx !== category;
  }).style('opacity', '0')

  vis.texts.filter((data, idx) => {
      return idx === category;
    }).attr("transform", (_, i) => {
      if (vis.stage === 2 && category === 5)
        return "translate(0 180)";
      return "translate(0 " + vis.yOffsetTextHover[category] + ")";
    }).attr("fill", (_, i) => {
      return vis.colorScale[category];
    }).style('text-shadow', ' -0px 0 black, 0 0px black, 0px 0 black, 0 -0px black')
    .style("font-size", "23px")
}

CookieChartVis.prototype.setGenreTextInvisible = function(category, vis) {
  vis.u.filter(function(data) {
      return data.category !== category;
    })
    .style('opacity', '0.77')

  vis.texts.filter((data, idx) => {
    return idx !== category;
  }).style('opacity', '1')

  vis.texts.filter((data, idx) => {
      return idx === category;
    }).attr("transform", (d, i) => {
      return "translate(0 0)";
    }).attr("fill", 'white')
    .style('text-shadow', ' -3px 0 black, 0 3px black, 3px 0 black, 0 -3px black')
    .style("font-size", "18px")
}

CookieChartVis.prototype.nodeMouseover = function(d, vis, hoveredCircle) {
  hoveredCircle
    .style('stroke', 'darkgray')
    .style('stroke-width', '5px');

  if (vis.stage !== 1) {
    vis.setGenreTextVisible(d.category, vis);
  }


  vis.tooltip.transition()
    .style('opacity', 0.8);

  vis.tooltip.html(`<h4>${d.name}</h4>` + `<p>Revenue: ${formatMillions(d.revenue)}</p>`)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY + 10) + "px");


};

CookieChartVis.prototype.nodeMouseout = function(d, vis, hoveredCircle) {
  vis.tooltip.transition()
    .duration(100)
    .style("opacity", 0);

  hoveredCircle
    .style('stroke', 'darkgray')
    .style('stroke-width', '0px');

  if (vis.stage !== 1) {
    vis.setGenreTextInvisible(d.category, vis);
  }
};

function formatMillions(num) {
  num = +num;
  if (num >= 1000000000) {
    num1 = Math.floor(num / 1000000000);
    num2 = Math.floor(num % 1000000000 / 1000000);
    return num1 + "." + num2 + "B";
  } else if (num >= 1000000) {
    num = Math.floor(num / 1000000);
    return num + "M";
  }
  return num;
}

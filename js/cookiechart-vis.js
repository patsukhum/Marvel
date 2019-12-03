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
  vis.height = vis.width ;
  vis.svg = makeSvg(vis, 'cookiechart-vis');

  vis.tooltip = d3.select('body').append('g')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Generate x and y center locations for clusters
  vis.xCenter = []
  for (var i = 0; i < 3; i++) {
    var init = 90;
    for (var j = 0; j < 3; j++) {
      var offset = 220;
      vis.xCenter.push(init + offset * j);
    }
  }

  vis.yCenter = []
  for (var i = 0; i < 3; i++) {
    var pos = 200 * i;
    for (var j = 0; j < 3; j++) {
      vis.yCenter.push(pos);
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

  //// slider /////

  vis.slidersvg = d3
      .select('#slider')
      .append('svg')
      .attr('width', vis.margin.width)
      .attr('height', 30)
      .append('g')
      .attr('transform', 'translate(0,0)');

  // vis.slidersvg.append("line")
  //     .attr("class", "track")
  //     // .attr("x1", x.range()[0])
  //     // .attr("x2", x.range()[1])
  //     .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  //     .attr("class", "track-inset")
  //     .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  //     .attr("class", "track-overlay")
  //     .call(d3.drag()
  //         .on("start.interrupt", function() { slider.interrupt(); })
  //         .on("start drag", function() {
  //           currentValue = d3.event.x;
  //           update(x.invert(currentValue));
  //         })
  //     );



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
  dlAnchorElem.setAttribute("href",     dataStr     );
  dlAnchorElem.setAttribute("download", "data.json");
  dlAnchorElem.click();
  vis.updateVis();
}

CookieChartVis.prototype.toggleCookie = function() {
  var vis = this;
  vis.stage = vis.stage%4+1;
  vis.updateVis();
}

CookieChartVis.prototype.updateVis = function() {
  var vis = this;

  var width = vis.width,
    height = vis.height;

  vis.colorScale = ['pink', 'darkred', 'black', 'lightblue', 'green', 'orange', "#e23636", 'gray', "#0476F2"];


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

  var xOffsetText = 0;
  var yOffsetText = 0;
  var texts = vis.svg.selectAll("text")
    .data(vis.idxToGenre);

  texts.enter()
    .append("text")
    .attr("class", "texts genre-label")
    .merge(texts)
    .attr("x", (d, i) => {
      return vis.xCenter[i] - xOffsetText;
    })
    .attr("y", (d, i) => {
      return vis.yCenter[i] - yOffsetText;
    })
    .text((d, i) => {
      if (vis.stage === 1)
        return "";
      return d;
    })
    .attr("fill", "black")
    .style("text-anchor", "middle");
  texts.exit().remove();

  vis.drawn = true;
}

CookieChartVis.prototype.drawCircles = function() {
  var vis = this;
  vis.u = vis.svg
    .selectAll('.cookie-nodes')
    .data(vis.nodes, (d)=>d.name);

  vis.u.enter()
    .append('circle')
    .attr('class', 'cookie-nodes')
    .on('mouseover', d => vis.nodeMouseover(d, vis))
    .on('mouseout', d => vis.nodeMouseout(d, vis))
    .style('opacity', 0.77)
    .merge(vis.u)
    .transition()
    .duration(1000)
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
      if (vis.stage === 1){
        return 'gray';
      } else if (vis.stage === 2){
        return vis.dataStage2[d.name]['color'];
      } else if (vis.stage === 3){
        return vis.dataStage3[d.name]['color'];
      }
      return vis.dataStage4[d.name]['color'];
    })

  vis.u.exit().remove();
}

CookieChartVis.prototype.runSimulation = function() {
  var vis = this;
  vis.titleToInfo = {};
  vis.nodes.forEach((d)=>{
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
        return vis.yCenter[d.category]-200;
      }
      return vis.yCenter[d.category];
    }))
    .force('collision', d3.forceCollide().radius(function(d) {
      return d.radius+2;
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
        if (vis.stage === 1){
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


CookieChartVis.prototype.nodeMouseover = function(d, vis) {
  vis.u.filter(function(data) {
      return data == d;
    })
    .style('stroke', 'darkgray')
    .style('stroke-width', '3px');

  vis.tooltip.transition()
    .style('opacity', 0.8);

  vis.tooltip.html(`<h4>${d.name}</h4>` + `<p>Revenue: ${formatMillions(d.revenue)}</p>`)
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
    num2 = Math.floor(num % 1000000000 / 1000000);
    return num1 + "." + num2 + "B";
  } else if (num >= 1000000) {
    num = Math.floor(num / 1000000);
    return num + "M";
  }
  return num;
}

/**
 * TitleVis - Object constructor function
 *
 * Visualization for title slide
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- Matrix data
 * @constructor
 */


 TitleVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.drawn = false;
  
    this.initVis();
  };


  TitleVis.prototype.initVis = function() {
    var vis = this;
  
    vis.margin = {
      'top': 40,
      'bottom': 100,
      'left': 50,
      'right': 50
    };
    vis.width = 1400 - vis.margin.left - vis.margin.right;
    vis.height = vis.width * 0.28;
  
    vis.svg = makeSvg(vis, vis.parentElement);
  
    vis.wrangleData();
  };
  
  
  TitleVis.prototype.wrangleData = function() {
    var vis = this;

    // only need name of the heros
    var names = []
    vis.data.forEach(d => {
      names.push(d.name);
    })
    vis.displayData = names;
  
    vis.updateVis();
  };
  
  
  TitleVis.prototype.updateVis = function() {
    var vis = this;


    // icon movement along path code help from: https://bl.ocks.org/mbostock/1705868
    var points = [
      [150, 320],
      [150, 30],
      [980, 30],
      [980, 320],
    ];

    var points2 = [
      [200, 310],
      [200, 120],
      [1000, 120],
      [1000, 310],
    ];

    // draw invisible icon moving path
    var path = vis.svg.append("path")
    .data([points])
    .attr("class","icon-path")
    .attr("d", d3.line()
    .curve(d3.curveCardinalClosed.tension(0)));

    // draw white bubble
    vis.svg.append("path")
    .data([points2])
    .attr("class","bubble-path")
    .attr("d", d3.line()
    .curve(d3.curveCardinalClosed.tension(0.2)));

    this.svg.selectAll(".point")
        .data(points)
      .enter().append("circle")
        .attr("r", 0.1)
        .attr("transform", function(d) { return "translate(" + d + ")"; });


    var circle= vis.svg.append('image')
      .attr('xlink:href', getSvgIcon('Avengers'))
      //.attr("transform",`translate(${points[0]})`)
      .attr('width', 70)
      .attr('height', 70);
    
    repeat();

    function repeat() {
      circle.transition()
          .duration(10000)
          .attrTween("transform", translateAlong(path.node()))
          .on("end", repeat);
    }

// Returns an attrTween for translating along the specified path element.
function translateAlong(path) {
  var l = path.getTotalLength();
  return function(d, i, a) {
    return function(t) {
      var p = path.getPointAtLength(t * l);
      return `translate(${p.x},${p.y})`;
    };
  };
}

var titlegroup = vis.svg.append("g");
    // append title
    titlegroup.append("text")
      .attr("class","h1")
      .style("text-anchor", "middle")
      .attr("transform", "translate(600,220)")
      .text("Marvel Cinematic Universe")

    titlegroup.append("text")
      .attr("class","h2")
      .style("text-anchor", "middle")
      .attr("transform", "translate(600,270)")
      .text("How Marvel superheroes took over our world")
      
    // vis.titlegroup = vis.svg.selectAll('g.title')
    //   .data(vis.displayData);

    // vis.titlegroup.enter().append('image')
    //   .attr('xlink:href', d => getSvgIcon(d))
    //   .attr('x', function(d) { return vis.displayData.indexOf(d)*35+200; })
    //   .attr('y', 300)
    //   .attr('width', 40)
    //   .attr('height', 40);

    vis.drawn = true;
  };
  
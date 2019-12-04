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
      'top': 30,
      'bottom': 0,
      'left': 50,
      'right': 50
    };
    vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $(window).height() - vis.margin.top - vis.margin.bottom;
  
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


    // bouncing icons code help from: http://bl.ocks.org/HarryStevens/f59cf33cfe5ea05adec113c64daef59b

    var points2 = [
      [vis.width/6, 2*vis.height/3-20],
      [vis.width/6, vis.height/3-10],
      [5*vis.width/6, vis.height/3-10],
      [5*vis.width/6, 2*vis.height/3-20],
    ];

    
    // var points2 = [
    //   [230, 390],
    //   [230, 200],
    //   [1030, 200],
    //   [1030, 390],
    // ];


    var variables = {
			radius: 28,
			distance: 4
		}

		var data = [];

		for (var i = 0; i < vis.displayData.length; i++){
			data.push({
				id: vis.displayData[i],
				x: jz.num.randBetween(0, vis.width),
				y: jz.num.randBetween(0, vis.height),
				slope: jz.num.randBetween(1, 20) / 10,
				x_dir: [-1, 1][jz.num.randBetween(0, 1)],
				y_dir: [-1, 1][jz.num.randBetween(0, 1)]
			});
    }

    // draw initial icons
    var nodes = vis.svg.selectAll('g.characters')
    .data(data, function(d){ return d.id; });

    var group = nodes.enter()
      .append('g')
      .attr('class', 'characters');

    group.append('circle')
      .attr('r', d => variables.radius)
      .attr('cx', d=> d.x)
      .attr('cy', d => d.y)
      .style("opacity", 0)

    group.append('image')
        .attr('xlink:href', d => getSvgIcon(d.id))
        .attr('width', 70)
        .attr('height', 70)
        .attr('x', d=> d.x-variables.radius)
        .attr('y', d => d.y-variables.radius);

		redraw(data);

		d3.interval(function(){ redraw(update(data)); }, 30)

    // update icon positions
		function redraw(data){

      var groups = vis.svg.selectAll('g.characters')
      .data(data, function(d){ return d.id; });

      groups.selectAll("circle")
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; })

      groups.selectAll("image")
          .attr("x", function(d){ return d.x-variables.radius; })
          .attr("y", function(d){ return d.y-variables.radius; })
		}

		function update(data){
			data.forEach(function(d){
				return calcPointB(d, variables.distance, d.slope);
			});
			return data;
		}

		// given a point, p, and a distance, d, and a slope, m, return x and y
		// formula from http://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
		function calcPointB(p, d, m){

			p.x_dir = getDir(p.x, p.x_dir, vis.width);

			p.y_dir = getDir(p.y, p.y_dir, vis.height);

			function getDir(coord, dir, dimension){
				return  Math.floor(coord) <= variables.radius ? 1 :
								Math.ceil(coord) >= dimension - variables.radius ? -1 :
								dir;
			}
			
			p.x = p.x + (d * Math.sqrt(1 / (1 + Math.pow(m, 2))) * p.x_dir);
			p.y = p.y + (m * d * Math.sqrt(1 / (1 + Math.pow(m, 2))) * p.y_dir);

			return p;

		}


    // draw white bubble
    vis.svg.append("path")
    .data([points2])
    .attr("class","bubble-path")
    .attr("d", d3.line()
    .curve(d3.curveCardinalClosed.tension(0.2)));


    var titlegroup = vis.svg.append("g");
    // append title
    titlegroup.append("text")
      .attr("class","h1")
      .style("text-anchor", "middle")
      // .attr("transform", `translate(620,300)`)
      .style("font-size","350%")
      .attr("transform", `translate(${vis.width/2},${vis.height/2-20})`)
      .text("Marvel Cinematic Universe")

    titlegroup.append("text")
      .attr("class","h2")
      .style("text-anchor", "middle")
      // .attr("transform","translate(620,350)")
      .style("font-size","160%")
      .attr("transform", `translate(${vis.width/2},${vis.height/2+20})`)
      .text("How Marvel superheroes took over our world")
      

    vis.drawn = true;
  };
  
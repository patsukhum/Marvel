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
    vis.height = vis.width * 0.4;
  
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

    var points2 = [
      [220, 340],
      [220, 150],
      [1020, 150],
      [1020, 340],
    ];


    var numParticles = 20
    var maxVelocity = 8
    
    var color = d3.scaleOrdinal().range(d3.schemeCategory20)
    
    var nodes = Array.apply(null, Array(numParticles)).map(function (_, i) {
        var size = Math.random() * 60 + 20
        var velocity = Math.random() * 2 + 1
        var angle = Math.random() * 360
    
        return {
            x: Math.random() * (vis.width - size),
            y: Math.random() * (vis.height - size),
            vx: velocity * Math.cos(angle * Math.PI / 180),
            vy: velocity * Math.sin(angle * Math.PI / 180),
            size: size,
            fill: color(i)
        }
    })
    
    var drag = d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
    
    var svg = d3.select('body').append('svg')
    
    var rects = vis.svg.selectAll('rect')
        .data(nodes)
        .enter().append('rect')
        .style('fill', function (d) { return d.fill })
        .attr('width', function (d) { return d.size })
        .attr('height', function (d) { return d.size })
        .attr('x', function (d) { return d.x })
        .attr('y', function (d) { return d.y })
        .call(drag)

    
    
    var collisionForce = rectCollide()
        .size(function (d) { return [d.size, d.size] })
    
    var boxForce = boundedBox()
        .bounds([[0, 0], [vis.width, vis.height]])
        .size(function (d) { return [d.size, d.size] })
    
    d3.forceSimulation()
        .velocityDecay(0)
        .alphaTarget(1)
        .on('tick', ticked)
        .force('box', boxForce)
        .force('collision', collisionForce)
        .nodes(nodes)
    
    function rectCollide() {
        var nodes, sizes, masses
        var size = constant([0, 0])
        var strength = 1
        var iterations = 1
    
        function force() {
            var node, size, mass, xi, yi
            var i = -1
            while (++i < iterations) { iterate() }
    
            function iterate() {
                var j = -1
                var tree = d3.quadtree(nodes, xCenter, yCenter).visitAfter(prepare)
    
                while (++j < nodes.length) {
                    node = nodes[j]
                    size = sizes[j]
                    mass = masses[j]
                    xi = xCenter(node)
                    yi = yCenter(node)
    
                    tree.visit(apply)
                }
            }
    
            function apply(quad, x0, y0, x1, y1) {
                var data = quad.data
                var xSize = (size[0] + quad.size[0]) / 2
                var ySize = (size[1] + quad.size[1]) / 2
                if (data) {
                    if (data.index <= node.index) { return }
    
                    var x = xi - xCenter(data)
                    var y = yi - yCenter(data)
                    var xd = Math.abs(x) - xSize
                    var yd = Math.abs(y) - ySize
    
                    if (xd < 0 && yd < 0) {
                        var l = Math.sqrt(x * x + y * y)
                        var m = masses[data.index] / (mass + masses[data.index])
    
                        if (Math.abs(xd) < Math.abs(yd)) {
                            node.vx -= (x *= xd / l * strength) * m
                            data.vx += x * (1 - m)
                        } else {
                            node.vy -= (y *= yd / l * strength) * m
                            data.vy += y * (1 - m)
                        }
                    }
                }
    
                return x0 > xi + xSize || y0 > yi + ySize ||
                       x1 < xi - xSize || y1 < yi - ySize
            }
    
            function prepare(quad) {
                if (quad.data) {
                    quad.size = sizes[quad.data.index]
                } else {
                    quad.size = [0, 0]
                    var i = -1
                    while (++i < 4) {
                        if (quad[i] && quad[i].size) {
                            quad.size[0] = Math.max(quad.size[0], quad[i].size[0])
                            quad.size[1] = Math.max(quad.size[1], quad[i].size[1])
                        }
                    }
                }
            }
        }
    
        function xCenter(d) { return d.x + d.vx + sizes[d.index][0] / 2 }
        function yCenter(d) { return d.y + d.vy + sizes[d.index][1] / 2 }
    
        force.initialize = function (_) {
            sizes = (nodes = _).map(size)
            masses = sizes.map(function (d) { return d[0] * d[1] })
        }
    
        force.size = function (_) {
            return (arguments.length
                 ? (size = typeof _ === 'function' ? _ : constant(_), force)
                 : size)
        }
    
        force.strength = function (_) {
            return (arguments.length ? (strength = +_, force) : strength)
        }
    
        force.iterations = function (_) {
            return (arguments.length ? (iterations = +_, force) : iterations)
        }
    
        return force
    }
    
    function boundedBox() {
        var nodes, sizes
        var bounds
        var size = constant([0, 0])
    
        function force() {
            var node, size
            var xi, x0, x1, yi, y0, y1
            var i = -1
            while (++i < nodes.length) {
                node = nodes[i]
                size = sizes[i]
                xi = node.x + node.vx
                x0 = bounds[0][0] - xi
                x1 = bounds[1][0] - (xi + size[0])
                yi = node.y + node.vy
                y0 = bounds[0][1] - yi
                y1 = bounds[1][1] - (yi + size[1])
                if (x0 > 0 || x1 < 0) {
                    node.x += node.vx
                    node.vx = -node.vx
                    if (node.vx < x0) { node.x += x0 - node.vx }
                    if (node.vx > x1) { node.x += x1 - node.vx }
                }
                if (y0 > 0 || y1 < 0) {
                    node.y += node.vy
                    node.vy = -node.vy
                    if (node.vy < y0) { node.vy += y0 - node.vy }
                    if (node.vy > y1) { node.vy += y1 - node.vy }
                }
            }
        }
    
        force.initialize = function (_) {
            sizes = (nodes = _).map(size)
        }
    
        force.bounds = function (_) {
            return (arguments.length ? (bounds = _, force) : bounds)
        }
    
        force.size = function (_) {
            return (arguments.length
                 ? (size = typeof _ === 'function' ? _ : constant(_), force)
                 : size)
        }
    
        return force
    }
    
    function ticked() {
        rects
            .attr('x', function (d) { return d.x })
            .attr('y', function (d) { return d.y })
    }
    
    var px, py, vx, vy, offsetX, offsetY
    
    function dragStarted(d) {
        vx = 0
        vy = 0
        offsetX = (px = d3.event.x) - (d.fx = d.x)
        offsetY = (py = d3.event.y) - (d.fy = d.y)
    }
    
    function dragged(d) {
        vx = d3.event.x - px
        vy = d3.event.y - py
        d.fx = Math.max(Math.min((px = d3.event.x) - offsetX, vis.width - d.size), 0)
        d.fy = Math.max(Math.min((py = d3.event.y) - offsetY, vis.height - d.size), 0)
    }
    
    function dragEnded(d) {
        var vScalingFactor = maxVelocity / Math.max(Math.sqrt(vx * vx + vy * vy), maxVelocity)
        d.fx = null
        d.fy = null
        d.vx = vx * vScalingFactor
        d.vy = vy * vScalingFactor
    }
    
    function constant(_) {
        return function () { return _ }
    }
















    // draw white bubble
    vis.svg.append("path")
    .data([points2])
    .attr("class","bubble-path")
    .attr("d", d3.line()
    .curve(d3.curveCardinalClosed.tension(0.2)));







    // this.svg.selectAll(".point")
    //     .data(points)
    //   .enter().append("circle")
    //     .attr("r", 0.1)
    //     .attr("transform", function(d) { return "translate(" + d + ")"; });


    // var circle= vis.svg.append('image')
    //   .attr('xlink:href', getSvgIcon('Avengers'))
    //   //.attr("transform",`translate(${points[0]})`)
    //   .attr('width', 70)
    //   .attr('height', 70);
    
    // repeat();

//     function repeat() {
//       circle.transition()
//           .duration(10000)
//           .attrTween("transform", translateAlong(path.node()))
//           .on("end", repeat);
//     }

// // Returns an attrTween for translating along the specified path element.
// function translateAlong(path) {
//   var l = path.getTotalLength();
//   return function(d, i, a) {
//     return function(t) {
//       var p = path.getPointAtLength(t * l);
//       return `translate(${p.x},${p.y})`;
//     };
//   };
// }

var titlegroup = vis.svg.append("g");
    // append title
    titlegroup.append("text")
      .attr("class","h1")
      .style("text-anchor", "middle")
      .attr("transform", "translate(620,250)")
      .text("Marvel Cinematic Universe")

    titlegroup.append("text")
      .attr("class","h2")
      .style("text-anchor", "middle")
      .attr("transform", "translate(620,300)")
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
  
//standardize svg creation

var format1d = d3.format(".1f");
var formatYear = d3.timeFormat("%Y");

function makeSvg(vis, chartType) {
  return d3.select('#' + vis.parentElement)
      .append('div')
      .attr('class', 'svg-container ' + chartType)
      .append('svg')
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .append('g')
      .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');
}

// for linechart
var parseTime = d3.timeParse("%Y");
formatValue = d3.format(".2s");
formatComma = d3.format(",");  // formatting help from http://bl.ocks.org/mstanaland/6106487

// For plot flow chart
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr('x'),
        y = text.attr("y"),
        dy = 0,
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

// For map vis
// For plot flow chart
function wrapDelimited(text, width, delimiter) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(delimiter).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr('x'),
        y = text.attr("y"),
        dy = 0,
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(delimiter));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(delimiter));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


var heroColors = {
  avengers: 'rgba(85,46,137,0.4)',
  guardians: 'rgba(54,159,77,0.4)',
  black_panther: 'rgba(35,9,47,0.4)',
  captain_america: 'rgba(0,0,255, 0.4)',
  thor: 'rgba(3,173,233,0.4)',
  iron_man: 'rgba(227,0,34,0.4)',
  hulk: 'rgba(162,205,72,0.4)',
  captain_marvel: 'rgba(232,169,2,0.4)',
  doctor_strange: 'rgba(202,116,27,0.4)',
  ant_man: 'rgba(94,102,116,0.4)',
  spider_man: 'rgba(126,31,39,0.4)',
  black_widow: 'rgba(0,0,0,0.4)',
};

var iconDir = 'img/characters/';
var svgCharactersMapping = {
  0: iconDir+"ironman.svg",
  1: iconDir+"captainamerica.svg",
  2: iconDir+"thor.svg",
  3: iconDir+"blackwidow.svg",
  4: iconDir+"hulk.svg",
  5: iconDir+"hawkeye.svg",
  6: iconDir+"antman.svg",
  7: iconDir+"vision.svg",
  8: iconDir+"scarletwitch.svg",
  9: iconDir+"falcon.svg",
  10: iconDir+"starlord.svg",
  11: iconDir+"rocket.svg",
  12: iconDir+"groot.svg",
  13: iconDir+"doctorstrange.svg",
  14: iconDir+"gamora.svg",
  15: iconDir+"drax.svg",
  16: iconDir+"nickfury.svg",
  17: iconDir+"spiderman.svg",
  18: iconDir+"blackpanther.svg",
  19: iconDir+"captainmarvel.svg",
  20: iconDir+"thanos.svg",
  21: iconDir+"loki.svg",
};

function getSvgIcon(charName) {
  var iconName = charName.toLowerCase().replace(/[\s\-_]/g, '');
  replacements = {
    rocketraccoon: "rocket",
    draxthedestroyer: "drax"
  };
  iconName = replacements[iconName] || iconName;
  return iconDir + iconName + '.svg';
}
function getJpgPath(charName) {
  var jpgName = charName.toLowerCase().replace(/\s/g, '_');
  return "img/characters/jpg/" + jpgName + ".jpg";
}

function unique(value, index, self) {
  return self.indexOf(value) === index;
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function titleCase(string) {
  var sentence = string.toLowerCase().split(/[ _]/);
  for(var i = 0; i< sentence.length; i++){
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }
  return sentence.join(" ");
}


// Returns an attrTween for translating along the specified path element.
// From http://bl.ocks.org/dem42/e10e933990ee662c9cbd
function translateAlong(path) {
  var l = path.getTotalLength();
  var ps = path.getPointAtLength(0);
  var pe = path.getPointAtLength(l);
  var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI) - 90;
  var rot_tran = "rotate(" + angl + ")";
  return function(d, i, a) {

    return function(t) {
      var p = path.getPointAtLength(t * l);
      return "translate(" + p.x + "," + p.y + ") " + rot_tran;
    };
  };
}


// ArcTween for speedometers
// By Mike Bostock: http://bl.ocks.org/mbostock/5100636
function arcTween(newAngle) {
  return function(d) {
    var interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  };
}


// From http://bl.ocks.org/cmdoptesc/6228457
function arc2Tween(d, indx, drawArc) {
  var interp = d3.interpolate(this._current, d);    // this will return an interpolater
                                                    //  function that returns values
                                                    //  between 'this._current' and 'd'
                                                    //  given an input between 0 and 1

  this._current = d;                    // update this._current to match the new value

  return function(t) {                  // returns a function that attrTween calls with
    //  a time input between 0-1; 0 as the start time,
    //  and 1 being the end of the animation

    var tmp = interp(t);                // use the time to get an interpolated value
                                        //  (between this._current and d)

    return drawArc(tmp, indx);          // pass this new information to the accessor
                                        //  function to calculate the path points.
                                        //  make sure sure you return this.

    // n.b. we need to manually pass along the
    //  index to drawArc so since the calculation of
    //  the radii depend on knowing the index. if your
    //  accessor function does not require knowing the
    //  index, you can omit this argument
  }
};

function fadeOut(vis) {
  vis.svg.append('rect')
      .attr('class', 'cover')
      .attr('x', -vis.margin.left)
      .attr('y', -vis.margin.top)
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .style('fill', 'white')
      .style('opacity', 0.9)
}
function fadeIn(vis) {
  vis.svg.select('rect.cover')
      .transition()
      .style('opacity', 0)
      .remove();
}
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
formatComma = d3.format(",") // formating help from http://bl.ocks.org/mstanaland/6106487

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


var heroColors = {
  avengers: 'rgba(85,46,137,0.35)',
  guardians: 'rgba(54,159,77,0.23)',
  black_panther: 'rgba(12,11,19,0.24)',
  captain_america: 'rgba(0,0,255, 0.25)',
  thor: 'rgba(3,173,233,0.14)',
  iron_man: 'rgba(227,0,34,0.18)',
  hulk: 'rgba(162,205,72,0.18)',
  captain_marvel: 'rgba(243,212,3,0.24)',
  doctor_strange: 'rgba(202,116,27,0.29)',
  ant_man: 'rgba(94,102,116,0.34)',
  spider_man: 'rgba(126,31,39,0.25)',
  black_widow: 'rgba(0,0,0,0.19)'
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

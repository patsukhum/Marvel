/**
 * PlotFlowVis - Object constructor function
 *
 * Flowchart that shows the progression of the plot through the MCU
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis (no '#')
 * @param _data           -- JSON dataset of each movie and links between them
 * @constructor
 */
PlotFlowVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = _data;
  this.branching = false;
  this.drawn = false;
  this.toggledBefore = false;
  this.selected = {x: 'year', y: 'allFrac'};
  this.groupSelected = null;

  this.initVis();
};
PlotFlowVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = {
    'top': 50,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 0.30;

  vis.svg = makeSvg(vis, 'plot-flow-vis');

  vis.rectHeight = 35;
  vis.rectWidth = 78;

  // Parsing data
  var yearCounts = {};
  vis.data.forEach((d) => {
    d.flows_into = d.flows_into.split(", ").filter(s => s !== "");
    d.year = new Date(+d.year, 0, 1);
    if (d.year in yearCounts) {
      d.yearCount = yearCounts[d.year];
      yearCounts[d.year]++;
    } else {
      yearCounts[d.year] = 1;
      d.yearCount = 0;
    }
  });
  vis.data.forEach(d => {
    d.yearTotal = yearCounts[d.year];
    d.allFrac = (d.yearCount + 1) / d3.max(Object.values(yearCounts));
  });

  vis.yMax = d3.max(vis.data.map(d => d.y));

  // Creating an object for the arrows
  vis.edges = vis.data.map(d => {
    if (d.flows_into.length > 0) {
      return d.flows_into.map(e => {
        var target = vis.data.find(a => a.movie === e);
        return [d, target];
      });
    }
  }).flat().filter(d => d !== undefined);

  // Arrowhead markers
  // Per-type markers, as they don't inherit styles.
  var defs = vis.svg.append("defs");

  defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 1)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  defs.append('marker')
      .attr("id", "selected")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 1)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr('transform', 'scale(0.25)');


  // Set up scales
  vis.x = d3.scalePoint()
      .range([0, vis.width]);
  vis.y = d3.scaleBand()
      .paddingInner(10)
      .paddingOuter(10)
      .range([vis.height, 0]);
  vis.color = d3.scaleOrdinal(d3.schemeSet1)
      .domain(vis.data.map(d => d.group));

  // Set up x axis
  vis.xAxis = d3.axisBottom()
      .scale(vis.x)
      .tickFormat(formatYear);
  vis.gX = vis.svg
      .append('g').attr('class', 'x axis')
      .attr('transform', 'translate(0,' + vis.height + ')');

  // Group for films
  vis.gFilms = vis.svg.append('g')
      .attr('class', 'films');

  // Group for arrows
  vis.gArrows = vis.svg.append('g')
      .attr('class', 'arrows');

  // Line generator function
  vis.line = d3.linkHorizontal();

  vis.wrangleData();
};
PlotFlowVis.prototype.wrangleData = function() {
  var vis = this;

  // Nothing for now...
  vis.displayData = vis.data.sort((a, b) => {
    return (a.year * 100 + a.yearCount) - (b.year * 100 + b.yearCount);
  });

  // vis.drawVis()

};
PlotFlowVis.prototype.drawVis = function() {
  var vis = this;

  vis.updateScales();

  vis.films = vis.gFilms.selectAll('rect')
      .data(vis.displayData, d => d.movie)
      .enter()
      .append('rect')
        .attr('class', 'rect-film')
        .attr('height', vis.rectHeight)
        .attr('width', vis.rectWidth)
        .style('opacity', 0)
        .style('fill', d => heroColors[d.group])
      .transition()
        .on('start', function() {
          d3.select(this).style('opacity', 0);
        })
        .delay(vis.delayEnter)
        .duration(300)
        .style('opacity', 1)
      .selection()
        .call(vis.drawRect, vis);

  vis.titles = vis.gFilms.selectAll('text')
      .data(vis.displayData, d => d.movie);

  vis.titles.enter()
      .append('text')
        .text(d => d.movie)
        .attr('class', 'film-title')
        .style('opacity', 0)
      .transition()
        .on('start', function() {
          d3.select(this).style('opacity', 0);
        })
        .delay(vis.delayEnter)
        .duration(300)
        .style('opacity', 1)
      .selection()
        .call(vis.drawLab, vis)
        .call(wrap, vis.rectWidth - 3);

  // Drawing character selectbox
  vis.gCharacters = vis.svg.append('g');
  var radius = 20,
      charData = vis.displayData
          .map(d => d.group)
          .filter(unique).sort((a, b) => a === 'avengers' ? -1 : b === 'avengers' ? 1 : 0)
          .concat(['reset']);

  var characters = vis.gCharacters.selectAll('g.character')
      .data(charData);

  var characterEnter = characters.enter()
      .append('g')
      .attr('class', 'character')
      .attr('transform', (d, i) => 'translate(' + (i * 3 * radius) + ',-30)')
      .on('mouseover', function() {
        d3.select(this).select('circle')
            .call(focus);
      })
      .on('mouseout', function(d) {
        if (vis.groupSelected !== d) {
          d3.select(this).select('circle')
              .call(unfocus);
        }
      })
      .on('click', function(d) {
        unfocusAll(vis);
        d3.select(this).select('circle')
            .call(focus);
        charboxClick(d, vis);
      });

  characterEnter.append('circle')
      .attr('class', 'node')
      .attr('r', radius)
      .attr('cx', radius)
      .attr('cy', radius);

  characterEnter.append('image')
      .attr('xlink:href', d => getSvgIcon(d))
      .attr('width', 2 * radius)
      .attr('height', 2 * radius)
      .attr('y', 4);

  characterEnter.append('text')
      .attr('x', radius)
      .attr('y', 2 * radius + 10)
      .text(d => titleCase(d))
      .attr('class', 'film-title')
      .call(wrap, 2 * radius);

  // Title for character box
  vis.gCharacters.append('text')
      .text("Click a character (or group of characters) to highlight only their films!")
      .attr('x', 0)
      .attr('y', -40)
      .style('font-size', 10);

  vis.xAxis.scale(vis.x);
  vis.gX.call(vis.xAxis);

  vis.drawn = true;
};
PlotFlowVis.prototype.updateVis = function() {
  var vis = this;

  // vis.films = vis.gFilms.selectAll('rect')
  //     .data(vis.displayData, d => d.movie);
  vis.titles = vis.gFilms.selectAll('text')
      .data(vis.displayData, d => d.movie);
  vis.arrows = vis.gArrows.selectAll('path')
      .data(vis.edges);

  vis.updateScales();

  var delay = (d, i) => vis.branching ? i * 50 : 200 + i * 50;

  vis.films.transition()
      .delay(delay)
      .duration(200)
      .call(vis.drawRect, vis);

  vis.titles.transition()
      .delay(delay)
      .duration(200)
      .call(vis.drawLab, vis, delay);

  // Drawing arrows
  // TODO: Get the arrows to fade in (ideally draw themselves using attrTween)
  if (vis.branching) {
    vis.arrows.enter()
        .append('path')
        .attr('class', 'arrow')
        .style('opacity', 0)
        .call(vis.drawArrow, vis)
        .transition()
        .delay(d => vis.toggledBefore ? 1000 : 200 + d[0].x * 400 + d[0].y * 100)
        .duration(200)
        .style('opacity', 1)
  } else {
    vis.arrows.transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
  }

  if (!vis.branching) {
    vis.xAxis.scale(vis.x);
    vis.gX.call(vis.xAxis)
        .style('opacity', 0)
        .transition()
        .on('start', function() {
          d3.select(this).style('opacity', 0)
        })
        .duration(1000)
        .style('opacity', 1);
  } else {
    vis.gX.selectAll('.tick')
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .remove();
    vis.gX.select('path')
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .remove();
  }
};

PlotFlowVis.prototype.toggleBranching = function() {
  var vis = this;

  vis.branching = !vis.branching;

  if (vis.branching) {
    vis.selected.x = 'x';
    vis.selected.y = 'y';
  } else {
    vis.selected.x = 'year';
    vis.selected.y = 'allFrac';
  }

  vis.updateVis();

  vis.toggledBefore = true;
};

PlotFlowVis.prototype.drawRect = function(elem, vis) {
  elem.attr('x', d => vis.x(d[vis.selected.x]) - vis.rectWidth / 2)
      .attr('y', d => vis.y(d[vis.selected.y]) - vis.rectHeight / 2);
};
PlotFlowVis.prototype.drawLab = function(elem, vis, delay) {
  elem.attr('x', function(d, i) {
    var del;
    if (delay === undefined) {
      del = 200;
    } else {
      del = delay(d, i);
    }
    d3.select(this).selectAll('tspan')
        .transition()
        .delay(del)
        .duration(200)
        .attr('x', vis.x(d[vis.selected.x]))
        .attr('y', vis.y(d[vis.selected.y]));
    return vis.x(d[vis.selected.x])
  })
      .attr('y', d => vis.y(d[vis.selected.y]));
};
// Need to add arrowheads
PlotFlowVis.prototype.drawArrow = function(elem, vis) {
  elem.attr('d', d => {
    return vis.line({
      source: [vis.x(d[0].x) + vis.rectWidth / 2, vis.y(d[0].y)],
      target: [vis.x(d[1].x) - vis.rectWidth / 2 - 5, vis.y(d[1].y)]
    });
  })
      .attr('marker-end', 'url(#arrowhead)');
};

PlotFlowVis.prototype.delayEnter = function(d, i) {
  return (i * 200);
};
PlotFlowVis.prototype.updateScales = function() {
  var vis = this;

  vis.x.domain(vis.displayData.map(d => d[vis.selected.x]).sort((a, b) => a - b));
  vis.y.domain(vis.displayData.map(d => d[vis.selected.y]).sort((a, b) => a - b));
};
function charboxClick(d, vis) {
  if (d === 'reset') {
    resetSelected(vis);
  } else {
    vis.groupSelected = d;

    vis.films
        .style('fill', e => e.group === d ? heroColors[e.group] : 'none');

    vis.svg.select('defs > marker#selected path')
        .style('stroke', heroColors[d])
        .style('fill', heroColors[d]);
    vis.gArrows.selectAll('path')
        .data(vis.edges)
        .style('stroke', e => {
          return [e[0].group, e[1].group].includes(d) ? heroColors[d] : 'darkgray';
        })
        .style('stroke-width', e => [e[0].group, e[1].group].includes(d) ? 4 : 1)
        .attr('marker-end', e => [e[0].group, e[1].group].includes(d) ? 'url(#selected)' : 'url(#arrowhead)');
  }
}
function resetSelected(vis) {
  vis.groupSelected = null;
  vis.films
      .style('fill', d => heroColors[d.group]);
  vis.gArrows.selectAll('path')
      .style('stroke', 'black')
      .style('stroke-width', 1)
      .attr('marker-end', 'url(#arrowhead)');
  unfocusAll(vis);
}
function focus(elem) {
  elem.style('fill', '#f78f3f')
      .style('stroke', '#f78f3f');
}

function unfocus(elem) {
  elem.style('fill', 'none')
      .style('stroke', 'darkgray');
}
function unfocusAll(vis) {
  vis.svg.selectAll('.character circle')
      .call(unfocus);
}
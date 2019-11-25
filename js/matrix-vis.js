/**
 * MatrixVis - Object constructor function
 *
 * Matrix visualization for the abilities of major characters
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _matrix_data              -- matrix values data
 * @constructor
 */

Matrix = function(_parentElement, _matrix_data) {
  this.parentElement = _parentElement;
  this.prelimData = [];

  this.matrixData = _matrix_data;
  this.displayData = [];

  this.initVis();
};

Matrix.prototype.initVis = function() {
  //code from lab 6
  var vis = this;

  vis.margin = {
    'top': 30,
    'bottom': 0,
    'left': 50,
    'right': 10
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width / 2;

  vis.svg = makeSvg(vis, 'matrix-vis');
  var baseDir = 'img/attributes/';
  vis.svgImagesMapping = {
      0: baseDir+"strength.svg",
      1: baseDir+"speed.svg",
      2: baseDir+"brain.svg",
      3: baseDir+"alien.svg",
      4: baseDir+"heal.svg",
      5: baseDir+"armor.svg",
      6: baseDir+"weapons.svg",
      7: baseDir+"flight.svg",
      8: baseDir+"magic.svg",
      9: baseDir+"chemistry.svg"
  };

  vis.tooltip = d3.select('body').append('g')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  vis.rectWidth = 25;
  vis.innerPadding = 5;


  //matrix data
  vis.matrixData.forEach(function(d, i) {
    d.super_strength = +d.super_strength;
    d.super_speed = +d.super_speed;
    d.super_intelligence = +d.super_intelligence;
    d.alien = +d.alien;
    d.healing = +d.healing;
    d.armor = +d.armor;
    d.weapon = +d.weapon;
    d.flight = +d.flight;
    d.magic = +d.magic;
    d.acquired_power = +d.acquired_power;
  });

  //create an array of attributes for filtering purposes
  vis.attributes = ["super_strength", "super_speed", "super_intelligence",
    "alien", "healing", "armor", "weapon", "flight", "magic", "acquired_power"];

  console.log(vis.matrixData);

  console.log(vis.displayData);

  vis.gRowLabs = vis.svg.append('g');

  // Adding text
  vis.svg.append('text')
      .attr('y', vis.height - 10)
      .attr('x', 0)
      .text('Click the name of an ability to sort the columns!')
      .attr('class', 'annotation');

  vis.wrangleData();
};

Matrix.prototype.wrangleData = function() {
  var vis = this;


  vis.displayData = Array(vis.matrixData.length);
  vis.matrixData.forEach(function(d, i) {
    let col = Array(vis.attributes.length);
    vis.attributes.forEach(function(a, j) {
      col[j] = d[a];
    });
    vis.displayData[i] = {name: d.name, data: col};
  });

  vis.updateVis();
};

Matrix.prototype.updateVis = function() {
  var vis = this;

  var rowLabs = vis.gRowLabs
      .selectAll("text.row_label")
        .data(vis.attributes)
      .enter().append('text')
        .attr('class', 'row_label')
        .text(d => titleCase(d))
        .style('text-anchor', 'end')
        .style('alignment-baseline', 'hanging')
        .attr('x', -vis.innerPadding)
        .attr('y', (d, i) => (vis.rectWidth + vis.innerPadding) * i + vis.innerPadding)
        .on('click', d => vis.sortMatrix(d, vis))
        .on('mouseover', function() { d3.select(this).attr('fill', '#f78f3f'); })
        .on('mouseout', function() { d3.select(this).attr('fill', 'black'); })
        .call(wrap, 10);

  vis.cols = vis.svg.selectAll('g.col')
      .data(vis.displayData, d => d.name);

  var colEnter = vis.cols.enter()
      .append('g')
      .attr('class', 'col');

  colEnter.append('image')
      .attr('xlink:href', d => getSvgIcon(d.name))
      .attr('x', 0)
      .attr('y', -vis.rectWidth)
      .attr('width', vis.rectWidth)
      .attr('height', vis.rectHeight)
      .on('mouseover', d => vis.showDetail(d, vis))
      .on('mouseout', d => vis.hideDetail(d, vis));

  vis.cols = colEnter.merge(vis.cols)
      .transition(400)
      .attr('transform', (d, i) => 'translate(' + ((vis.rectWidth + vis.innerPadding) * i + vis.innerPadding) + ",0)")
      .selection();

  // Set x and y for the rows
  var cells = vis.cols.selectAll('g.cell')
      .data(d => d.data);

  var cellEnter = cells.enter()
      .append('g')
      .attr('class', 'cell');

  cellEnter.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', vis.rectWidth)
      .attr('width', vis.rectWidth)
      .attr('class', 'no-power')
      .style('opacity', d => 1 - d);

  cellEnter.append('image')
      .attr('xlink:href', function(d, i) {
        return vis.svgImagesMapping[i];
      })
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', vis.rectWidth)
      .attr('width', vis.rectWidth)
      .style('opacity', d => d);

  cellEnter.merge(cells)
      .attr('transform', (d, i) => 'translate(0,' + (vis.innerPadding + (vis.innerPadding + vis.rectWidth) * i) + ')');
};

Matrix.prototype.showDetail = function(d, vis) {
  vis.tooltip.transition()
      .style('opacity', 0.8);

  vis.tooltip.html(`<p>${d.name}</p>`)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY + 10) + "px");
};

Matrix.prototype.hideDetail = function(d, vis) {
  vis.tooltip.transition()
      .duration(100)
      .style("opacity", 0);
};

Matrix.prototype.sortMatrix = function(power, vis) {
  console.log(`Sorting by ${power}`);
  vis.matrixData = vis.matrixData.sort(function(a,b){
    return b[power] - a[power];
  });

  console.log(vis.matrixData);

  vis.wrangleData();
};
Matrix.prototype.highlightCol = function(character) {
  var vis = this;
  console.log("Highlighting");
  vis.cols.style('opacity', d => d.name === character ? 1 : 0.3);
};
Matrix.prototype.clearHighlight = function() {
  var vis = this;

  vis.cols.style('opacity', 1);
};
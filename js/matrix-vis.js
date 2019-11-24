/**
 * MatrixVis - Object constructor function
 *
 * Matrix visualization for the abilities of major characters
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _matrix_data              -- matrix values data
 * @param _all_characters_data    -- all characters data
 * @constructor
 */

Matrix = function(_parentElement, _matrix_data, _all_characters_data) {
  this.parentElement = _parentElement;


  this.binaryData = [[1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0]]
    // [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1]]
  this.matrixData = _matrix_data;
  this.allCharactersData = _all_characters_data;
  this.displayData = [];

  this.initVis();
};

Matrix.prototype.initVis = function() {
  //code from lab 6
  var vis = this;

  vis.margin = {
    'top': 20,
    'bottom': 0,
    'left': 50,
    'right': 10
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width /2;

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

  vis.wrangleData();
};

Matrix.prototype.wrangleData = function() {
  var vis = this;

  //matrix data
  vis.matrixData.forEach(function(d, i) {
    d.name = d.name;
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
    d.power = d.power;
  });

  //all characters data
  vis.allCharactersData.forEach(function(d, i) {
    d.name = d.name;
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
    d.durability = +d.durability;
    d.energy = +d.energy;
    d.fighting_skills = +d.fighting_skills;
    d.intelligence = +d.intelligence;
    d.speed = +d.speed;
    d.strength = +d.strength;
  });

  vis.displayData = vis.binaryData;
  // Update the visualization
  vis.updateVis();
};

Matrix.prototype.updateVis = function() {
  var vis = this;

  var u = vis.svg.append("g")
      .selectAll("image")
      .data(vis.matrixData);

  //column character icons
  vis.matrixData.forEach(function(d,j){
    vis.svg.append("image")
        .attr('xlink:href', () => {
          return svgCharactersMapping[j];
        })
        .attr("x", (vis.rectWidth + vis.innerPadding) * j + vis.innerPadding)
        .attr("y", -vis.innerPadding * 2)
        .attr("width", vis.rectWidth)
        .attr("height", vis.rectWidth)
        .attr("opacity", 1)
        .on('click', function(d,index){
          console.log("character clicked")
        });
  });

  u.enter()
      .append('image')
      .attr('xlink:href', (d,j) => {
        return svgCharactersMapping[j];
      })
      .attr("x", (d,j) => {
          return vis.margin.left + 40 * j + 40
      })
      .attr("y", vis.margin.top)
      .attr("width", 40)
      .attr("height", 40)
      .attr("opacity", 1)
      .on('click', function(d,index){
        console.log("character clicked")

      })
      // .on('mouseover', function(d){console.log(d)})
      .on('mouseover', d => vis.showDetail(d, vis))
      .on('mouseout', d => vis.hideDetail(d, vis))

  u.exit().remove();

  // vis.rgroup = vis.svg.selectAll(".matrix_row")
  //     .data(vis.displayData, function(d), )
  //     .append("g")
  //     .attr("class", "matrix_row")
  //     .attr("transform", "translate(" + (vis.margin.left + 10) +
  //         "," + (vis.margin.top + 31*i + 10) + ")");



  //code for regular rectangles
  vis.displayData.forEach(function(row, i) {
    //group to each row
    vis.rgroup = vis.svg.append("g")
      .attr("class", "matrix_row")
      .attr("transform", "translate(" + 0 +
        "," + ((vis.rectWidth + vis.innerPadding) * i + vis.innerPadding) + ")");

    //add rect to each row
    row.forEach(function(element, j) {
      vis.rgroup.append("rect")
        .attr("x", (vis.rectWidth + vis.innerPadding) * j + vis.innerPadding)
        .attr("y", vis.innerPadding)
        .attr("width", vis.rectWidth)
        .attr("height", vis.rectWidth)
        .attr("opacity", element === 0 ? 1 : 0)
        .attr("fill", function(d) {
          return "lightgrey"
        });
    });

    //add SVG to each row
    row.forEach(function(element, j) {
      // console.log(j)
      vis.rgroup.append("image")
        .attr('xlink:href', (d) => {
          return vis.svgImagesMapping[i];
        })
        .attr("x", (vis.rectWidth + vis.innerPadding) * j + vis.innerPadding)
        .attr("y", vis.innerPadding)
        .attr("width", vis.rectWidth)
        .attr("height", vis.rectWidth)
        .attr("opacity", element === 0 ? 0 : 1)
    });
  });

  //row power labels
  vis.svg.selectAll("text.row_label")
      .data(vis.matrixData)
      .enter()
      .append("text")
      .attr("class", "row_label")
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr("x", 0)
      .attr("y", (d, i) => (vis.rectWidth * (i + 1/2) + vis.innerPadding * (i - 1/2)))
      .text(function(col) {
        if (col.power.length > 0) {
          return titleCase(col.power);
        }
        return col.power;
      })
      .style("text-anchor", "end")
      .attr("font-size", 9)
      .on('click', function(d,index){
        vis.sortMatrix(d.power)
      })
      .call(wrap, 10);
};

Matrix.prototype.showDetail = function(d, vis) {
  vis.tooltip.transition()
      .style('opacity', 0.8);

  vis.tooltip.html(`<h4>${d.name}</h4>`)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY + 10) + "px");
};

Matrix.prototype.hideDetail = function(d, vis) {
  vis.tooltip.transition()
      .duration(100)
      .style("opacity", 0);
};

Matrix.prototype.sortMatrix = function(field) {
  var vis = this;

  vis.matrixData.sort(function(a,b){
    console.log(a)
    return b[field] - a[field]
  });

  console.log(vis.matrixData)

  var rgroup = vis.svg.selectAll('.matrix_row')
      .data(vis.matrixData, function(d){
        console.log(d)
        // return d.power
      });

  // console.log(rgroup)

  rgroup.transition().duration(1000)
      .attr("transform", function(d,i){
        return "translate(" + (10) +
            "," + (31*i + 10) + ")";
      });
};

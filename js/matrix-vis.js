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
  this.originalData = [
    [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1]
  ];

  this.binaryData = [[1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1]]
  this.matrixData = _matrix_data;
  this.allCharactersData = _all_characters_data;
  this.displayData = [];

  this.initVis();
};

Matrix.prototype.initVis = function() {
  //code from lab 6
  var vis = this;

  vis.margin = {
    'top': 0,
    'bottom': 40,
    'left': 40,
    'right': 40
  };
  vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = vis.width * 2.5;

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
      9: baseDir+"chemistry.svg",
      10: baseDir+"male.svg",
  };

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
    d.gender = +d.gender;
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
    d.gender = +d.gender;
    d.durability = +d.durability;
    d.energy = +d.energy;
    d.fighting_skills = +d.fighting_skills;
    d.intelligence = +d.intelligence;
    d.speed = +d.speed;
    d.strength = +d.strength;
  });

  // Update the visualization
  vis.updateVis();
};

Matrix.prototype.updateVis = function() {
  var vis = this;

  //column character icons
  vis.matrixData.forEach(function(d,j){
    vis.svg.append("image")
        .attr('xlink:href', () => {
          return svgCharactersMapping[j];
        })
        .attr("x", vis.margin.left + 40 * j + 40)
        .attr("y", vis.margin.top)
        .attr("width", 40)
        .attr("height", 40)
        .attr("opacity", 1)
  });

  //row power labels
  vis.svg.selectAll("text.row_label")
    .data(vis.matrixData)
    .enter()
    .append("text")
    .attr("class", "row_label")
    // .attr("x", -40)
    .attr("x", vis.margin.left +30)
    .attr("y", function(d, index) {
      return 30 * index + 70;
    })
    .text(function(col) {
      return col.power;
    })
    .style("text-anchor", "end")
    .attr("font-size", 13);


  // //row labels
  // vis.svg.selectAll("text.row_label")
  //   .data(vis.matrixData)
  //   .enter()
  //   .append("text")
  //   .attr("class", "row_label")
  //   .attr("x", 70)
  //   .attr("y", function(d, index) {
  //     return 40 * index + 75;
  //   })
  //   .text(function(row) {
  //     return row.name;
  //   })
  //   .attr("fill", "black")
  //   .attr("text-anchor", "end")
  //   .attr("font-size", 13);

  //code for regular rectangles
  vis.binaryData.forEach(function(row, i) {
    //group to each row
    vis.rgroup = vis.svg.append("g")
      .attr("class", "matrix_row")
      .attr("transform", "translate(" + (vis.margin.left + 10) +
        "," + (vis.margin.top + 31*i + 10) + ")");

    //add rect to each row
    row.forEach(function(element, j) {
      vis.rgroup.append("rect")
        .attr("x", vis.margin.left + 40 * j)
        .attr("y", vis.margin.top + 35)
        .attr("width", 25)
        .attr("height", 25)
        .attr("opacity", (d) => {
          // Flipping the logic: Visible only for 0's b/c we fill 1's with
          // image SVGs.
          if (element === 0) {
            return 1;
          } else {
            return 0;
          }
        })
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
        .attr("x", vis.margin.left + 40 * j -5)
        .attr("y", vis.margin.top + 35)
        .attr("width", 35)
        .attr("height", 35)
        .attr("opacity", (d) => {
          if (element === 1) {
            return 1;
          } else {
            return 0;
          }
        })
    });
  });
};

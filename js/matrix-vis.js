/**
 * MatrixVis - Object constructor function
 *
 * Matrix visualization for the abilities of major characters
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _binary_data           -- binary values data
 * @param _all_characters_data    -- all characters data
 * @constructor
 */

Matrix = function(_parentElement, _binary_data, _all_characters_data){
    this.parentElement = _parentElement;
    // this.binaryData = _binary_data;
    this.binaryData = [
        [1,1,1,0,0,1,1,1,0,0,1],
        [1,1,1,0,0,0,1,0,0,1,1],
        [1,1,0,1,0,0,1,1,0,0,1],
        [0,0,1,0,0,0,0,0,0,0,0],
        [1,1,1,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,1,0,0,0,1],
        [0,0,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,0,0,1,0,1,1],
        [1,1,0,0,0,0,0,1,1,1,0],
        [0,1,0,0,0,1,0,1,0,0,1],
        [0,1,1,0,0,0,1,1,0,0,1],
        [0,1,0,1,0,0,1,0,0,0,1],
        [0,0,0,1,1,0,0,0,0,0,1],
        [1,1,1,0,0,1,0,1,1,0,1],
        [0,0,0,1,0,0,0,0,0,0,0],
        [1,0,0,1,0,0,0,0,0,0,1],
        [0,0,1,0,0,0,0,0,0,0,1],
        [1,1,1,0,0,1,0,0,0,1,1],
        [1,1,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,1,0,1,0],
        [1,1,1,1,0,0,0,0,0,0,1],
        [0,1,1,1,0,0,0,0,0,0,1]];
    this.allCharactersData = _all_characters_data;
    this.displayData = [];

    this.initVis();
};

Matrix.prototype.initVis = function() {
    //code from lab 6
    var vis = this;

    vis.margin = {
        'top': 40,
        'bottom': 40,
        'left': 40,
        'right': 40
    };
    vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = vis.width * 2;

    vis.svg = makeSvg(vis, 'matrix-vis');

    vis.wrangleData();
};

Matrix.prototype.wrangleData = function(){
    var vis = this;

    vis.allCharactersData.forEach(function(d, i){
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

    // console.log(vis.characterData);

    // Update the visualization
    vis.updateVis();
};

Matrix.prototype.updateVis = function() {
    var vis = this;

    //code for regular rectangles
    vis.binaryData.forEach(function(row,i){
        console.log(row)
        vis.rgroup = vis.svg.append("g")
            .attr("class", "matrix_row")
            .attr("transform", "translate(" + vis.margin.left +
                "," + vis.margin.top * (i+1) + ")");

        row.forEach(function(element, j){
            vis.rgroup.append("rect")
                .attr("x", vis.margin.left + 50*j)
                .attr("y",vis.margin.top + 30)
                .attr("width", 30)
                .attr("height", 30)
                .attr("fill", function(d){
                    if (element == 1){
                        return "orange"
                    }
                    else{ return "lightgrey"}
                });
        });
    });
};

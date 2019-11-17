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

Matrix = function(_parentElement, _matrix_data, _all_characters_data){
    this.parentElement = _parentElement;
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
    this.matrixData = _matrix_data;
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
    vis.height = vis.width * 2.2;

    vis.svg = makeSvg(vis, 'matrix-vis');

    vis.wrangleData();
};

Matrix.prototype.wrangleData = function(){
    var vis = this;

    //matrix data
    vis.matrixData.forEach(function(d,i){
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
    vis.allCharactersData.forEach(function(d, i){
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

    //column labels
    vis.svg.selectAll("text.col_label")
        .data(vis.matrixData)
        .enter()
        .append("text")
        .attr("class", "col_label")
        .attr("x", 0)
        .attr("y", 0)
        .text(function(col){
            return col.power;
        })
        .attr("fill", "black")
        .style("text-anchor", "start")
        .attr("font-size", 13)
        .attr("transform", function(d,index){
            return "translate(" +(35*index + 90) + ",100)rotate(-750)"
        });

    //row labels
    vis.svg.selectAll("text.row_label")
        .data(vis.matrixData)
        .enter()
        .append("text")
        .attr("class", "row_label")
        .attr("x", 70)
        .attr("y", function(d,index){
            return 40*index + 120;
        })
        .text(function(row){
            return row.name;
        })
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .attr("font-size", 13);

    //code for regular rectangles
    vis.binaryData.forEach(function(row,i){
        //group to each row
        vis.rgroup = vis.svg.append("g")
            .attr("class", "matrix_row")
            .attr("transform", "translate(" + vis.margin.left +
                "," + vis.margin.top * (i+1) + ")");

        //add rect to each row
        row.forEach(function(element, j){
            vis.rgroup.append("rect")
                .attr("x", vis.margin.left + 35*j)
                .attr("y",vis.margin.top + 25)
                .attr("width", 25)
                .attr("height", 25)
                .attr("fill", function(d){
                    if (element == 1){
                        return "#e23636"
                    }

                    else{ return "lightgrey"}

                });
        });
    });
};

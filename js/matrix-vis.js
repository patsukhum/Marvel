Matrix = function(_parentElement, _characterData){
    this.parentElement = _parentElement;
    this.characterData = _characterData;

    this.initVis();
};

Matrix.prototype.initVis = function() {
    //code from lab 6
    var vis = this;

    vis.margin = {top: 40, right: 0, bottom: 60, left: 60};

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 800 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    // .append("g")
    // .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.wrangleData();
};

Matrix.prototype.wrangleData = function(){
    var vis = this;

    vis.characterData.forEach(function(d, i){
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

    vis.matrix_data =




        // Update the visualization
        vis.updateVis();
};

Matrix.prototype.updateVis = function() {
    var vis = this;

    //code for regular rectangles
    vis.characterData.forEach(function(row,i){
        console.log(row)
        vis.rgroup = vis.svg.append("g")
            .attr("class", "matrix_row")
            .attr("transform", "translate(" + vis.margin.left +
                "," + vis.margin.top * (i+1) + ")");

        row.each(function(element, j){
            vis.rgroup.append("rect")
                .attr("x", vis.margin.left + 35*j)
                .attr("y",vis.margin.top + 50)
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

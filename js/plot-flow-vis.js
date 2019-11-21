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
  this.parentElemen = _parentElement;
  this.data = _data;
  this.displayData = _data;

  this.initVis();
};
PlotFlowVis.prototype.initVis = function() {
  var vis = this;

  vis.wrangleData();
};
PlotFlowVis.prototype.wrangleData = function() {
  var vis = this;

  console.log(vis.data);

  vis.updateVis()
};
PlotFlowVis.prototype.updateVis = function() {};

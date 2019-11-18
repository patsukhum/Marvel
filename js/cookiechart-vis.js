/**
 * CookieChartVis - Object constructor function
 *
 * Cookie Chart (officially called Circle Packing Chart) showing revenues of
 * movies by genre data
 *
 * @param _parentElement  -- ID of HTML element that will contain the vis
 * @param _data           -- Genres of movies data
 * @constructor
 */

 CookieChartVis = function(_parentElement, _data) {
   this.parentElement = _parentElement;
   this.data = _data;

   this.initVis();
 };


 CookieChartVis.prototype.initVis = function() {
     var vis = this;

     vis.margin = {
         'top': 40,
         'bottom': 40,
         'left': 40,
         'right': 40
     };
     vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
     vis.height = vis.width* 1.2;
     vis.svg = makeSvg(vis, 'cookiechart-vis');

     vis.wrangleData();
 };

 CookieChartVis.prototype.wrangleData = function(){
     var vis = this;

     var allGenres = new Set();


     console.log(vis.data);

     vis.updateVis();
 };

 CookieChartVis.prototype.updateVis = function() {
     var vis = this;

}

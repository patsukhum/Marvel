// Globals
var plotVis,
    linechartVis,
    networkIntroVis,
    networkVis;

// //create Vis1:
queue()
 .defer(d3.csv, 'data/clean/genre_revenue.csv')
 .await(createCookieVis)

function createCookieVis(error, data) {
  var cookiechartVis = new CookieChartVis('cookiechart-vis', data);
}

// create Vis2: line chart
queue()
    .defer(d3.csv, 'data/clean/marvel_dc_movies.csv')
    .await(createLineChartVis);

function createLineChartVis(error, data) {
  linechartVis = new LineChartVis('linechart-vis', data);
}


// create Vis2.5: map chart
queue()
    .defer(d3.csv, 'data/clean/endgame_clean.csv')
    .defer(d3.json, 'data/clean/world-110m.json')
    .defer(d3.json, 'data/clean/slim-2.json')
    .await(createMapVis);

function createMapVis(error, data1, data2, data3) {

  var mapVis = new MapVis('map-vis', data1, data2, data3);
}

// create Vis2.7: movie flow chart
d3.csv('data/clean/mcu_plot_flow.csv', function(data) {
  plotVis = new PlotFlowVis('plot-flow-vis', data);
});

// create Vis3: network chart
queue()
    .defer(d3.json, 'data/clean/all_character_nodes_centrality.json')
    .defer(d3.json, 'data/clean/all_character_links.json')
    .await((error, nodes, edges) => { createNetworkVis(error, nodes, edges); createNetworkIntroVis(error, nodes, edges); });

function createNetworkVis(error, nodes, edges) {
  var data = {'nodes': nodes, 'edges': edges};
  var config = {
    minNodeRadius: 10,
    maxNodeRadius: 30,
    strength: -400,
    distance: 100
  };
  networkVis = new NetworkVis('network-vis', data, config);
}
function createNetworkIntroVis(error, nodes, edges) {
  var namesToKeep = ['Iron Man', 'Hulk'];
  var nodesFilt = nodes.filter(d => namesToKeep.includes(d.name));
  var edgesFilt = edges.filter(d => namesToKeep.includes(d.source.name) && namesToKeep.includes(d.target.name));
  var data = {'nodes': nodesFilt, 'edges': edgesFilt};
  var config = {
    height: 300,
    margin: { top: 10, bottom: 10, left: 10, right: 10},
    strength: -50,
    distance: 100,
    minNodeRadius: 20,
    maxNodeRadius: 20,
    hideTooltip: true
  };
  networkIntroVis = new NetworkVis('network-intro-vis', data, config);
}


//create Vis4: matrix
queue()
    .defer(d3.csv, 'data/clean/matrix_data.csv')
    .defer(d3.csv, 'data/raw/all_characters_data.csv')
    .await(createMatrixVis);

function createMatrixVis(error, matrix_data, all_characters_data) {
  console.log(matrix_data);
  console.log(all_characters_data);
  var matrixVis = new Matrix("matrix-vis", matrix_data, all_characters_data);
};

// Globals
var plotVis,
    cookiechartVis,
    linechartVis,
    networkIntroVis,
    networkVis,
    matrixVis;


// //create Vis1:
queue()
 .defer(d3.csv, 'data/clean/genre_revenue.csv')
 .await(createCookieVis)

function createCookieVis(error, data) {
  cookiechartVis = new CookieChartVis('cookiechart-vis', data);
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
    // .defer(d3.csv, 'data/clean/endgame_clean.csv')
    .defer(d3.csv, 'data/clean/map-data-all.csv')
    .defer(d3.json, 'data/clean/world-110m.json')
    .defer(d3.json, 'data/clean/slim-2.json')
    .defer(d3.csv, 'data/clean/map-data-aux.csv')
    .await(createMapVis);

function createMapVis(error, data1, data2, data3, data4) {

  var mapVis = new MapVis('map-vis', data1, data2, data3, data4);
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
    height: 400,
    minNodeRadius: 10,
    maxNodeRadius: 30,
    strength: -400,
    distance: 150,
    margin: {top: 20, bottom: 80, left: 20, right: 20}
  };
  networkVis = new NetworkVis('network-vis', data, config);
}
function createNetworkIntroVis(error, nodes, edges) {
  var namesToKeep = ['Iron Man', 'Hulk'];
  var nodesFilt = nodes.filter(d => namesToKeep.includes(d.name));
  var edgesFilt = edges.filter(d => namesToKeep.includes(d.source.name) && namesToKeep.includes(d.target.name));
  var data = {'nodes': nodesFilt, 'edges': edgesFilt};
  var config = {
    height: 370,
    margin: { top: 10, bottom: 10, left: 10, right: 10},
    strength: -100,
    distance: 120,
    minNodeRadius: 35,
    maxNodeRadius: 35,
    hideTooltip: true
  };
  networkIntroVis = new NetworkVis('network-intro-vis', data, config);
}


//create Vis4: matrix
queue()
    .defer(d3.csv, 'data/clean/matrix_data.csv')
    .await(createMatrixVis);

function createMatrixVis(error, matrix_data) {
  console.log(matrix_data);
  matrixVis = new Matrix("matrix-vis", matrix_data);
};

d3.select('#sort').on('change', function() {
  choice = d3.select('#sort').property('value');
  console.log(choice);
  matrixVis.sortMatrix();
})

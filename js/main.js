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
  console.log(data);

  var linechartVis = new LineChartVis('linechart-vis', data);
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


  var plotVis = new PlotFlowVis('plot-flow-vis', data);
});

// create Vis3: network chart
queue()
    .defer(d3.json, 'data/clean/all_character_nodes_centrality.json')
    .defer(d3.json, 'data/clean/all_character_links.json')
    .await(createNetworkVis);

function createNetworkVis(error, nodes, edges) {
  console.log(nodes);
  console.log(edges);
  var data = {'nodes': nodes, 'edges': edges};
  var networkVis = new NetworkVis('network-vis', data);
}

//create Vis4: matrix
queue()
    .defer(d3.csv, 'data/clean/matrix_data.csv')
    .defer(d3.csv, 'data/raw/all_characters_data.csv')
    .await(createMatrixVis);

function createMatrixVis(error, matrix_data, all_characters_data) {
  console.log(matrix_data)
  console.log(all_characters_data)
  matrixVis = new Matrix("matrix-vis", matrix_data, all_characters_data);
};

d3.select('#sort').on('change', function() {
  choice = d3.select('#sort').property('value');
  console.log(choice);
  matrixVis.sortMatrix();
})
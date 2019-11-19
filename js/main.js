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
};

//create Vis4: matrix
queue()
    .defer(d3.csv, 'data/clean/matrix_data.csv')
    .defer(d3.csv, 'data/raw/all_characters_data.csv')
    .await(createMatrixVis);

function createMatrixVis(error, matrix_data, all_characters_data) {
  console.log(matrix_data)
  console.log(all_characters_data)
  var matrixVis = new Matrix("matrix-vis", matrix_data, all_characters_data);
};

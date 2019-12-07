

// Globals
var plotVis,
    cookiechartVis,
    linechartVis,
    networkIntroVis,
    networkVis,
    charStatsVis,
    mapVis,
    matrixVis;

// create Vis0 for title slide:
queue()
    .defer(d3.csv, 'data/clean/matrix_data.csv')
    .await(createTitleVis);

function createTitleVis(error, matrix_data) {
  titleVis = new TitleVis("title-vis", matrix_data);
};


//create Vis1:
queue()
 .defer(d3.csv, 'data/clean/genre_revenue.csv')
 .defer(d3.json, 'data/clean/cookie_positions/stage1.json')
 .defer(d3.json, 'data/clean/cookie_positions/stage2.json')
 .defer(d3.json, 'data/clean/cookie_positions/stage3.json')
 .defer(d3.json, 'data/clean/cookie_positions/stage4.json')
 .await(createCookieVis);

function createCookieVis(error, data, data1, data2, data3, data4) {
  cookiechartVis = new CookieChartVis('cookiechart-vis', data, data1, data2, data3, data4);
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

  mapVis = new MapVis('map-vis', data1, data2, data3, data4);
}

// create Vis2.7: movie flow chart
d3.csv('data/clean/mcu_plot_flow.csv', function(data) {
  plotVis = new PlotFlowVis('plot-flow-vis', data);
});

// create Vis3: network chart
queue()
    .defer(d3.json, 'data/clean/all_character_nodes_centrality.json')
    .defer(d3.json, 'data/clean/all_character_links_undirected.json')
    .await((error, nodes, edges) => {
      createNetworkVis(error, nodes, edges);
      createCharStatsVis(nodes);
    });

function createNetworkVis(error, nodes, edges) {
  var data = {'nodes': nodes, 'edges': edges};
  var config = {
    height: 350,
    minNodeRadius: 10,
    maxNodeRadius: 30,
    strength: -50,
    distance: 150,
    margin: {top: 30, bottom: 20, left: 20, right: 20},
    linkToMatrix: true
};
  networkVis = new NetworkVis('network-vis', data, config, eventHandler);
}

// Character stats vis
function createCharStatsVis(data) {
  charStatsVis = new CharStatsVis('char-stats-vis', data, eventHandler);
}


//create Vis4: matrix
queue()
    .defer(d3.csv, 'data/clean/matrix_data.csv')
    .await(createMatrixVis);

function createMatrixVis(error, matrix_data) {
  matrixVis = new Matrix("matrix-vis", matrix_data, eventHandler);
}

d3.select('#sort').on('change', function() {
  choice = d3.select('#sort').property('value');
  matrixVis.sortMatrix();
});

function makeSvg(vis, chartType) {
  return d3.select('#' + vis.parentElement)
      .append('div')
      .attr('class', 'svg-container ' + chartType)
      .append('svg')
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .append('g')
      .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');
}


// create Vis2: line chart
queue()
    .defer(d3.csv, 'data/clean/genre_and_reviews_ombd.csv')
    .await(createLineChartVis);

function createLineChartVis(error, data) {
  console.log(data)
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
}


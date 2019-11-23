// **********  fullPage  ********** //
var myFullpage = new fullpage('#fullpage', {
  navigation: true,
  navigationPosition: 'right',
  scrollOverflow: true,

  afterLoad: function(origin, destination, direction) {
    secId = destination.item.getAttribute('id');
    switch(secId) {
      case 'linechart-sec':
          drawLineChartVis();
          break;
      case 'plot-flow-sec':
        drawPlotVis();
        break;
      case 'network-intro-vis':
        drawNetworkIntroVis();
        break;
      case 'network-vis':
        drawNetworkVis();
        break;
    }
  }
});

// ********** Plot plot ********** //
function drawPlotVis() {
  $(`#${secId} .caption span`).each(function(index) {
    $(this).delay(1000 + 2000 * (index)).fadeTo(1000, 1);
  });
  $(`#${secId} .caption button`).delay(4000).fadeTo(1000, 1);
  if (!plotVis.drawn) {
    plotVis.drawVis();
  }
}
$('#plot-flow-sec .caption').children().css('opacity', 0);
$('#plot-flow-sec button').on('click', function(event) {

  if (!plotVis.toggledBefore) {
    $("#plot-flow-sec .caption.text")
        .children('span')
        .fadeOut(1000, function() { $(this).remove() })
        .end()
        .append('span')
        .text("This is the timeline in the MCU universe. The plot flows from left to right along the lines. Click to toggle between the linear and branching timeline")
        .css('opacity', 0)
        .fadeTo(500, 1);
  }

  plotVis.toggleBranching();
});

// ********** Network intro ********** //
function drawNetworkIntroVis() {
  
}

// ********** Network vis ********** //
function drawNetworkVis() {

}

// ********** linechart vis ********** //
function drawLineChartVis() {
    linechartVis.updateVis();
}
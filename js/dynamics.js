// **********  fullPage  ********** //
var myFullpage = new fullpage('#fullpage', {
  navigation: true,
  navigationPosition: 'right',

  afterLoad: function(origin, destination, direction) {
    secId = destination.item.getAttribute('id');
    switch(secId) {
      case 'cookiechart-sec':
          drawCookieChartVis();
          break;
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
        .html("This is the timeline in the MCU world. The plot flows from left to right along the lines.<br/>Click to toggle between the linear and branching timeline.")
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
  if (!linechartVis.drawn) {
    linechartVis.updateVis();
  }
}

// ********** linechart vis ********** //
function drawCookieChartVis() {
  if (!cookiechartVis.drawn) {
    cookiechartVis.updateVis();
  }
}

// // ********** Event handler ********** //
// var eventHandler = {};
// $(eventHandler).bind("selectionChanged", function(character) {
//   matrixVis.highlightCol(character);
// });
// $(eventHandler).bind("selectionClear", function() {
//   matrixVis.clearHighlight();
// });

// **********  fullPage  ********** //
var myFullpage = new fullpage('#fullpage', {
  navigation: true,
  navigationPosition: 'right',
  scrollOverflow: true,

  afterLoad: function(origin, destination, direction) {
    secId = destination.item.getAttribute('id');
    switch(secId) {
      case 'plot-flow-sec':
        $(`#${secId} .caption span`).each(function(index) {
          $(this).delay(1000 + 3000 * (index)).fadeTo(2000, 1);
        });
        $(`#${secId} .caption button`).delay(6000).fadeTo(1000, 1);
        if (!plotVis.drawn) {
          plotVis.drawVis();
        }
    }
  }
});

// ********** Plot plot ********** //
$('#plot-flow-sec .caption').children().css('opacity', 0);
$('#plot-flow-sec button').on('click', function(event) {

  if (!plotVis.toggledBefore) {
    $("#plot-flow-sec .caption.text")
        .children('span')
        .fadeOut(1000, function() { $(this).remove() })
        .end()
        .append('span')
        .text("This is the timeline in the MCU universe. Click to toggle between the linear and branching timeline")
        .css('opacity', 0)
        .fadeTo(500, 1);
  }

  plotVis.toggleBranching();
});


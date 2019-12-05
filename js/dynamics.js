// **********  fullPage  ********** //
var myFullpage = new fullpage('#fullpage', {
  navigation: true,
  navigationPosition: 'right',

  afterLoad: function(origin, destination, direction) {
    var secId = destination.item.getAttribute('id');

    // update nav dots accordingly
    if(secId == 'mcu-intro-sec' || secId == 'map-sec' || secId == 'future-sec') {
 
      $('#fp-nav ul li a span').addClass('bright-navdots');
    }
    else {
      $('#fp-nav ul li a span').removeClass('bright-navdots');
    }

    switch (secId) {
      case 'cookiechart-sec':
        drawCookieChartVis();
        break;
      case 'linechart-sec':
        drawLineChartVis();
        break;
      case 'mcu-intro-sec':
        break;
      case 'plot-flow-sec':
        drawPlotVis();
        break;
      case 'characters-sec':
        if (!doneIntro) {
          charactersIntro();
        }
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
  $('#plot-flow-sec .caption span').each(function(index) {
    $(this).delay(1000 + 1500 * (index)).fadeTo(1000, 1);
  });
  $('#plot-flow-sec .caption button, #plot-flow-sec .caption span').delay(4000).fadeTo(1000, 1);
  if (!plotVis.drawn) {
    plotVis.drawVis();
  }
}
$('#plot-flow-sec .caption').children().css('opacity', 0);
$('#plot-flow-sec button').on('click', function(event) {

  if (!plotVis.toggledBefore) {
    $("#plot-flow-sec .caption.text")
      .children('span')
      .fadeOut(1000, function() {
        $(this).remove()
      })
      .end()
      .append('span')
      .html("This is the timeline in the MCU world. The plot flows from left to right along the lines.")
      .css('opacity', 0)
      .fadeTo(500, 1);
  }

  plotVis.toggleBranching();
});

$('#btn-cookie').on('click', function(event) {
  cookiechartVis.toggleCookie();
});

// $('#btn-cookie2').on('click', function(event) {
//   cookiechartVis.toggleCookie2();
// });

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

// ********** Event handler ********** //
var eventHandler = {};
eventHandler.clicked = false;
$(eventHandler).bind("clickHighlight", function(event, character) {
  if (this.clicked === character) {
    $(this).trigger("clickClear");
  } else {
    this.clicked = character;
    $(this).trigger("highlight", character);
  }
});
$(eventHandler).bind("clickClear", function() {
  this.clicked = false;
  $(this).trigger("selectionClear")
});
$(eventHandler).bind("mouseover", function(event, character) {
  if (!this.clicked) {
    $(this).trigger("highlight", character);
  }
});
$(eventHandler).bind("mouseout", function() {
  if (!this.clicked) {
    $(this).trigger("selectionClear");
  }
});
$(eventHandler).bind("highlight", function(event, character) {
  matrixVis.highlight(character);
  networkVis.highlight(character);
  charStatsVis.highlight(character);
});
$(eventHandler).bind("selectionClear", function() {
  matrixVis.clearHighlight();
  networkVis.clearHighlight();
});

// ********** Characters Intro ********** //
var doneIntro = false;

function charactersIntro() {
  doneIntro = true;
  startIntro();
}

function startIntro() {
  fadeOutAll();
  drawSkipButton();
  introNetwork();
}

function fadeOutAll() {
  [networkVis, charStatsVis, matrixVis].forEach(d => fadeOut(d));
}

function fadeInAll() {
  [networkVis, charStatsVis, matrixVis].forEach(d => fadeIn(d));
}

function introNetwork() {
  console.log("Intro network");
  networkVis.force.stop();

  // Show the network
  fadeIn(networkVis);
  networkVis.force.restart();

  // Show text
  var divRight = $("<div></div>").addClass('tutorial middle');
  divRight.appendTo(".col-right");
  divRight.append("<p>" +
    "This is a network of the links between the Wikipedia pages associated with each character. " +
    "Presumably, each link represents some sort of relation between the two characters. E.g. if " +
    "<span class='iron-man'>Iron Man</span> links to <span class='hulk'>Hulk</span>, then somewhere on " +
    "<span class='iron-man'>Iron Man</span>'s page is a reference to <span class='hulk'>Hulk</span>, " +
    "meaning that the two characters did something together." +
    "</p>" +
    "<button class='btn btn-danger btn-tutorial' id='tutorial1'>Continue</button>");

  // Re-cover and transition to introMatrix
  $("#tutorial1").on('click', function() {
    fadeOut(networkVis);
    networkVis.force.stop();
    divRight.remove();
    introMatrix();
  });
}

function introMatrix() {
  console.log("Intro matrix");
  fadeIn(matrixVis);

  // Show text
  var divLeft = $("<div></div>").addClass('tutorial bottom');
  divLeft.appendTo(".col-left");
  divLeft.append("<p>" +
    "In this matrix, we can see the superpowers and abilities of each of the avengers (and their enemeies) " +
    "Each row represents a type of ability and each column is a character. If a character has that ability, an " +
    "icon will be displayed. " +
    "<br/>" +
    "Try clicking the names of the powers to sort the matrix based on that power and try hovering " +
    "over the columns to see more stats on that character! " +
    "</p>" +
    "<button class='btn btn-danger btn-tutorial' id='tutorial2'>Continue</button>");

  $("#tutorial2").on('click', function() {
    fadeOut(matrixVis);
    divLeft.remove();
    introCharStats();
  })
}

function introCharStats() {
  console.log("Intro charStats");

  fadeIn(charStatsVis);

  // Show text
  var divLeft = $("<div></div>").addClass('tutorial top');
  divLeft.appendTo('.col-left');
  divLeft.append("<p>" +
    "When you hover over a character in the network or matrix, corresponding stats about their Wikipedia " +
    "presence are displayed, including their network centrality, views, page count, and word count. Hover " +
    "over the question marks to see more information on those measures!" +
    "</p>" +
    "<button class='btn btn-danger btn-tutorial' id='tutorial3'>Let me explore!</button>");

  $("#tutorial3").on('click', function() {
    divLeft.remove();
    endIntro();
  })

}

function endIntro() {
  $(".tutorial").remove();
  fadeInAll();
}

function drawSkipButton() {
  var button = $("<div class='tutorial top-left'>" +
    "<button class='btn btn-danger btn-tutorial' id='tutorial-skip'>Skip tutorial</button>" +
    "</div>");
  button.appendTo('.col-left');
  button.on('click', skipIntro);
}

function skipIntro() {
  endIntro();
}

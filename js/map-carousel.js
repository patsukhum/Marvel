$('.carousel').carousel({
    pause: true,
    interval: false
});

$('.poster').hover(function() {
    var movieId = $(this).data("movie");
    movieId = parseInt(movieId);
    $(this).addClass("shadowOn");

    // turn off shadow for all other posters
    $('.poster').not(this).removeClass("shadowOn");
    clicked(movieId, mapVis);
})
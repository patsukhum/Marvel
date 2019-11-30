$('.carousel').carousel({
    pause: true,
    interval: false
});

$('.poster').hover(function() {
    var movieId = $(this).data("movie");
    movieId = parseInt(movieId);
    clicked(movieId, mapVis);
})
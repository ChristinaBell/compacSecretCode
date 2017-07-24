$( document ).ready(function() {
    console.log(window.location.search);

    $('#dashboard-title').text(window.location.search);
});
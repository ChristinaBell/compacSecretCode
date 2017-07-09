
$( document ).ready(function() {

    // ---- Navigation bar items -----

    // Set the map nav bar item to take user to map page when clicked
    $("#map_nav").on('click', function() {
        location.href='MapPage.html';
    });

    // Set the home nav bar item to take user to home page when clicked
    $(".home_nav").on('click', function() {
      location.href='index.html';
    });

    // Set the home nav bar item to take user to home page when clicked
    $("#defect_nav").on('click', function() {
      location.href='DefectAccuracy.html';
    });

    // Set the home nav bar item to take user to home page when clicked
    $("#grade_nav").on('click', function() {
      location.href='GradeAccuracy.html';
    });

    // Set the home nav bar item to take user to home page when clicked
    $("#log_nav").on('click', function() {
      location.href='Logging.html';
    });

    // ---- Home page buttons -----

    // Set the map nav bar item to take user to map page when clicked
    $("#map_button").on('click', function() {
        location.href='MapPage.html';
    });


    // Set the home nav bar item to take user to home page when clicked
    $("#defect_acc_button").on('click', function() {
      location.href='DefectAccuracy.html';
    });

    // Set the home nav bar item to take user to home page when clicked
    $("#grade_acc_button").on('click', function() {
      location.href='GradeAccuracy.html';
    });

    // Set the home nav bar item to take user to home page when clicked
    $("#log_button").on('click', function() {
      location.href='Logging.html';
    });


});



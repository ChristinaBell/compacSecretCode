
$( document ).ready(function() {

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

    // -----------------------------------------------------------------------------------------------------------------

    // Instantiate the Leaflet maps API - centering at Auckland
    var mymap = L.map('map-container', {
        center: [-36.8485, 174.7633],
        zoom: 8
    });
    // Get the Leaflet maps API - and set the access token
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiY2hyaXN0aW5hbG91aXNlYmVsbCIsImEiOiJjajRxaTg5NWYwdWhkMzNwbG1zbDl4dzI5In0.jRVieoturPwTTrNscrJNnQ'
    }).addTo(mymap);


    // Create a circle to mark an area on the map
    var circle = L.circle([-36.8485, 174.7633], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.4,
        radius: 10000
    }).addTo(mymap);

    // Create a marker to mark a point on the map
    var marker = L.marker([-37.7485, 175.2633]).addTo(mymap);

    // Create a pop up to display over the pin
    marker.bindPopup("Hamilton.").openPopup();

    // -----------------------------------------------------------------------------------------------------------------





});


//<a href="http://google.com" class="btn btn-default">Go to Google</a>

$( document ).ready(function() {

    // ----------------------------------------------------------------------------------------------------------------

    // Instantiate the Leaflet maps API - centering around NZ
    var mymap = L.map('map-container', {
        center: [5, 190.7633],
        zoom: 2.5
    });
    mymap.options.minZoom = 1.8;


    // Get the Leaflet maps API - and set the access token
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiY2hyaXN0aW5hbG91aXNlYmVsbCIsImEiOiJjajRxaTg5NWYwdWhkMzNwbG1zbDl4dzI5In0.jRVieoturPwTTrNscrJNnQ'
    }).addTo(mymap);

    var oms = new OverlappingMarkerSpiderfier(mymap);



    // ----------------------------------------------------------------------------------------------------------------

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (mymap) {

        var div = L.DomUtil.create('div', 'info legend info-legend'),
        grades = ["Optimum (80-100% cupfill)", "Moderate (40-80% cupfill)", "Poor (0-40% cupfill)"],
        labels = ["icons/green_pin.png", "icons/orange_pin.png", "icons/red_pin.png"];

        div.innerHTML += '<h4 id="legend-title" >Packhouse Utilization:</h3> '

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    grades[i] + (" <img src="+ labels[i] +" height='30' width='20'>") +'<br>';
            }


    return div;
    };

    legend.addTo(mymap);

    // Define the red, green and orange pins for representing the proportion of utilisation
    var greenIcon = L.icon({
                    iconUrl: 'icons/green_pin.png',
                    iconSize:     [25, 40], // size of the icon
                    iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
                });

    var orangeIcon = L.icon({
                    iconUrl: 'icons/orange_pin.png',
                    iconSize:     [25, 40], // size of the icon
                    iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
                });

    var redIcon = L.icon({
                    iconUrl: 'icons/red_pin.png',
                    iconSize:     [25, 40], // size of the icon
                    iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
                });

    // AWS Lambda call
    AWS.config.region = 'ap-southeast-2'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-southeast-2:4d0f8a86-6998-44d5-b05b-953269d29426',
    });

    // Create Lambda object
    var lambda = new AWS.Lambda({region: 'ap-southeast-2', apiVersion: '2015-03-31'});

    // create JSON object for parameters for invoking Lambda function
    var pullParams = {
      FunctionName : 'readPackhouseLocations',
      InvocationType : 'RequestResponse',
      LogType : 'None'
    };

    // Create variable to hold data returned by the Lambda function
    var pullResults;

    lambda.invoke(pullParams, function(error, data) {
        if (error) {
            prompt(error);
        } else {
            pullResults = JSON.parse(data.Payload);
            updateMap(pullResults.Items);
        }
    });

    // Function to add pins to map
    function updateMap(packhouses){
        for (item in packhouses){
            packhouse = packhouses[item];

            var util = packhouse["Line 1 Cupfill"];
            if (util < 0.3){
                icon = redIcon;
            } else if (util < 0.5){
                icon = orangeIcon;
            } else {
                icon = greenIcon;
            }
            utilization = Math.round(util * 1000) / 10;

            var list = "<div class='popup-content'> "
                       + "<dl><dt>Customer:</dt>"
                       + "<dd class='popup-customer'>" + packhouse.Customer + "</dd>"
                       + "<dt>Packhouse:</dt>"
                       + "<dd class='popup-packhouse'>" + packhouse.Packhouse + "</dd>"
                       + "<dt>Cupfill:</dt>"
                       + "<dd>" + packhouse["Line 1 Cupfill"] + " %</dd>"
                       + "</div>"

            if (packhouse.Longitude < 0){
                packhouse.Longitude = packhouse.Longitude + 360;
            }

            marker = L.marker([packhouse.Latitude, packhouse.Longitude], {icon: icon}).addTo(mymap);

            marker.bindPopup(list);

            popup = L.popup()
                .setLatLng([packhouse.Latitude, packhouse.Longitude])
                .setContent(list)
                .openOn(mymap);

            oms.addMarker(marker);
              popup.setContent(marker.desc);
              popup.setLatLng(marker.getLatLng());
//              mymap.openPopup(popup);

            oms.addMarker(marker);

//            marker.bindPopup(packhouse.Customer + ", " + packhouse.Packhouse);
//            marker.on('mouseover', function (e) {
//                this.openPopup();
//            });


        }
        mymap.closePopup();
        mymap.panTo(new L.LatLng(5, 190.7633));
    }


//    mymap.on('popupopen', function() {
//        $('.popup-content').click(function() {
//            customer =  $(this).find('.popup-customer').text();
//            packhouse =  $(this).find('.popup-packhouse').text();
//            current_location = window.location.toString();
//            lastIndex = current_location.lastIndexOf('/');
//            relative_location = current_location.substr(0, lastIndex);
//            window.location = relative_location + '/DashboardPage.html?customer=' + customer + "&packhouse=" + packhouse;
//        });
//    });


});

$( document ).ready(function() {

    // ----------------------------------------------------------------------------------------------------------------

    // Instantiate the Leaflet maps API - centering at Auckland
    var mymap = L.map('map-container', {
        center: [5, 174.7633],
        zoom: 2.5
    });

    // Get the Leaflet maps API - and set the access token
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiY2hyaXN0aW5hbG91aXNlYmVsbCIsImEiOiJjajRxaTg5NWYwdWhkMzNwbG1zbDl4dzI5In0.jRVieoturPwTTrNscrJNnQ'
    }).addTo(mymap);


    // Create a circle to mark an area on the map
//    var circle = L.circle([-36.8485, 174.7633], {
//        color: 'red',
//        fillColor: '#f03',
//        fillOpacity: 0.4,
//        radius: 10000
//    }).addTo(mymap);


    // ----------------------------------------------------------------------------------------------------------------

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
        // Reload table with results from S3 lambda function call
        packhouses = pullResults.Items;

        for (item in packhouses){
            packhouse = packhouses[item];
            var marker = L.marker([packhouse.Latitude, packhouse.Longitude]).addTo(mymap);
            marker.bindPopup(packhouse.Packhouse);
            var marker = L.marker([packhouse.Latitude, packhouse.Longitude+ 360]).addTo(mymap);
            marker.bindPopup(packhouse.Packhouse);
        }
      }
    });






});
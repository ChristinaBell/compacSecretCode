
$( document ).ready(function() {

    // ----------------------------------------------------------------------------------------------------------------

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

    // ----------------------------------------------------------------------------------------------------------------

    // AWS Lambda call

//    AWS.config.update({region: 'ap-southeast-2'});
//    AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'ap-southeast-2:4d0f8a86-6998-44d5-b05b-953269d29426'});

    AWS.config.region = 'ap-southeast-2'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-southeast-2:4d0f8a86-6998-44d5-b05b-953269d29426',
    });

    var lambda = new AWS.Lambda({region: 'ap-southeast-2', apiVersion: '2015-03-31'});
    // create JSON object for parameters for invoking Lambda function
    var pullParams = {
      FunctionName : 'readLogsFromS3',
      InvocationType : 'RequestResponse',
      LogType : 'None'
    };
    // create variable to hold data returned by the Lambda function
    var pullResults;

    lambda.invoke(pullParams, function(error, data) {
      if (error) {
        prompt(error);
      } else {
        pullResults = JSON.parse(data.Payload);
        console.log(pullResults);
      }
    });










});
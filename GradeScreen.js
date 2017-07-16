
$( document ).ready(function() {

  // AWS Lambda call
  AWS.config.region = 'ap-southeast-2'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'ap-southeast-2:4d0f8a86-6998-44d5-b05b-953269d29426',
  });

  // Create Lambda object
  var lambda = new AWS.Lambda({region: 'ap-southeast-2', apiVersion: '2015-03-31'});

  // create JSON object for parameters for invoking Lambda function
  var pullParams = {
    FunctionName : 'dynamodb-write',
    InvocationType : 'RequestResponse',
    LogType : 'None'
  };

  // Create variable to hold data returned by the Lambda function
  var pullResults;
  var classes = ["Export", "Class 1", "Class 2", "Culls"];
  var p1 = [0,0,0,0];
  var p2 = [5,6,5,6,6];
  var p3 = [5,6,5,6,6];

  lambda.invoke(pullParams, function(error, data) {
    if (error) {
      prompt(error);
    } else {
      pullResults = JSON.parse(data.Payload);

      // reload the graph with results from the dynamoDB lambda function call
      sortData("p1", "p2", "p3", pullResults, "Class 2", "Kiwi Green");
    }
  });


  function sortData(packhouse1, packhouse2, packhouse3, data, necessaryGrade, necessaryFruitVariety){

    for (var i = 0; i < data.Items.length; i++) {
      var currItem = data.Items[i];
      var classed = false;

      var actualGrade = currItem.payload.Data.SampledGrade;
      var visionGrade = currItem.payload.Data.VisionGrade;
      var fruitVariety = currItem.payload.Data.PackRun.FruitVariety;
      var packhouse = "p1";
      //var packhouse = currItem.payload.Data.PackRun.FruitVariety;

      if ((necessaryFruitVariety == fruitVariety) && (necessaryGrade == visionGrade)){

        if (packhouse == packhouse1) { currTally = p1; }
        if (packhouse == packhouse2) { currTally = p2; }
        if (packhouse == packhouse3) { currTally = p3; }

        for (var j = 0; j < classes.length; j++) {
          if(classes[j] == actualGrade){
            currTally[j] = currTally[j] + 1;
            classed = true;
          }
        }
        // If the class does not exist in the current classes, then add it to the thingo.
        if (!classed) {
          classes.push(actualGrade);
          currTally.push(1);
          p2.push(0);
          p3.push(0);
        }
      }
     }

    makePercentage([p1,p2,p3]);
    drawGraph(p1,p2,p3, classes);
  }

  function makePercentage(packhouses){
    for (var z = 0; z < packhouses.length; z++) {
      var currTally = packhouses[z];
      sum = 0;

      for (var y = 0; y < currTally.length; y++) {
        sum = currTally[y] + sum;
      }

      for (var x = 0; x < currTally.length; x++) {
        currTally[x] = (currTally[x] / sum) * 100 ;
      }
    }
  }

  function drawGraph(p1,p2,p3,classes){
    // Bar chart
    new Chart($(".myChart"), {
        maintainAspectRatio: true,
        responsive: true,
        type: 'bar',
        data: {
          labels: classes,
          datasets: [
             {
                 label: "Blue",
                 backgroundColor: '#9BDA64',
                 borderWidth: 2,
                 data: p1
             },
             {
                 label: "Red",
                 backgroundColor: '#667279',
                 borderWidth: 2,
                 data: p2
             },
             {
                 label: "Green",
                 backgroundColor: '#C8E2F5',
                 borderWidth: 2,
                 data: p3
             }
           ]
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Accuracy breakdown per quality grade category',
            fontSize: 25,
          }
        }
    });
  }

  var filter = document.getElementById("classFilter");
          for (var m = 0; m < classes.length; m++){
              var currentClass = classes[m];
              var li = document.createElement("li");
              var link = document.createElement("a");
              var text = document.createTextNode(currentClass);
              link.appendChild(text);
              link.href = "#";
              li.appendChild(link);
              filter.appendChild(li);
          }

});

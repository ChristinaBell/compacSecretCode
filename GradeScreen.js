
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

  lambda.invoke(pullParams, function(error, data) {
    if (error) {
      prompt(error);
    } else {
      pullResults = JSON.parse(data.Payload);
      // reload the graph with results from the dynamoDB lambda function call
      sortData("p1", "p2", "p3", pullResults, "Class 2", "Kiwi Green");
    }
  });

  //TODO set up for the grades for each packhouse.

  function sortData(packhouse1, packhouse2, packhouse3, data, necessaryGrade, necessaryFruitVariety){
    var classes = ['Export', 'Class 1', 'Class 2', 'Culls'];
    var p1 = [0,0,0,0];
    var p2 = [0,0,0,0];
    var p3 = [0,0,0,0];

    for (var i = 0; i < data.Items.length; i++) {
      var currItem = data.Items[i];
      var classed = false;

      var actualGrade = currItem.payload.Data.SampledGrade;
      var visionGrade = currItem.payload.Data.VisionGrade;
      var fruitVariety = currItem.payload.Data.PackRun.FruitVariety;
      var packhouse = "p1";
      //var packhouse = currItem.payload.Data.PackRun.FruitVariety;

      if ((necessaryFruitVariety == fruitVariety) && (necessaryGrade == visionGrade)){

        if (packhouse == packhouse1) {
          currTally = p1;
        }
        if (packhouse == packhouse2) {
          currTally = p2;
        }
        if (packhouse == packhouse3) {
          currTally = p3;
        }

        for (var j = 0; j < classes.length; j++) {
          if(classes[j] == actualGrade){
            currTally[j] = currTally[j] + 1;
            classed = true;
          }
        }
        if (!classed) {
          classes.push(actualGrade);
          currTally.push(1);
          p2.push(0);
          p3.push(0);
        }
      }

     }
    drawGraph(p1,p2,p3, classes);
  }

  function drawGraph(p1,p2,p3,classes){
    // Bar chart
    new Chart($(".myChart"), {
        type: 'bar',
        data: {
          labels: classes,
          datasets: [
             {
                 label: "Blue",
                 backgroundColor: '#9BDA64',
                 borderColor: '#78B543',
                 borderWidth: 2,
                 data: p1
             },
             {
                 label: "Red",
                 backgroundColor: '#667279',
                 borderColor: '#44535B',
                 borderWidth: 2,
                 data: [5,6,5,6,6]
             },
             {
                 label: "Green",
                 backgroundColor: '#C8E2F5',
                 borderColor: '#1CA0FF',
                 borderWidth: 2,
                 data: [5,6,5,6,6]
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

});


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
  var classes = ['Defect 1', 'Defect 2', 'Defect 3', 'Defect 4'];
  var p1 = [0,0,0,0];
  var p2 = [5,6,5,6,6];
  var p3 = [5,6,5,6,6];

  lambda.invoke(pullParams, function(error, data) {
    if (error) {
      prompt(error);
    } else {
      pullResults = JSON.parse(data.Payload);
      // reload the graph with results from the dynamoDB lambda function call
      sortData("p1", "p2", "p3", pullResults, "Kiwi Green");
    }
  });


  function sortData(packhouse1, packhouse2, packhouse3, data, necessaryFruitVariety){

    console.log(data);

    for (var i = 0; i < data.Items.length; i++) {
      var currItem = data.Items[i];
      var isDefect = false;  // That there is a defect that hasn't been added to the list.

      var fruitVariety = currItem.payload.Data.PackRun.FruitVariety;
      var defects = currItem.payload.Data.PackRun.Defects; // CHANGE THIS TO FRUIT DEFECT
      console.log(defects);

      var packhouse = "p1";
      //var packhouse = currItem.payload.Data.PackRun.FruitVariety;

      if (necessaryFruitVariety == fruitVariety){

        if (packhouse == packhouse1) { currTally = p1; }
        if (packhouse == packhouse2) { currTally = p2; }
        if (packhouse == packhouse3) { currTally = p3; }

        // TODO find the defect of the fruit. and increment that one.
        for (var j = 0; j < classes.length; j++) {

          // TODO loop through the defects if needed.
          for(var k = 0; k < classes.length; k++){
            //if(classes[j] == defects.){
              currTally[j] = currTally[j] + 1;
              isDefect = true;
            //}
          }

        }

        // If the defect does not exist in the current classes, then add it to the thingo.
        if (!isDefect  /* && THERE IS A DEFECT */ ) {
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
                label: "Packhouse 1",
                data: p1,
                backgroundColor: 'rgba(120, 181, 67, 0.8)',
                pointColor: 'rgba(68, 83, 91, 1)',
                highlightFill: '#fff',
            },
            {
                label: "Packhouse 2",
                data: p2,
                backgroundColor: 'rgba(68, 83, 91, 1)',
                pointColor: 'rgba(68, 83, 91, 1)',
                highlightFill: '#fff',
            },
            {
                label: "Packhouse 3",
                data: p3,
                backgroundColor: 'rgba(28, 160, 255, 0.8)',
                pointColor: 'rgba(68, 83, 91, 1)',
                highlightFill: '#fff',
            }
           ]
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            fontSize: 25,
          },
          scales : {
              xAxes : [ {
                  gridLines : {
                      display : false
                  }
              } ]
          }
        }
    });
  }

});

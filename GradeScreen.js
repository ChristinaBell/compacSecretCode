
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
      reloadGraph(pullResults);
    }
  });


  function reloadGraph(data){
    var classes = ['Class 1', 'Class 2', 'Culls', 'Mierda'];
    var tally = [0, 0, 0, 0];

    var items = data.Items;

    for (var i = 0; i < items.length; i++) {
      var currItem = items[i];

      var sampledGrade = currItem.payload.Data.SampledGrade;
      var actualGrade = currItem.payload.Data.VisionGrade;
      var fruitVariety = currItem.payload.Data.PackRun.FruitVariety;

      //TODO Make sure that the fruit variety is what we want. Should make an input too the function.

      //TODO Make sure that the sampledGrade is what we want.
      //if(VisionGrade == necessaryGrade){}

      console.log(items.length);
      console.log(classes[1]);
      console.log(classes.length);
      console.log(sampledGrade);

      //Push the vision grades onto the x axis.
      for (var j = 0; j < classes.length; j++) {

        if(classes[j] == sampledGrade){
          tally[j] = tally[j] + 1;
        }
      }

      console.log(tally);

      //TODO We also need the packhouses too.
    }


    // Bar chart
    new Chart($(".myChart"), {
        type: 'bar',
        data: {
          labels: classes,
          datasets: [
            {
              label: "Accuracy",
              backgroundColor: 'rgba(200, 200, 200, 0.75)',
    					borderColor: 'rgba(200, 200, 200, 0.75)',
    					hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
    					hoverBorderColor: 'rgba(200, 200, 200, 1)',
              data: tally
            }
          ]
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Accuracy breakdown per quality grade category',
            fontSize: 30,
          }
        }
    });
  }

});

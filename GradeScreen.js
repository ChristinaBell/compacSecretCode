
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

  //
  var classes = ["Export", "Class 1", "Class 2", "Culls"];
  var packhouse1_Data = [0,0,0,0];
  var packhouse2_Data = [5,6,5,6,6];
  var packhouse3_Data = [5,6,5,6,6];
  var packhouse1_Name = "p1";
  var packhouse2_Name = "EastPack";
  var packhouse3_Name = "EastPack";
  var selectedClass = "Class 2";
  var selectedFruitVariety = "Kiwi Green";


  lambda.invoke(pullParams, function(error, data) {
    if (error) {
      prompt(error);
    } else {
      pullResults = JSON.parse(data.Payload);

      // reload the graph with results from the dynamoDB lambda function call
      sortData(pullResults);
    }
  });


  function sortData(data){

    for (var i = 0; i < data.Items.length; i++) {
      var currItem = data.Items[i];
      var classed = false;

      var actualGrade = currItem.payload.Data.SampledGrade;
      var visionGrade = currItem.payload.Data.VisionGrade;
      var fruitVariety = currItem.payload.Data.PackRun.FruitVariety;
      var packhouse = "p1";
      //var packhouse = currItem.payload.Data.PackRun.FruitVariety;

      // See if we've got the right fruit type and vision grade for particular data entry. To then add to the tallies.
      if ((selectedFruitVariety == fruitVariety) && (selectedClass == visionGrade)){

        if (packhouse == packhouse1_Name) { currTally = packhouse1_Data; }
        if (packhouse == packhouse2_Name) { currTally = packhouse2_Data; }
        if (packhouse == packhouse3_Name) { currTally = packhouse3_Data; }

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

          // Need to be added to the right packhouse Tallies.
          packhouse2_Data.push(0);
          packhouse3_Data.push(0);
        }
      }
     }

    makePercentage([packhouse1_Data, packhouse2_Data, packhouse3_Data]);
    drawGraph(packhouse1_Data, packhouse2_Data, packhouse3_Data, classes);
  }

  function makePercentage(packhouses){
    for (var z = 0; z < packhouses.length; z++) {
      var currSum = packhouses[z];
      sum = 0;

      for (var y = 0; y < currSum.length; y++) {
        sum = currSum[y] + sum;
      }

      for (var x = 0; x < currSum.length; x++) {
        currSum[x] = (currSum[x] / sum) * 100 ;
      }
    }
  }

  function drawGraph(p1_Data, p2_Data, p3_Data, classes){
    // Bar chart
    new Chart($(".myChart"), {
        maintainAspectRatio: true,
        responsive: true,
        type: 'bar',
        data: {
          labels: classes,
          datasets: [
             {
                 label: packhouse1_Name,
                 data: p1_Data,
                 backgroundColor: 'rgba(120, 181, 67, 0.8)',
                 pointColor: 'rgba(68, 83, 91, 1)',
                 highlightFill: '#fff',
             },
             {
                 label: packhouse2_Name,
                 data: p2_Data,
                 backgroundColor: 'rgba(68, 83, 91, 1)',
                 pointColor: 'rgba(68, 83, 91, 1)',
                 highlightFill: '#fff',
             },
             {
                 label: packhouse3_Name,
                 data: p3_Data,
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

  //******************************* The dropdown js ******************************/

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

    var packhouse1Filter = document.getElementById("packhouse1Filter");
          for (var iP1 = 0; iP1 < classes.length; iP1++){
              var currentClass = classes[iP1];
              var li = document.createElement("li");
              var link = document.createElement("a");
              var text = document.createTextNode(currentClass);
              link.appendChild(text);
              link.href = "#";
              li.appendChild(link);
              packhouse1Filter.appendChild(li);
          }

    var packhouse2Filter = document.getElementById("packhouse2Filter");
          for (var iP2 = 0; iP2 < classes.length; iP2++){
              var currentClass = classes[iP2];
              var li = document.createElement("li");
              var link = document.createElement("a");
              var text = document.createTextNode(currentClass);
              link.appendChild(text);
              link.href = "#";
              li.appendChild(link);
              packhouse2Filter.appendChild(li);
          }

      var packhouse3Filter = document.getElementById("packhouse3Filter");
            for (var iP3 = 0; iP3 < classes.length; iP3++){
                var currentClass = classes[iP3];
                var li = document.createElement("li");
                var link = document.createElement("a");
                var text = document.createTextNode(currentClass);
                link.appendChild(text);
                link.href = "#";
                li.appendChild(link);
                packhouse3Filter.appendChild(li);
            }

     $("#classFilter").on('click', 'li a', function(){
       $(".btn-class-select:first-child").text($(this).text());
       $(".btn-class-select:first-child").val($(this).text());
       $(".title-row h2").html("What the fruit were at " + $(this).text());
       selectedClass = $(this).text();
     });

     $("#packhouse1Filter").on('click', 'li a', function(){
       $(".btn-packhouse1:first-child").text($(this).text());
       $(".btn-packhouse1:first-child").val($(this).text());
       packhouse1_Name = $(this).text();
     });

     $("#packhouse2Filter").on('click', 'li a', function(){
       $(".btn-packhouse2:first-child").text($(this).text());
       $(".btn-packhouse2:first-child").val($(this).text());
       packhouse2_Name = $(this).text();
     });

     $("#packhouse3Filter").on('click', 'li a', function(){
       $(".btn-packhouse3:first-child").text($(this).text());
       $(".btn-packhouse3:first-child").val($(this).text());
       packhouse3_Name = $(this).text();
     });

  //*****************************************************************************/


});

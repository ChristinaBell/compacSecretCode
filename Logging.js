$( document ).ready(function() {


    // Define logging filers
    var ERRORTYPE = {
        "ERROR":  "ERROR",
        "WARNING": "WARNING"
    }
    var SOFTWARE = {
        "VISION": "VISION",
        "SIZER": "SIZER",
        "EXODUS": "EXODUS",
        "NEXUS": "NEXUS"
    }

    // AWS Lambda call
    AWS.config.region = 'ap-southeast-2'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-southeast-2:4d0f8a86-6998-44d5-b05b-953269d29426',
    });
    setupPage();


    function setupPage(){
        var pullParams = {
            FunctionName : 'dynamodb-write',
            InvocationType : 'RequestResponse',
            LogType : 'None'
          };

        var lambda = new AWS.Lambda({region: 'ap-southeast-2', apiVersion: '2015-03-31'});
        lambda.invoke(pullParams, function(error, data) {
            if (error) {
              prompt(error);
            } else {
              currentData = JSON.parse(data.Payload);
              getPackhouses();
            }
          });
     }

    function getPackhouses(){
         var packhouses = [];
         for (var i = 0; i < currentData.Items.length; i++) {
           var currentItem = currentData.Items[i];
           var packhouse = currentItem.payload.Data.PackRun.Packhouse;
           if (packhouses.indexOf(packhouse) == -1){
              packhouses.push(packhouse);
           }
         }
         updatePackhouseList(packhouses);
    }

    function updatePackhouseList(packhouses){
        var customerchecklist = $("#customer-check-list");

        var html = "<label>Customer:</label>";
          for (var i = 0; i < packhouses.length; i++){
              var currentPackhouse = packhouses[i];

              html = html + "<div class='checkbox'><label><input checked type='checkbox' name='Customer' value='EastPack'>"  + currentPackhouse + " </label> </div>"

              customerchecklist.html(html);
      }
    }

    //Call function to update the table with selected filters
    var filters = {
        "ErrorType": [ERRORTYPE.ERROR, ERRORTYPE.WARNING],
        "SoftwareType": ["SIZER"],
        "StartDate": $('#startDate').val(),
        "EndDate": $('#endDate').val()
    };
    updateTable(filters);

    function updateTable(filters){
        // Create Lambda object

        var lambda = new AWS.Lambda({region: 'ap-southeast-2', apiVersion: '2015-03-31'});

        // create JSON object for parameters for invoking Lambda function
        var pullParams = {
                  FunctionName : 'getLogsFiltered',
                  InvocationType : 'RequestResponse',
                  Payload: JSON.stringify(filters),
                  LogType : 'None'
                };

        // Create variable to hold data returned by the Lambda function
        var pullResults;

        lambda.invoke(pullParams, function(error, data) {
          if (error) {
            prompt(error);
          } else {
            pullResults = JSON.parse(data.Payload);
//            console.log(pullResults);
            // Reload table with results from S3 lambda function call
            reloadTable(pullResults);
          }
        });
    }

    // Function to reload logging table with data from S3
    function reloadTable(data){
        $('#logging-table').bootstrapTable("removeAll");
        if (Object.keys(data).length > 0){
            for (item in data){
                var obj = JSON.parse(data[item]);
                var date = new Date((item.split("/")[1])*1000);
                dict = {
                    Date: obj["Date"],
                    Customer: obj["Customer"],
                    Packhouse: obj["Packhouse"],
                    Software: obj["Machine"],
                    Error: obj["LogType"],
                    Message: obj["LogMessage"]
                };
                $('#logging-table').bootstrapTable("append", dict);
            }
        }
    }

    $('#update_logs').click(function() {
        var errorTypes = [];
        var softwareTypes = [];

        // check the selected error types for the filter
        if ($('#errorCheckbox').is(":checked")){
            errorTypes.push(ERRORTYPE.ERROR);
        }
        if ($('#warningCheckbox').is(":checked")){
            errorTypes.push(ERRORTYPE.WARNING);
        }

        // Check the selected machine types for the filter
        if ($('#visionCheckBox').is(":checked")){
            softwareTypes.push(SOFTWARE.VISION);
        }
        if ($('#sizerCheckbox').is(":checked")){
            softwareTypes.push(SOFTWARE.SIZER);
        }
        if ($('#exodusCheckbox').is(":checked")){
            softwareTypes.push(SOFTWARE.EXODUS);
        }
        if ($('#nexusCheckbox').is(":checked")){
            softwareTypes.push(SOFTWARE.NEXUS);
        }

//        console.log(errorTypes);
        filters.ErrorType = errorTypes;
        filters.softwareTypes = softwareTypes;
        filters.StartDate = $('#startDate').val();
        filters.EndDate = $('#endDate').val();
        updateTable(filters);
    });



    $('.input-daterange').datepicker({
        format: 'yyyy-mm-dd'
    });


});
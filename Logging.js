$( document ).ready(function() {

    // Define logging filers
    var ERRORTYPE = {
        "ERROR":  "ERROR",
        "WARNING": "WARNING"
    }
    var MACHINE = {
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

    //Call function to update the table with selected filters
    var filters = {
        "ErrorType": [ERRORTYPE.ERROR, ERRORTYPE.WARNING],
        "MachineType": ["SIZER"],
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
                    Machine: obj["Machine"],
                    Error: obj["LogType"],
                    Message: obj["LogMessage"]
                };
                $('#logging-table').bootstrapTable("append", dict);
            }
        }
    }

    $('#update_logs').click(function() {
        var errorTypes = [];
        var machineTypes = [];

        // check the selected error types for the filter
        if ($('#errorCheckbox').is(":checked")){
            errorTypes.push(ERRORTYPE.ERROR);
        }
        if ($('#warningCheckbox').is(":checked")){
            errorTypes.push(ERRORTYPE.WARNING);
        }

        // Check the selected machine types for the filter
        if ($('#visionCheckBox').is(":checked")){
            machineTypes.push(MACHINE.VISION);
        }
        if ($('#sizerCheckbox').is(":checked")){
            machineTypes.push(MACHINE.SIZER);
        }
        if ($('#exodusCheckbox').is(":checked")){
            machineTypes.push(MACHINE.EXODUS);
        }
        if ($('#nexusCheckbox').is(":checked")){
            machineTypes.push(MACHINE.NEXUS);
        }

//        console.log(errorTypes);
        filters.ErrorType = errorTypes;
        filters.MachineType = machineTypes;
        filters.StartDate = $('#startDate').val();
        filters.EndDate = $('#endDate').val();
        updateTable(filters);
    });



    $('.input-daterange').datepicker({
        format: 'yyyy-mm-dd'
    });


});
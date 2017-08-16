$(document).ready(function() {


    // Define logging filers
    var ERRORTYPE = {
        "ERROR": "ERROR",
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


    function setupPage() {
        var pullParams = {
            FunctionName: 'readPackhouseLocations',
            InvocationType: 'RequestResponse',
            LogType: 'None'
        };

        var lambda = new AWS.Lambda({
            region: 'ap-southeast-2',
            apiVersion: '2015-03-31'
        });
        lambda.invoke(pullParams, function(error, data) {
            if (error) {
                prompt(error);
            } else {
                currentData = JSON.parse(data.Payload);
                getCustomers(currentData.Items);
                getPackhouses(currentData.Items);
            }
        });
    }

    function getCustomers(currentData) {
        var packhouses = [];
        for (item in currentData) {
            packhouse = currentData[item];

            if (packhouses.indexOf(packhouse.Customer) == -1) {
                packhouses.push(packhouse.Customer);
            }
        }
        updateCustomerList(packhouses);
    }

    function updateCustomerList(packhouses) {
        var customerchecklist = $("#customer-check-list");

        var html = "<label>Customer:</label>";
        for (var i = 0; i < packhouses.length; i++) {
            var currentPackhouse = packhouses[i];
            html = html + "<div class='checkbox'><label><input checked class='customer_checkbox' type='checkbox' name='Customer' value='" + currentPackhouse + " '>" + currentPackhouse + " </label> </div>"
            customerchecklist.html(html);
        }
    }

    function getPackhouses() {
        checkedPackhouses = $('.customer_checkbox:checkbox:checked');

        var customers = [];
        var packhouses = [];

        for (var i = 0; i < checkedPackhouses.length; i++) {
            customers.push(checkedPackhouses[i].value);
        }
        customers = $.map(customers, $.trim);

        for (item in currentData.Items) {

            packhouse = currentData.Items[item];

            if ($.inArray(packhouse.Customer, customers) > -1) {

                packhouses.push(packhouse.Packhouse);
            }
        }
        updatePackhouseList(packhouses);
    }

    function updatePackhouseList(packhouses) {
        var packhousechecklist = $("#packhouse-check-list");
        var html = "<label>Packhouses:</label>";
        for (var i = 0; i < packhouses.length; i++) {
            var currentPackhouse = packhouses[i];

            html = html + "<div class='checkbox'><label><input checked class='packhouse_checkbox' type='checkbox' name='Customer' value='EastPack'>" + currentPackhouse + " </label> </div>"
            packhousechecklist.html(html);
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

    function updateTable(filters) {
        // Create Lambda object

        var lambda = new AWS.Lambda({
            region: 'ap-southeast-2',
            apiVersion: '2015-03-31'
        });

        // create JSON object for parameters for invoking Lambda function
        var pullParams = {
            FunctionName: 'getLogsFiltered',
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(filters),
            LogType: 'None'
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
    function reloadTable(data) {
        $('#logging-table').bootstrapTable("removeAll");
        if (Object.keys(data).length > 0) {
            for (item in data) {
                var obj = JSON.parse(data[item]);
                var date = new Date((item.split("/")[1]) * 1000);
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

    // Refresh packhouse dropdowns based on which customers are selected. 
    $('#customer-check-list').click(function() {
        getPackhouses();
    });

    $('#update_logs').click(function() {
        getPackhouses();
        var errorTypes = [];
        var softwareTypes = [];

        // check the selected error types for the filter
        if ($('#errorCheckbox').is(":checked")) {
            errorTypes.push(ERRORTYPE.ERROR);
        }
        if ($('#warningCheckbox').is(":checked")) {
            errorTypes.push(ERRORTYPE.WARNING);
        }

        // Check the selected machine types for the filter
        if ($('#visionCheckBox').is(":checked")) {
            softwareTypes.push(SOFTWARE.VISION);
        }
        if ($('#sizerCheckbox').is(":checked")) {
            softwareTypes.push(SOFTWARE.SIZER);
        }
        if ($('#exodusCheckbox').is(":checked")) {
            softwareTypes.push(SOFTWARE.EXODUS);
        }
        if ($('#nexusCheckbox').is(":checked")) {
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
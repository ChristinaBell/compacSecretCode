$(document).ready(function() {


    // Define logging filters for error types
    var ERRORTYPE = {
        "ERROR": "ERROR",
        "WARNING": "WARNING"
    }
    // Define the logging filter for software types
    var SOFTWARE = {
        "VISION": "VISION",
        "SIZER": "SIZER",
        "EXODUS": "EXODUS",
        "NEXUS": "NEXUS"
    }

    // -----------------------------------  Fill the log for the first time --------------------------------------------

    // Create a global variable for the filtering of log file
    filters = {
        "ErrorType": [ERRORTYPE.ERROR, ERRORTYPE.WARNING],
        "SoftwareType": ["SIZER", "VISION"],
        "StartDate": $('#startDate').val(),
        "EndDate": $('#endDate').val(),
        "Customers" : [],
        "Packhouses": []
    };

    // Define a global variable to determine whether the date range has been changed.
    // Used to determine whether a call to AWS Lambda must be made or if a subset of the current data can be used.
    var dateChangedBoolean = false;
    var logResults;


    //  ----------------------------------Connect to AWS Lambda---------------------------------------------------------

    // Set up AWS Lambda call
    AWS.config.region = 'ap-southeast-2'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-southeast-2:4d0f8a86-6998-44d5-b05b-953269d29426',
    });
    setupPage();

    // Set up the date range picker to format the to have the month as a word not a number
    $('.input-daterange').datepicker({
        format : "dd MM yyyy "
    }).on("change", function (e) {
            dateChangedBoolean = true;  //
    });

    // -----------------------------------  Set up filters dynamically --------------------------------------------------
    function setupPage() {

        // Set up month name array to convert names to indexes
        monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December" ];

        // set the end date of the date picker to be the current date
        var today = new Date();
        var dd = today.getDate();
        if (dd < 10){
            dd = "0" + dd;
        }
        var mm =  monthNames[today.getMonth()];
        var yyyy = today.getFullYear();
        var end = dd+' '+mm+' '+yyyy;
        $('#endDate').val(end);

        // set the start date of the date picker to be a week ago by default
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
        var dd = oneWeekAgo.getDate();
        var mm = monthNames[oneWeekAgo.getMonth()];
        var yyyy = oneWeekAgo.getFullYear();
        var start = dd+' '+mm+' '+yyyy;
        $('#startDate').val(start);

        startDateArray = $('#startDate').val().split(" ");
        endDateArray = $('#endDate').val().split(" ");

        // Set the filter to have the month as a number rather than name - using the month name array
        filters.StartDate = (startDateArray[0] + "-" + (monthNames.indexOf(startDateArray[1]) + 1) + "-" + startDateArray[2]).trim();
        filters.EndDate = (endDateArray[0] + "-" + (monthNames.indexOf(endDateArray[1]) + 1) + "-" + endDateArray[2]).trim();

        // Set the parameters of the lambda function
        var pullParams = {
            FunctionName: 'readPackhouseLocations',
            InvocationType: 'RequestResponse',
            LogType: 'None'
        };

        // Connect the Lambda function and invoke it
        var lambda = new AWS.Lambda({
            region: 'ap-southeast-2',
            apiVersion: '2015-03-31'
        });
        // If there is no error with the function then update the logs with the data retrieved
        lambda.invoke(pullParams, function(error, data) {
            if (error) {
                prompt(error);
            } else {
                currentData = JSON.parse(data.Payload);
                getCustomers(currentData.Items);
                getPackhouses(currentData.Items);
                getSelectedCustomersAndPackhouses();
                retrieveData(filters);
            }
        });
    }

    // Get all the customers from the database using the list of pack houses
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

    // Dynamically update the possible customer options from the list of pack houses returned from the database
    function updateCustomerList(packhouses) {
        var customerchecklist = $("#customer-check-list");

        var html = "<h4 class='log-sub-heading'>Customer:</h4>";
        for (var i = 0; i < packhouses.length; i++) {
            var currentPackhouse = packhouses[i];
            html = html + "<div class='checkbox'><label><input checked class='customer_checkbox' type='checkbox' name='Customer' value='" + currentPackhouse + " '>" + currentPackhouse + " </label> </div>"
            customerchecklist.html(html);
        }
    }

    // Get a list of all the pack houses from the database
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

    // Dynamically update the possible select options depending on the pack houses returned from the database
    function updatePackhouseList(packhouses) {
        var packhousechecklist = $("#packhouse-check-list");
        var html = "<h4 class='log-sub-heading'>Packhouses:</h4>";
        for (var i = 0; i < packhouses.length; i++) {
            var currentPackhouse = packhouses[i];
            html = html + "<div class='checkbox'><label><input checked class='packhouse_checkbox' type='checkbox' name='Customer' value='" + currentPackhouse + "'>" + currentPackhouse + " </label> </div>"
        }
        packhousechecklist.html(html);
    }

    // -------------------------------Invoke the Lambda to retrieve logs -----------------------------------------------



    // Call function to update the table with selected filters - uses lambda to retrieve from the AWS database
    function retrieveData(filters) {
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
        // Reload table with results from S3 lambda function call if there is no error
        lambda.invoke(pullParams, function(error, data) {
            if (error) {
                prompt(error);
            } else {
                logResults = JSON.parse(data.Payload);
                reloadTable(logResults);
            }
        });
    }

    // Function to redraw the logging table with data from S3 buckets
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

    // function to filter the current data without needed to retrieve more from the database.
    function filterCurrentData(filters){
        newResults = {};
        for (item in logResults){
            data = JSON.parse(logResults[item]);
            // If the item matches the filters then add to the new log result function.
            if ((filters.Customers.indexOf(data.Customer.toUpperCase()) > -1)
                && (filters.Packhouses.indexOf(data.Packhouse.toUpperCase()) > -1)
                && (filters.ErrorType.indexOf(data.LogType.toUpperCase()) > -1)
                && (filters.SoftwareType.indexOf(data.Machine.toUpperCase()) > -1)
            ){
                newResults[item]= JSON.stringify(data);
            }
        }
        reloadTable(newResults);

    }

    // Refresh packhouse dropdowns based on which customers are selected.
    $('#customer-check-list').click(function() {
        getPackhouses();
    });



    // Function to update the log when the update logs button is clicked -----------------------------------------------
    $('#update_logs').click(function() {

        // close the filter
        $('#logging-filter-panel').click()

        var errorTypes = [];
        var softwareTypes = [];
        var customersChecked = [];
        var packhousesChecked = [];

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

        // get the selected packhouse and customer checkboxes
        getSelectedCustomersAndPackhouses();

        // update the filter values
        filters.ErrorType = errorTypes;
        filters.SoftwareType = softwareTypes;

        startDateArray = $('#startDate').val().split(" ");
        endDateArray = $('#endDate').val().split(" ");

        var startMonth = monthNames.indexOf(startDateArray[1]) + 1;
        if (startMonth < 10){
            startMonth = "0" + startMonth;
        }
        var endMonth = monthNames.indexOf(endDateArray[1]) + 1;
        if (endMonth < 10){
            endMonth = "0" + endMonth;
        }

        filters.StartDate =  (startDateArray[0] + "-" + startMonth + "-" + startDateArray[2]).trim();
        filters.EndDate =  (endDateArray[0] + "-" + endMonth + "-" + endDateArray[2]).trim();

        // Call the update function to display the relevant logs to the user
        if (dateChangedBoolean){
            retrieveData(filters);
            dateChangedBoolean = false;
        } else {
            filterCurrentData(filters);
        }
    });

    // Function to get the selected customers and pack houses in the filter drop down check boxes
    function getSelectedCustomersAndPackhouses(){
        var customersChecked = [];
        var packhousesChecked = [];

        // get customers selected in the customer filter checkbox
        customerCheckboxes = $('.customer_checkbox:checkbox:checked');
        for (var i = 0; i < customerCheckboxes.length; i++) {
            customersChecked.push(customerCheckboxes[i].value);
        }
        // For each selected customer add the name to a list and convert to uppercase.
        customersChecked = $.map(customersChecked, $.trim);
        $.each(customersChecked, function(index, item) {
            customersChecked[index] = item.toUpperCase();
        });

        // get customers selected in the pack house filter checkbox
        packhouseCheckboxes = $('.packhouse_checkbox:checkbox:checked');
        for (var i = 0; i < packhouseCheckboxes.length; i++) {
            packhousesChecked.push(packhouseCheckboxes[i].value);
        }
        // For each selected pack house add the name to a list and convert to uppercase.
        packhousesChecked = $.map(packhousesChecked, $.trim);
        $.each(packhousesChecked, function(index, item) {
            packhousesChecked[index] = item.toUpperCase();
        });

        // Update the global filter variable values for pack houses and customers
        filters.Customers = customersChecked;
        filters.Packhouses = packhousesChecked;
    }


//  Change caret direction when filter is collapsed in or out
    $("#logging-filter-panel").click(function() {
        if ($("#filter-logs-collapse-caret").hasClass("fa-angle-down")){
            $("#filter-logs-collapse-caret").removeClass("fa-angle-down");
            $("#filter-logs-collapse-caret").addClass("fa-angle-up");
        }else if ($("#filter-logs-collapse-caret").hasClass("fa-angle-up")){
            $("#filter-logs-collapse-caret").removeClass("fa-angle-up");
            $("#filter-logs-collapse-caret").addClass("fa-angle-down");
        }
    });

});
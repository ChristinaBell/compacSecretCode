$( document ).ready(function() {

    // AWS Lambda call
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
        reloadTable(pullResults);
      }
    });

    function reloadTable(data){
        for (item in data){
            var obj = JSON.parse(data[item]);
            var date = new Date((item.split("/")[1])*1000);
//            var row = [date.toString(), obj["Packhouse"], obj["Machine"], obj["Error"]];
            var row = [];

            dict = {
                Date: date.toString(),
                Packhouse: obj["Packhouse"],
                Machine: obj["Machine"],
                Error: obj["Error"]
            };
            $('#logging-table').bootstrapTable("append", dict);

        }
    }



});
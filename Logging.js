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
        console.log(pullResults);
      }
    });


});
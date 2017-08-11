$( document ).ready(function() {

    onloadPage();

    function onloadPage(){
        customer = getParameterByName("customer", window.location.search);
        packhouse = getParameterByName("packhouse", window.location.search);

//        titleString = "Customer: " + customer + ", Packhouse: " + packhouse;
        titleString = customer + ", " + packhouse;
        console.log(titleString);

        $('#dashboard-title').text(titleString);
        drawGraphFPM();
        drawGraphRFPM();
        drawGraphUptime();
        drawGraphAlarms();
    }

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function drawGraphFPM(){
        var ctx = $("#fruit-per-minute-canvas");
        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: {
              datasets: [
                {
                  label: "FPM",
                  borderColor: "#1CA0FF",
                  backgroundColor: "#1CA0FF",
                  data: [2478,5267,734,784,433],
                  fill: false
                }
              ]
            },
            options: {
              title: {
                display: true,
                text: 'Fruit per minute',
              }
            }
        });
    }

     function drawGraphRFPM(){
        var ctx = $("#recycled-fruit-per-minute-canvas");
        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: {
              datasets: [
                {
                  label: "FPM",
                  borderColor: "#1CA0FF",
                  backgroundColor: "#1CA0FF",
                  data: [2478,5267,734,784,433],
                  fill: false
                }
              ]
            },
            options: {
              title: {
                display: true,
                text: 'Recycled fruit per minute',
              }
            }
        });
    }

    function drawGraphUptime(){
            var ctx = $("#uptime-hours-canvas");
            var myLineChart = new Chart(ctx, {
                 type: 'bar',
                 data: {
                   labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                   datasets: [
                     {
                       label: "Accuracy",
                       backgroundColor: ["#1CA0FF", "#44535B","#78B543","#F47B20","#C7C8CA"],
                       data: [2478,5267,734,784,433]
                     }
                   ]
                 },
                 options: {
                   legend: { display: false },
                   title: {
                     display: true,
                     text: 'Uptime hours',
                   }
                 }
             });
        }

    function drawGraphAlarms(){
            var ctx = $("#alarm-numbers-canvas");
            var myLineChart = new Chart(ctx, {
                  type: 'bar',
                  data: {
                   labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    datasets: [
                      {
                        label: "alarms",
                        backgroundColor: ["#1CA0FF", "#44535B","#78B543","#F47B20","#C7C8CA"],
                        data: [10,16,12,17,20]
                      }
                    ]
                  },
                  options: {
                    legend: { display: false },
                    title: {
                      display: true,
                      text: 'Number of alarms',
                    }
                  }
              });
        }



});
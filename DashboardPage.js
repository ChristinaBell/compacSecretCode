$( document ).ready(function() {

    onloadPage();

    function onloadPage(){
        customer = getParameterByName("customer", window.location.search);
        packhouse = getParameterByName("packhouse", window.location.search);

//        titleString = "Customer: " + customer + ", Packhouse: " + packhouse;
        titleString = customer + ", " + packhouse;
        console.log(titleString);

        $('#dashboard-title').text(titleString);
        drawGraph();
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

    function drawGraph(){
        // Bar chart
        new Chart($(".dashboard-chart"), {
            type: 'bar',
            data: {
              labels: ["Export", "Class1", "Class2", "Cull", "Juice"],
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
                display: false,
                text: 'Accuracy breakdown per quality grade category',
                fontSize: 30,
              }
            }
        });


    }



});
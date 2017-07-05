
$( document ).ready(function() {

// Bar chart
new Chart($(".myChart"), {
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
        display: true,
        text: 'Accuracy breakdown per quality grade category',
        fontSize: 30,
      }
    }
});


});
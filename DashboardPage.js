$( document ).ready(function() {

    onloadPage();

    function onloadPage(){
        customer = getParameterByName("customer", window.location.search);
        packhouse = getParameterByName("packhouse", window.location.search);

//        titleString = "Customer: " + customer + ", Packhouse: " + packhouse;
        titleString = customer + ", " + packhouse;
        console.log(titleString);

        $('#dashboard-title').text(titleString);
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

});
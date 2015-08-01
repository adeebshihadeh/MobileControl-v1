function testConnection(){
    $.ajax({
        url:  "http://"+$("#ip_field").val()+"/api/version",
        headers: {"X-Api-Key": $("#apikey_field").val()},
        method: "GET",
        timeout: 10000
    }).done(function() {
        return true;
    }).fail(function(){
        return false;
    });
}

function setup(){
    if(localStorage.getItem("ip_address") === null && localStorage.getItem("apikey") === null){
        // show the first time setup
        switchView("first_time_setup");
    }else {
        switchView("main");
    }
}

function switchView(view) {
    // hide all the views
    $("#first_time_setup").hide();
    $("#printing_view").hide();
    $("#main").hide();
    $("#disconnected_view").hide();
    
    // show the desired view
    $("#"+view).show();
}

// ------------- button click events -------------
// first time setup buttons
$("#test_connection_btn").click(function() {
    $("#test_status").text("testing...");
    $("#test_status").css("color", "black");
    if(testConnection()){
        $("#test_status").text("success");
        $("#test_status").css("color", "green"); 
    }else {
        $("#test_status").text("connection failed");
        $("#test_status").css("color", "red");
    }
});

$("#next_screen_btn").click(function () {
    switchView("main");
    localStorage.setItem("ip_address", $("ip_field").val());
    localStorage.setItem("apikey", $("apikey_field").val());
});


setup();
var ip;
var apikey;
var jogIncrement = 10;

$(document).ready(function() {
    setup();
});

function sendCommand(data){
    $.ajax({
        url:  "http://"+ip+"/api/printer/command",
        headers: {"X-Api-Key": apikey},
        method: "POST",
        timeout: 10000,
        contentType: "application/json",
        data: JSON.stringify(data)
    });
}

function testConnection(){
    console.log("testing connection...");
    $("#test_status").text("testing...");
    $("#test_status").css("color", "black");
    
    $.ajax({
        url:  "http://"+$("#ip_field").val()+"/api/version",
        headers: {"X-Api-Key": $("#apikey_field").val()},
        method: "GET",
        timeout: 10000
    }).done(function() {
        $("#test_status").text("success");
        $("#test_status").css("color", "green"); 
    }).fail(function(){
        $("#test_status").text("connection failed");
        $("#test_status").css("color", "red");
    });
}

function setup(){
    if(localStorage.getItem("ip_address") === null && localStorage.getItem("apikey") === null){
        // show the first time setup
        switchView("first_time_setup");
    }else {
        switchView("main");
        ip = localStorage.getItem("ip_address");
        apikey = localStorage.getItem("apikey");
        switchTab("info_tab");
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

function switchTab(tab){
    // deselect all tabs
    $("#info_tab_btn").removeClass("menu-tab-selected");
    $("#control_tab_btn").removeClass("menu-tab-selected");
    $("#extrusion_tab_btn").removeClass("menu-tab-selected");
    $("#files_tab_btn").removeClass("menu-tab-selected");
    $("#settings_tab_btn").removeClass("menu-tab-selected");
    
    // hide all the contents of the tabs
    $("#info_tab").hide();
    $("#control_tab").hide();
    $("#extrusion_tab").hide();
    $("#files_tab").hide();
    $("#settings_tab").hide();
    
    // select the desired tab
    $("#"+tab+"_btn").addClass("menu-tab-selected");
    $("#"+tab).show();
}

// ------------- button click events -------------
// first time setup buttons
$("#test_connection_btn").click(function() {
    console.log("clicked!");
    testConnection();
});
$("#next_screen_btn").click(function () {
    localStorage.setItem("ip_address", $("#ip_field").val());
    localStorage.setItem("apikey", $("#apikey_field").val());
    switchView("main");
});

// tab menu buttons
$("#info_tab_btn").click(function() {
    switchTab("info_tab");
});
$("#control_tab_btn").click(function() {
    switchTab("control_tab");
});
$("#extrusion_tab_btn").click(function() {
    switchTab("extrusion_tab");
});
$("#files_tab_btn").click(function() {
    switchTab("files_tab");
});
$("#settings_tab_btn").click(function() {
    switchTab("settings_tab");
});

// control tab buttons
$("#x_neg_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 X-" + jogIncrement,"G90"]});
});
$("#x_home_btn").click(function() {
    sendCommand({"command": "G28X"});
});
$("#x_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 X" + jogIncrement,"G90"]});
});

$("#y_neg_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Y-" + jogIncrement,"G90"]});
});
$("#y_home_btn").click(function() {
    sendCommand({"command": "G28Y"});
});
$("#y_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Y" + jogIncrement,"G90"]});
});

$("#z_neg_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Z-" + jogIncrement,"G90"]});
});
$("#z_home_btn").click(function() {
    sendCommand({"command": "G28Z"});
});
$("#z_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Z" + jogIncrement,"G90"]});
});


// prevent scrolling
document.ontouchmove = function(event){
    event.preventDefault();
}
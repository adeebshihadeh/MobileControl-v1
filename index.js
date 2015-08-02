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

function testConnection(instance){
    console.log("testing connection...");
    
    switch(instance){
        case "first-setup":
            $("#test_status").text("testing...");
            $("#test_status").css("color", "black");
            test_ip = $("#ip_field").val();
            test_apikey = $("#apikey_field").val();
            break;
        case "settings-screen":
            $("#settings_test_status").text("testing...");
            $("#settings_test_status").css("color", "black");
            test_ip = $("#settings_ip_field").val();
            test_apikey = $("#settings_apikey_field").val();
            break;
    }
    
    $.ajax({
        url:  "http://"+test_ip+"/api/version",
        headers: {"X-Api-Key": test_apikey},
        method: "GET",
        timeout: 10000
    }).done(function() {
        console.log("successful connection");
        
        switch(instance){
            case "first-setup":
                $("#test_status").text("success");
                $("#test_status").css("color", "green");
                break;
            case "settings-screen":
                $("#settings_test_status").text("success");
                $("#settings_test_status").css("color", "green");
                break;
        }
    }).fail(function(){
        console.log("connection faield");
        
        switch(instance){
            case "first-setup":
                $("#settings_test_status").text("connection failed");
                $("#settings_test_status").css("color", "red");
                break;
            case "settings-screen":
                $("#settings_test_status").text("connection failed");
                $("#settings_test_status").css("color", "red");
                break;
        }
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
    testConnection("first-setup");
});
$("#next_screen_btn").click(function () {
    ip = $("#ip_field").val();
    apikey = $("#apikey_field").val();
    localStorage.setItem("ip_address", ip);
    localStorage.setItem("apikey", apikey);
    switchView("main");
    switchTab("info_tab");
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
    
    $("#settings_ip_field").val(ip);
    $("#settings_apikey_field").val(apikey); 
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

// settings tab
$("#save_settings_btn").click(function(){
    ip = $("#settings_ip_field").val();
    localStorage.setItem("ip_address", ip);
    apikey = $("#settings_apikey_field").val();
    localStorage.setItem("apikey", apikey);
});
$("#settings_test_connection_btn").click(function(){
    testConnection("settings-screen");
});

$("#restore_settings_btn").click(function(){
    $("#settings_ip_field").val(ip);
    $("#settings_apikey_field").val(apikey);
    $("#settings_test_status").text("");
});

// prevent scrolling
document.ontouchmove = function(event){
    event.preventDefault();
}
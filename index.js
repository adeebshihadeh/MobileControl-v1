var ip;
var apikey;
var socket;
var printing = false;

$(document).ready(function() {
    setup();
});

function connect(){
    socket = new WebSocket("ws://"+ip+"/sockjs/websocket");
    
    socket.onmessage = function(e) {
        //console.log('message', e.data);
        parseData(e.data);
    };
}

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
        connect();
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

function parseData(dataString){
    var data = JSON.parse(dataString);
    console.log(data);
    
    // uppdate printer status
    $("#printer_status").text(data.current.state.text);
    
    // update printer temps
    // if(typeof(data.current.temps.tool1) === "undefined"){
    //     $("#extruder_temp").text("E0: " + data.current.temps[0] + " / " + data.current.temps[tool0.target]);
    // }else {
    //     $("#extruder_temp").text("E0: " + data.current.temps.tool0.actual + " / " + data.current.temps.tool0.target);
    // }
    if(typeof(data.current.temps) !== "undefined"){
        var bedTemp;
        if(typeof(data.current.temps[0].bed) !== "undefined"){
            if(data.current.temps[0].bed.target == 0){
                bedTemp = "Bed: "+data.current.temps[0].bed.actual + "ºC";
            }else {
                bedTemp = "Bed: "+data.current.temps[0].bed.actual + "ºC / " + data.current.temps[0].bed.target + "ºC";
            }
        } else {
            bedTemp = "null";
        }
        var e0Temp;
        if(typeof(data.current.temps[0].tool0) !== "undefined"){
            if(data.current.temps[0].tool0.target == 0){
                e0Temp = "E0: "+data.current.temps[0].tool0.actual + "ºC";
            }else {
                e0Temp = "E0: "+data.current.temps[0].tool0.actual + "ºC / " + data.current.temps[0].tool0.target + "ºC";
            }
        } else {
            e0Temp = "null";
        }
        var e1Temp;
        if(typeof(data.current.temps[0].tool1) !== "undefined"){
            if(data.current.temps[0].tool0.target == 0){
                e1Temp = "E1: "+data.current.temps[0].tool1.actual + "ºC";
            }else {
                e1Temp = "E0: "+data.current.temps[0].tool1.actual + "ºC / " + data.current.temps[0].tool1.target + "ºC";
            }
        } else {
            e1Temp = "null";
        }
        var tempString;
        if(e0Temp != "null"){
            tempString = e0Temp;
        }
        if(e1Temp != "null"){
            tempString = tempString + " " + e1Temp;
        }
        if(bedTemp != "null"){
            tempString = tempString + " " + bedTemp;
        }
        $("#temperatures").text(tempString);    
    }
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
    connect();
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
    sendCommand({"commands": ["G91","G1 X-" + $('input[name=jog_increment]:checked').val(),"G90"]});
});
$("#x_home_btn").click(function() {
    sendCommand({"command": "G28X"});
});
$("#x_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 X" + $('input[name=jog_increment]:checked').val(),"G90"]});
});

$("#y_neg_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Y-" + $('input[name=jog_increment]:checked').val(),"G90"]});
});
$("#y_home_btn").click(function() {
    sendCommand({"command": "G28Y"});
});
$("#y_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Y" + $('input[name=jog_increment]:checked').val(),"G90"]});
});

$("#z_neg_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Z-" + $('input[name=jog_increment]:checked').val(),"G90"]});
});
$("#z_home_btn").click(function() {
    sendCommand({"command": "G28Z"});
});
$("#z_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Z" + $('input[name=jog_increment]:checked').val(),"G90"]});
});

$("#motors_off_btn").click(function() {
    sendCommand({"command": "M18"});
});
$("#fan_on_btn").click(function() {
    sendCommand({"command": "M106"});
});
$("#fan_off_btn").click(function() {
    sendCommand({"command": "M106 S0"});
});

// settings tab
$("#save_settings_btn").click(function(){
    ip = $("#settings_ip_field").val();
    localStorage.setItem("ip_address", ip);
    apikey = $("#settings_apikey_field").val();
    localStorage.setItem("apikey", apikey);
    connect();
});
$("#settings_test_connection_btn").click(function(){
    testConnection("settings-screen");
});

$("#restore_settings_btn").click(function(){
    $("#settings_ip_field").val(ip);
    $("#settings_apikey_field").val(apikey);
    $("#settings_test_status").text("");
});

// extrusion tab  buttons
$("#extrude_btn").click(function(){
    sendCommand({"commands": ["G91","G1 E" + $('input[name=extrude_length]:checked').val() + " F300","G90"]});
});
$("#retract_btn").click(function(){
    sendCommand({"commands": ["G91","G1 E-" + $('input[name=extrude_length]:checked').val() + " F300","G90"]});
});

// prevent scrolling
document.ontouchmove = function(event){
    event.preventDefault();
}
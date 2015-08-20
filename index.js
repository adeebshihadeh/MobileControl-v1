// settings
var hotend_min_temp_limit = 0; // lowest value the interface will allow the hotend to be set to
var hotend_max_temp_limit = 350; // lowest value the interface will allow the hotend to be set to

var ip;
var apikey;
var socket;
var currentView;

$(document).ready(function() {
    setup();
});

function connect(){
    socket = new WebSocket("ws://"+ip+"/sockjs/websocket");
    
    socket.onopen = function() {
        switchView("main");
        switchTab("info_tab");
    };
    
    socket.onmessage = function(e) {
        //console.log('message', e.data);
        parseData(e.data);
        
        if(currentView === "disconnected_view"){
            switchView("main");
        }
    };
    
    socket.onclose = function() {
        switchView("disconnected_view");
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
    
    var test_ip;
    var test_apikey;
    
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
        switchView("loading_view");
        ip = localStorage.getItem("ip_address");
        apikey = localStorage.getItem("apikey");
        connect();
    }
}

function switchView(view) {
    currentView = view;
    
    // hide all the views
    $("#first_time_setup").hide();
    $("#printing_view").hide();
    $("#main").hide();
    $("#disconnected_view").hide();
    $("#loading_view").hide();
    
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
    
    if(typeof(data.current) !== "undefined"){
        // uppdate printer status
        $("#printer_status").text(data.current.state.text);
        
        if(typeof(data.current.temps[0]) !== "undefined"){
            // update printer temps
            var bedTemp;
            if(typeof(data.current.temps[0].bed) !== "undefined" && data.current.temps[0].bed.actual !== null){
                if(data.current.temps[0].bed.target === 0){
                    bedTemp = "Bed: "+data.current.temps[0].bed.actual + "ºC";
                }else {
                    bedTemp = "Bed: "+data.current.temps[0].bed.actual + "ºC / " + data.current.temps[0].bed.target + "ºC";
                }
                $("#bed_temp").html(bedTemp);
            }
            var e0Temp;
            if(typeof(data.current.temps[0].tool0) !== "undefined"){
                if(data.current.temps[0].tool0.target === 0){
                    e0Temp = "<i class='icon ion-thermometer'></i> "+data.current.temps[0].tool0.actual + "ºC";
                }else {
                    e0Temp = "<i class='icon ion-thermometer'></i> "+data.current.temps[0].tool0.actual + "ºC / " + data.current.temps[0].tool0.target + "ºC";
                }
                $("#extruder_temp").html(e0Temp);
            }
        }
        if(data.current.state.flags.printing){
            // switch to the printing view
            if(currentView !== "printing_view"){
                switchView("printing_view");
            }
            
            // update print time info
            if(data.current.progress.printTimeLeft === null){
                $("#printing_time_left").text("Calculating...");
                $("#printing_time_left").css("font-size", "16vw");
            }else {
                $("#printing_time_left").text(formatSeconds(data.current.progress.printTimeLeft));
                $("#printing_time_left").css("font-size", "23vw");
            }
            $("#printing_time_elapsed").text(formatSeconds(data.current.progress.printTime));
            
            // update print progress bar
            $("#printing_view").css({background: "linear-gradient(90deg, #439BFB "+parseInt(data.current.progress.completion)+"%, white 0%)"});
        } else if(!data.current.state.flags.printing && currentView === "printing_view"){
            switchView("main");
            // clear background color
            $("#printing_view").css("background", "white");
        }
    }
}

function formatSeconds(s){
    var date = new Date(1970, 0, 1);
    date.setSeconds(s);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

// ------------- button events -------------
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
    sendCommand({"commands": ["G91","G1 X-" + $("input[name=jog_increment]:checked").val(),"G90"]});
});
$("#x_home_btn").click(function() {
    sendCommand({"command": "G28X"});
});
$("#x_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 X" + $("input[name=jog_increment]:checked").val(),"G90"]});
});

$("#y_neg_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Y-" + $("input[name=jog_increment]:checked").val(),"G90"]});
});
$("#y_home_btn").click(function() {
    sendCommand({"command": "G28Y"});
});
$("#y_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Y" + $("input[name=jog_increment]:checked").val(),"G90"]});
});

$("#z_neg_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Z-" + $("input[name=jog_increment]:checked").val(),"G90"]});
});
$("#z_home_btn").click(function() {
    sendCommand({"command": "G28Z"});
});
$("#z_pos_jog_btn").click(function() {
    sendCommand({"commands": ["G91","G1 Z" + $("input[name=jog_increment]:checked").val(),"G90"]});
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
    socket.close();
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
    sendCommand({"commands": ["G91","G1 E" + $("input[name=extrude_length]:checked").val() + " F300","G90"]});
});
$("#retract_btn").click(function(){
    sendCommand({"commands": ["G91","G1 E-" + $("input[name=extrude_length]:checked").val() + " F300","G90"]});
});

$("#set_temp_btn").click(function(){
    if($("input[name=heater]:checked").val() === "extruder"){
        sendCommand({"command": "M104 S" + $("#temp_field").val()});
    }else {
        sendCommand({"command": "M140 S" + $("#temp_field").val()});
    }
});
$("#temp_off_btn").click(function(){
    if($("input[name=heater]:checked").val() === "extruder"){
        sendCommand({"command": "M104 S0"});
    }else {
        sendCommand({"command": "M140 S0"});
    }
    
});
$("#neg_increment_temp_btn").click(function(){
    $("#temp_field").val(parseInt($("#temp_field").val())-1);
    
    if(parseInt($("#temp_field").val()) === hotend_min_temp_limit){
        $("#neg_increment_temp_btn").prop("disabled", true);
    }
});
$("#pos_increment_temp_btn").click(function(){
    $("#temp_field").val(parseInt($("#temp_field").val())+1);
    
    if(parseInt($("#temp_field").val()) !== hotend_min_temp_limit){
        $("#neg_increment_temp_btn").prop("disabled", false);
    }
});

// disconnected view buttons
$("#start_over_btn").click(function(){
    if(confirm("Are you sure you want to start over?")){
        // clear all saved info
        localStorage.clear();
        // refresh the page
        location.reload();
    }
});
$("#reconnect_btn").click(function(){
    connect();
});


// prevent scrolling
document.ontouchmove = function(event){
    event.preventDefault();
};
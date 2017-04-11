/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var IpBridge = 0;
var servers = new Object();

var com = new Object();

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
         
        $("#modalOn").modal('open');
        $('#ipbridge').html('<p><i class="tiny material-icons">room</i> Nenhum IP conectado</p>');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

function saveIPBridge(){
    servers = null;
    IpBridge = $('#add').val();
    console.log($('#add').val());
    var statusBridge = checkStatusBridge();
    var verboseStatus = 'Não conectado';
    if (statusBridge == true) {
        verboseStatus = 'Ok';
        ser_choices();
    }else{
        $('#serverschoice').html("<option value='' disabled selected>Servidores disponíveis</option>");
    }
    $('#serverschoice').material_select();
    $('#ipbridge').html('<p><i class="tiny material-icons">room</i> Conectado ao IP '+IpBridge+'<br><i class="tiny material-icons">cloud_done</i> Status: '+verboseStatus+'</p>');
    $("#modalOn").modal('close');
}

function somenteNumeros(num) {
    var er = /[^0-9,]/;
    er.lastIndex = 0;
    var campo = num;
    if (er.test(campo.value)) {
      campo.value = "";
    }
}

function ser_choices(){
    console.log(servers);

    $('#serverschoice').html(""); 
    
    console.log(servers.length);
    for (var i = 0; i < servers.length; i++) {
        console.log(servers[i][0]);

        $('#serverschoice').append("<option value = '"+servers[i][0]+"'>"+servers[i][0]+" - "+servers[i][1]+"</option>");
    }
}

function checkStatusBridge(){
    var aux = false;
    $.ajax({
            url : "http://"+IpBridge+":8000/api/", // the endpoint
            type : "GET", // http method
            async : false,
            success : function(json) {
                console.log('Conectou ao IP');
                aux = true;
                servers = JSON.parse(json);
            },
            beforeSend: function(){
                var $toastContent = $('<span>Carregando lista de hosts...</span>');
                Materialize.toast($toastContent, 5000);
            },
            complete: function(){
                var $toastContent = $('<span>Carregamento finalizado. :)</span>');
                Materialize.toast($toastContent, 5000);
            },

            // handle a non-successful response
            error : function(xhr,errmsg,err) {
                
            }
        });
    return aux;
}

function entrar(){
    var server_choice = $('#serverschoice').val();
    var seq_numbers = $('#numbers').val();
    var num_op = $('#operationschoice').val();

    console.log("Server: " + server_choice);
    console.log("Sequência de dígitos: " + seq_numbers);
    console.log("Operação escolhida: " + num_op);
    if (server_choice != null && seq_numbers != '' && num_op != null) {
        ajax_num(server_choice, seq_numbers, num_op);
    } else {
        var $toastContent = $('<span>Complete todos os campos. :)</span>');
        Materialize.toast($toastContent, 5000);
    }
}

function ajax_num(server_choice, seq_numbers, num_op){

    $.ajax({
             
            type: "POST",
            data: { data:seq_numbers, },
             
            url: "http://"+IpBridge+":8000/api/"+server_choice+"/"+num_op+"/",
            success: function(result){
                $('#titulo').html("Servidor <span style = 'color: blue;'>" + server_choice + "</span> respondeu:");
                $('#texto').html('<p>Sequência original ->'+seq_numbers+'</p><p>Operaçao: '+num_op+'-> '+ result +'</p>');
                $('#modalResponse').modal('open');
                console.log(result);
            },

            error : function(xhr,errmsg,err) {
                $('#titulo').html("Servidor <span style='color: blue;'>" + server_choice + "</span> está indisponível.");
                $('#texto').html('<p>Erros ->'+xhr+'</p><p>'+errmsg+'</p><p>'+ err +'</p>');
                $('#modalResponse').modal('open');
            }
        });
         
}


//Operações locais

function entrarLocal(){
    var numbers = $('#numbersLocal').val().split(',');
    var option = $('#operationschoiceLocal').val();
    if ($('#numbersLocal').val().split(',') != '' && option != null) {
        var l = [];
        for (var i = 0; i < numbers.length; i++) {
            l.push(parseInt(numbers[i]));
        }
        console.log(l);
        oper_local(l, option);
    } else {
        var $toastContent = $('<span>Complete todos os campos. :)</span>');
        Materialize.toast($toastContent, 5000);
    }
    //console.log(numbers);
}

function oper_local(numbers, oper){
    
    if(oper == 'ordena'){
        var result = numbers.slice();

        numbers.sort(sortfunction);
        $('#titulo').html("Servidor <span style = 'color: blue;'>local</span> respondeu:");
        $('#texto').html('<p>Sequência original ->'+result+'</p><p>Operaçao: '+oper+'-> '+ numbers +'</p>');
        $('#modalResponse').modal('open');
    }else if(oper == 'soma'){
        var result = 0;
        for (var i = 0; i < numbers.length; i++) {
            result += numbers[i];
        }
        $('#titulo').html("Servidor <span style = 'color: blue;'>local</span> respondeu:");
        $('#texto').html('<p>Sequência original ->'+numbers+'</p><p>Operaçao: '+oper+'-> '+ result +'</p>');
        $('#modalResponse').modal('open');
    }else if(oper == 'max'){
        var result = Math.max.apply(null, numbers);
        $('#titulo').html("Servidor <span style = 'color: blue;'>local</span> respondeu:");
        $('#texto').html('<p>Sequência original ->'+numbers+'</p><p>Operaçao: '+oper+'-> '+ result +'</p>');
        $('#modalResponse').modal('open');
    }else{
        var result = Math.min.apply(null, numbers);
        $('#titulo').html("Servidor <span style = 'color: blue;'>local</span> respondeu:");
        $('#texto').html('<p>Sequência original ->'+numbers+'</p><p>Operaçao: '+oper+'-> '+ result +'</p>');
        $('#modalResponse').modal('open');
    }
    
}

function sortfunction(a, b){
  return (a - b) //faz com que o array seja ordenado numericamente e de ordem crescente.
}

function sair(){
    navigator.app.exitApp();
}


//coding by Diego Fernando
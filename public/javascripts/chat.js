/**
 * Note: 
 * -----
 * The first step is to connect to the server (#1). This will send a connection
 * request to the server from which the page was loaded. This will also negotiate the
 * transport protocol and will finally result in the connection event being triggered 
 * on the server. 
 */ 

/** 
 * Message received handler
 * ------------------------
 * The following handle the receipt of a message. The JSON is parsed
 * and the message is appended to the #messages element using jQuery
 */


/**
 * Message send 
 * ------------
 * We're using jQuery. Remember $(document).ready(function (){ ... } 
 * is the same as $(function(){ ... }
 * All we're doing here is attaching an event handler to the send button
 * onclick. 
 * 
 * so onclick, we create a data object, extract the value from the #message div, 
 * the message property of the object to the #message div value, set the 
 * type property of the object to 'userMessage', and then send the value
 */ 

/**
 * Control Flow
 * ------------
 * broswer emits a set_name event with the nickname for the socket
 *
 * server has callback attached to set_name. Makes a dictionary
 * entry on the socket and emits a name_set event. 
 * 
 * browser has callback attached to name_set. binds various 
 * callbacks (onsend in DOM, onmessage in socket, onuser_entered 
 * in socket). 
 */ 


var chatInfra = io.connect('/chat_infra'),
chatCom = io.connect('/chat_com'); 

var roomName = decodeURI((RegExp('room=' + '(.+?)(&|$)').exec(location.search) || [,null])[1]); 


/**
 * Note: 
 * -----
 * this section will only execute if there
 * is a roomName in the URL
 */ 


if ( roomName ){ 
    
    chatInfra.emit('join_room', {'name':roomName}); 
    
    chatInfra.on('name_set', function( data ){ 
	
	chatInfra.on('user_entered', function( user ){ 
	    $('#messages').append('<div clss="systemMessage">' + user.name + ' has joined the room.</div>');
	}); 

	chatInfra.on('message', function( message ) { 
	    var message = JSON.parse( message ); 
	    $('#messages').append('<div class="' + message.type + '">' + message.message + '</div>'); 
	}); 

	chatCom.on('message', function( message ){
	    var parsedMsg = JSON.parse( message );
	    $('#messages').append('<div class="' + parsedMsg.type + '"><span class="name">' 
				  +parsedMsg.username+ ":</span> " + parsedMsg.message + '</div>'); 
	}); 	


	$('#nameform').hide(); 
	$('#messages').append('<div class="systemMessage">Hello ' + data.name + '</div>'); 
	
	$('#send').click( function() { 
	    var data = { 
		message: $('#message').val(), 
		type: 'userMessage'
	    }; 
	    chatCom.send(JSON.stringify( data )); 
	    $('#message').val(''); 
	}); 
 
    }); 
}

$(function() { 
    $('#setname').click(function() { 
	chatInfra.emit('set_name', {name: $('#nickname').val()}); 
    }); 
}); 
    
  

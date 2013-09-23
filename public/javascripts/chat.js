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

var socket = io.connect('/');      



socket.on('name_set', function( data ){ 
    $('#nameform').hide(); 
    $('#messages').append('<div class="systemMessage">' + 
			  'Hello ' + data.name + '</div>'); 
    $('#send').click( function() { 
	var data = { 
	    message: $('#message').val(), 
	    type: 'userMessage'
	}; 
	socket.send(JSON.stringify( data )); 
	$('#message').val(''); 
    }); 


    socket.on('message', function( data ){ 
	var parsedData = JSON.parse( data );
	
	if( parsedData.username ){ 
	    $('#messages').append('<div class="' + parsedData.type + '"><span class="name">' 
				  +parsedData.username+ ":</span> " + parsedData.message + '</div>'); 
	} else { 
	    $('#messages').append('<div class="' + parsedData.type + '">' + parsedData.message + '</div>');
	}
    });

    
    socket.on('user_entered', function( user ){ 
	$('#messages').append('<div clss="systemMessage">' + user.name + ' has joined the room.</div>'); 
    }); 
}); 


$(function() { 
    $('#setname').click(function() { 
	socket.emit('set_name', {name: $('#nickname').val()}); 
    }); 
}); 
    
  

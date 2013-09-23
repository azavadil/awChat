/** 
 * Note: 
 * -----
 * Since socket.io work with the communication layer we need to set 
 * it up to listen to the HTTP server. The HTTP server can only be 
 * accessed from the main application module, so we have to pass the 
 * server to our module before our module can do anything
 * 
 * On the first line of the method we pass the server to the socket.io
 * modules listen method. The server is an instance of the node HTTP 
 * server modeul; socket.io will configure various handlers on this server. 
 * 
 * Next we set up our message handler for socket.io message. The first 
 * event that our server will receive is a new connection from the client. 
 * This is identified by the connection event on the io.sockets object
 * and notifies our application that a new client has opens a new connection
 * and the protocol negotiation has been completed. 
 * 
 * We set the socket.on message event to handle user messages. socket.on takes
 * two parameters:
 * @param1:         the event to handle
 * @param2:         the event handler for the event
 * 
 * 
 */ 



var io = require('socket.io'); 



exports.initialize = function( server ){ 
    io = io.listen( server );

    console.log("~/routes/sockets.js | triggered"); 



    io.sockets.on( "connection", function( socket ){ 


	socket.on('message', function( message ){ 
	    message = JSON.parse( message ); 
	    if( message.type == 'userMessage' ){
		socket.get('nickname', function( err, nickname ){ 
		    message.username = nickname;
		    socket.broadcast.send(JSON.stringify( message )); 
		    message.type = 'myMessage'; 
		    socket.send( JSON.stringify( message )); 
		}); 
	    }
	});

	socket.on('set_name', function( data ){ 
	    socket.set('nickname', data.name, function(){ 
		socket.emit('name_set', data); 
		
		socket.send(JSON.stringify({ type: 'serverMessage', 
				     message: 'Welcome to awChat'})); 
	    });
	    socket.broadcast.emit('user_entered', data); 
	}); 
		

    }); 

}; 

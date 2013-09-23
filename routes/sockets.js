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

    var self = this; 

    this.chatInfra = io.of("/chat_infra"); 
    this.chatInfra.on('connection', function( socket ){ 
	socket.on('set_name', function( data ){ 
	    socket.set('nickname', data.name, function(){ 
		socket.emit('name_set', data); 
		socket.send(JSON.stringify({ type: 'serverMessage', message: 'Welcome to awChat'}));
	    });
	});
	
	socket.on('join_room', function( room ){ 
	    socket.get('nickname', function( err, nickname ){ 
		socket.join(room.name); 
		var comSocket = self.chatCom.sockets[socket.id]; 
		comSocket.join(room.name); 
		comSocket.room = room.name; 
		socket.in(room.name).broadcast.emit('user_entered', {'name':nickname});
	    }); 
	});
    }); 
	

   

    this.chatCom = io.of('/chat_com'); 
    this.chatCom.on('connection', function( socket ){ 
	socket.on('message', function ( message ) { 
	    var parsedMsg = JSON.parse( message ); 
		
	    if( parsedMsg.type == 'userMessage' ){
		socket.get('nickname', function( err, nickname ){ 
		    parsedMsg.username = nickname;
		    socket.in(socket.room).broadcast.send(JSON.stringify( parsedMsg )); 
		    parsedMsg.type = 'myMessage'; 
		    socket.in(socket.room).send( JSON.stringify( parsedMsg )); 
		}); 
	    }
	});
	    
    }); 

}; 

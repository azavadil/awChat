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

    io.set('authorization', function(data, accept){
	if( data.headers.cookie ){
	    data.cookie = require('cookie').parse(data.headers.cookie); 
	    data.sessionID = data.cookie['express.sid'].split('.')[0]; 
	    data.nickname = data.cookie['nickname']; 
	} else { 
	    return accept('No cookie transmitted', false); 
	}
	accept(null, true); 
    }); 



    var self = this; 

    this.chatInfra = io.of("/chat_infra"); 
    this.chatInfra.on('connection', function( socket ){ 
	socket.on('join_room', function(room){
	    var nickname = socket.handshake.nickname; 
	    socket.set('nickname', nickname, function(){
		socket.emit('name_set', {'name': socket.handshake.nickname}); 
		socket.send(JSON.stringify({type:'serverMessage', message:'Welcome to awChat'})); 
			    
		socket.join(room.name); 
		var comSocket = self.chatCom.sockets[socket.id]; 
		comSocket.join(room.name); 
		comSocket.room = room.name; 
		socket.in(room.name).broadcast.emit('user_entered', {'name':nickname});
	    }); 
	});
	
	socket.on('get_rooms', function() { 
	    var rooms ={}; 
	    for(var room in io.sockets.manager.rooms){
		if( room.indexOf('/chat_infra/') == 0 ){ 
		    var roomName = room.replace('/chat_infra/', ''); 
		    rooms[roomName] = io.sockets.manager.rooms[room].length; 
		}
	    }
	    socket.emit('rooms_list', rooms); 
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

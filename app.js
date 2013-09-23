
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/chatroom', routes.chatroom); 
app.get('/rooms', routes.rooms); 

/** 
 * Note: 
 * -----
 * We have to initialize the server. To do this we set the server variable
 * as shown and then we call the socket module's initialize method (the 
 * various socket communication handlers are attached to the server in the 
 * initialize method
 */ 


var server = http.createServer(app)

require('./routes/sockets.js').initialize( server ); 


server.listen(app.get('port'), function(){ console.log("Listening on port " + app.get('port')); });  

// Requiring ExpressJS (web framework)
var express = require('express');

// Requiring Socket.io (websockets with fallbacks to FlashSockets, Long polling etc.)
var socketio = require('socket.io');

// Initializing a HTTP server with express
var app = express.createServer();


// Addding a middleware for static files
app.use(express.static(__dirname + '/public'));

// Binding the http server to port 3002
app.listen(3002);

// Telling Socket.io to listen connection to the http-server
var io =  socketio.listen(app);

// Adding a connection listener to Socket.io (io)
io.on('connection', function (socket) {

  // Lets listen to mouseclick events from the socket
  socket.on('line', function (points) {

    // Lets emit the mouseclick back to all clients
    io.sockets.emit('line', points);
  });

});



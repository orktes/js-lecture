// Requiring ExpressJS (web framework)
var express = require('express');

// Requiring Socket.io (websockets with fallbacks to FlashSockets, Long polling etc.)
var socketio = require('socket.io');

// Initializing chat client array
var clients = [];

// Initializing chat message array
var messages = [];

// Initializing a HTTP server with express
var app = express.createServer();


// Addding a middleware for static files
app.use(express.static(__dirname + '/public'));

// Binding the http server to port 3001
app.listen(3001);

// Telling Socket.io to listen connection to the http-server
var io =  socketio.listen(app);

// Adding a connection listener to Socket.io (io)
io.on('connection', function (socket) {

  // Creating client object
  var client = {};

  // "Saving" the socket to the client
  client.socket = socket;

  // Adding listener for login event to socket
  socket.once('login', function (username) {

    // Settings the client username and the login time
    client.username = username;
    client.loggedIn = new Date();

    // Informing other clients that have logged in about the login/join
    clients.forEach(function (cli) {
      cli.socket.emit('join', {username: client.username, loggedIn: client.loggedIn});
    });

    // Adding client to clients array
    clients.push(client);

    // Sending last 30 messages from log to the logged in user
    var last30Messages = messages.slice(messages.length - 30, messages.length);
    socket.emit('log', last30Messages);

    // Sending user list to the client
    socket.emit('clients', clients.map(function (cli) { return {username: cli.username, loggedIn: cli.loggedIn}}));

    // Not that the user has logged in lets add a message listener
    socket.on('message', function (message) {
      var msgObj = {username: client.username, message: message, time: new Date()};

      // Sent the message to all clients that have logged in
      clients.forEach(function (cli) {
        cli.socket.emit('message', msgObj);
      });

      // Lets store the message to the messages array
      messages.push(msgObj);
    });
  });

  // Adding listener for disconnect event to socket
  socket.on('disconnect', function () {
    // Remove the client from the clients array
    clients.splice(clients.indexOf(client), 1);

    // Informing other logged clients that the user has disconnected
    clients.forEach(function (cli) {
      cli.socket.emit('part', {username: client.username, loggedIn: client.loggedIn});
    });
  });
});



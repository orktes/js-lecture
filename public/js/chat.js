// Event listeners

function onMessage (msg) {
  // Create message element and prepend to message list
  var message = $(tmpl($('#message-template').html(), msg));
  $('#content').find('.messages').prepend(message);
}

function onLog (messages)  {
  // Iterate all the messages and pass to the onMessage handler
  $.each(messages, function (indx, msg) {
    onMessage(msg);
  });
}

function onJoin (client, dontNotify) {
  if (!dontNotify) {
    addNotification(client.username + " joined....");
  }
  // Create client element and append to client list
  var client = $(tmpl($('#client-template').html(), client));
  $('#content').find('.clients').append(client);
}

function onClients (clients)  {
  // Iterate all the clients and pass to the onJoin Handler
  $.each(clients, function (indx, client) {
    onJoin(client, true);
  });
}

function onPart (client) {
  // Remove client element from client list
  $('#content').find('.clients').find('#client-' + client.username.replace(/ /g, '')).remove();
  addNotification(client.username + " left....");
}

function addNotification (msg) {
  // Prepend a notification to the message list
  var message = $(tmpl($('#notification-template').html(), {message: msg}));
  $('#content').find('.messages').prepend(message);
}

$(function () {
  // This is executed after the DOM has fully loaded

  // Connecting to our server
  var socket = io.connect();

  // Getting content
  var content = $('#content');

  // Retrieving login template specified in the index.html
  var login = $(tmpl($('#login-template').html(), {}));

  // Adding listener to a element with class .login contained by the login element
  login.find('.login').click(function (evt) {
    // Preventing default behaviour
    evt.preventDefault();

    var username = login.find('.username').val();

    if (username.length < 2) {
      login.find('.error').html("Username should be longer");
      return;
    }

    // Adding listeners
    socket.on('message', onMessage);
    socket.on('clients', onClients);
    socket.on('join', onJoin);
    socket.on('part', onPart);
    socket.on('log', onLog);

    // Letting the server know that client wants to join the chat with the selected username
    socket.emit('login', username);

    // Changing view to chat
    var chat = $(tmpl($('#chat-template').html(), {}));
    content.html(chat);

    // Adding listener for compose enter press and send button
    function sendMessage (e) {
      e.preventDefault();

      // Retrieve message content
      var message = chat.find('.compose').val();

      // Content length is 0
      if (message.length == 0) {
        return;
      }

      // Empty the input
      chat.find('.compose').val("");

      // Send the message to server
      socket.emit('message', message);

      // return focus to message imput
      chat.find('.compose').focus();

    }

    chat.find('.send').click(sendMessage);

    chat.find('.compose').keypress(function (e) {
      if (e.keyCode === 13) { // Keycode 13 = enter
        sendMessage(e);
      }
    })

  });

  // Setting login template as page content
  content.html(login);
});

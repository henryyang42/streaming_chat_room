$(function() {

  var name, started = false;

  var addItem = function(selector, item) {
    var template = $(selector).find('script[type="text/x-jquery-tmpl"]');
    template.tmpl(item).appendTo(selector);
  };

  var addUser = function(data, show) {
    /*addItem('#users', data);
    if (show) {
        data.message = 'joins';
        addMessage(data);
    }*/
  };

  var removeUser = function(data) {
    $('#user-' + data.id).remove();
    /*data.message = 'leaves';
    addMessage(data);*/
  };

  var addMessage = function(data) {
    var d = new Date();
    data.time = $.map([d.getHours(), d.getMinutes(), d.getSeconds()],
      function(s) {
        s = String(s);
        return (s.length == 1 ? '0' : '') + s;
      }).join(':');
    addItem('#messages', data);
    $("#messages").animate({ scrollTop: $('#messages').prop('scrollHeight') }, "slow");
  };

  $('#submit').click(function() {
    var value = $('#message').val();
    var english = /^[\x00-\x7F]+$/;
    if (!english.test(value)) {
      alert('請用 ASCII 的文字，好想要支援中文ＱＱ');
      return false;
    } else {
      if (value.length > 200) {
        alert('你的訊息太長囉～');
        return false;
      }
      if (value) {
        if (!started) {
          name = value;
          data = {
            room: window.room,
            action: 'start',
            name: name
          };
          $('#submit').val('Send');
          $('#submit').html('Send');
        } else {
          data = {
            room: window.room,
            action: 'message',
            message: value
          };
        }
        socket.send(data);
      }
      $('#message').val('').focus();
      return false;
    }
  });

  $('#leave').click(function() {
    location = '/';
  });

  var socket;

  var connected = function() {
    socket.subscribe('room-' + window.room);
    if (name) {
      socket.send({
        room: window.room,
        action: 'start',
        name: name
      });
    } else {
      showForm();
    }
  };

  var disconnected = function() {
    setTimeout(start, 1000);
  };

  var messaged = function(data) {
    switch (data.action) {
      case 'in-use':
        alert('Name is in use, please choose another');
        break;
      case 'started':
        started = true;
        $('#submit').val('Send');
        $('#messages').slideDown();
        $.each(data.users, function(i, name) {
          addUser({
            name: name
          });
        });
        break;
      case 'join':
        addUser(data, true);
        break;
      case 'leave':
        removeUser(data);
        break;
      case 'message':
        addMessage(data);
        break;
      case 'system':
        data['name'] = 'SYSTEM';
        addMessage(data);
        break;
    }
  };

  var start = function() {
    socket = new io.Socket();
    socket.connect();
    socket.on('connect', connected);
    socket.on('disconnect', disconnected);
    socket.on('message', messaged);
  };

  start();

});

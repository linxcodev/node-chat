const socket = io()

$('.validate-form .input100').each(function(){
  $(this).focus(function(){
     hideValidate(this);
     $('.danger').text("")
  });
});

function showValidate(input) {
  var thisAlert = $(input).parent();

  $(thisAlert).addClass('alert-validate');
}

function hideValidate(input) {
  var thisAlert = $(input).parent();

  $(thisAlert).removeClass('alert-validate');
}

$("form").submit(function(e){
  e.preventDefault();
})

// kirim value ke socket io
$('#send').click(function () {
  socket.emit('newMessage', $('#username').val(), $('#text_box').val())
  $('#text_box').val('')

  return false
})

$('#text_box').on('keyup', function (e) {
  if (e.keyCode === 13) {
    socket.emit('newMessage', $('#username').val(), $('#text_box').val())
    $('#text_box').val('')

    return false
  }
})


// tambah pesan di list
socket.on('newMessage', function (user, msg) {
  let element = `<li class="d-flex justify-content-between mb-1">
    <div class="chat-body white pl-3 pr-3 pb-2 z-depth-1">
      <div class="header">
        <strong class="primary-font">${user}</strong>
      </div>
      <p class="mb-0">${msg}</p>
    </div>
  </li>`
  $('.tmp').remove()
  if (msg) {
    $('.chat').append(element)
  } else {
    let users = user.split(" ")

    if (users[1] == "connected") {
      $('.chat').append(`<li class="text-center con">${user}</li>`)
    } else {
      $('.chat').append(`<li class="text-center disc">${user}</li>`)
    }
  }
})

// ketika user klik button masuk -> chatroom
$('#submit_name').click(function () {
  let username = $('#username').val()

  if (/\s/.test(username)) {
    showValidate($('#username'))
    $('.danger').text("username mengandung space")
  } else if (!username) {
    showValidate($('#username'))
    $('.danger').text("username kosong")
  } else {
    socket.emit('registerUser', username)
  }
})

socket.on('registerResponse', status => {
  if (status) {
    $('#chatroom').removeClass('hidden')
    $('#homepage').addClass('hidden')
  } else {
    showValidate($('#username'))
    $('.danger').text("username sudah ada")
  }
})

socket.on('onlineUsers', usernames => {
  $('.friend-list').empty()

  usernames.map((username) => {
    $('.friend-list').append(`<li id="user_${username}" class="ml-1">
      <span>${username}</span>
    </li>`)
  })
})

// ketika user mengetik
let firstType = true
$('#text_box').keyup(() => {
  if (firstType) {
    socket.emit('isTyping', `${$('#username').val()} sedang mengetik...`)
    firstType = false
  }
})

socket.on('isTyping', msg => {
  $('.chat').append(`<li class="tmp d-flex justify-content-between mb-1">
    <div class="chat-body white pl-3 pr-3 pb-2 z-depth-1">
      <div class="header">
        <strong class="primary-font">${msg}</strong>
      </div>
    </div>
  </li>`)
})

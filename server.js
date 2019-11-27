const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const path = require('path')

app.use(express.static(path.join(__dirname, 'assets')))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

let users = {}, usernames = []

io.on('connection', function (socket) {
  // ketika ada user yang mendaftar
  let userReg = false
  socket.on('registerUser', (username) => {
    if (usernames.indexOf(username) != -1) {
      socket.emit('registerResponse', false)
    } else {
      userReg = true
      usernames.push(username)
      users[socket.id] = username
      // global emit
      io.emit('onlineUsers', usernames)
      // local emit
      socket.emit('registerResponse', true)
      socket.broadcast.emit('newMessage', `${username} connected`)
    }
  })

  // pesan baru
  socket.on('newMessage', (user, msg) => {
    io.emit('newMessage', user, msg)
  })

  // sedang mengetik
  socket.on('isTyping', msg => {
    io.emit('isTyping', msg)
  })

  socket.on('disconnect', function () {
    if (userReg) {
      socket.broadcast.emit('newMessage', `${users[socket.id]} disconnected`)
      userReg = false
    }

    let index = usernames.indexOf(users[socket.id])
    if (users[socket.id]) {
      usernames.splice(index, 1)
    }

    delete users[socket.id]

    io.emit('onlineUsers', usernames)
  })
})

http.listen(3000, function () {
  console.log('server run http://localhost:3000')
})

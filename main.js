require('dotenv').config()
const app = require('express')()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const Message = require('./model/Message.model')

app.use(cors())
const server = require('http').Server(app);
var io = require('socket.io')(server)

io.on('connection', function (socket) {
  socket.on('newUser', (data) => {
    socket.broadcast.emit('output', { msg: `${data.nickname} Connected`, nickname: 'BOT' })
  })

  socket.on('input', (data) => {
    io.sockets.emit('output', data)
  })
});

app.use(bodyParser.json());

// Opens a new server and connects to mongoDB
server.listen(process.env.PORT, () => {
    // mongoose.connect(process.env.DB_STRING, 
    // { useNewUrlParser: true }
    // );
    console.log('Listening on port', process.env.PORT)
})

const db = mongoose.connection;

// // If we can't connect just throw an error
// db.on('error', err => console.error(err));
// // Connection successful
// db.once('open', () => { console.log('Server listening on port ' + process.env.PORT )});

module.exports = server;
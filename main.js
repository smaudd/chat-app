require('dotenv').config()
const app = require('express')()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const signup = require('./routes/signup')
const login = require('./routes/login')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
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
app.use('/signup', signup)
app.use('/login', login)

// Opens a new server and connects to mongoDB
server.listen(process.env.PORT, () => {
    mongoose.connect(process.env.DB_STRING, 
    { useNewUrlParser: true }
    );
    mongoose.set('useCreateIndex', true);
})

const db = mongoose.connection;

// If we can't connect just throw an error
db.on('error', err => console.error(err));
// Connection successful
db.once('open', () => { console.log('Server listening on port ' + process.env.PORT )});

module.exports = server;
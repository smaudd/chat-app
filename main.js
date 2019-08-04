require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const signup = require('./routes/signup')
const login = require('./routes/login')
const logout = require('./routes/logout')
const contacts = require('./routes/contacts')
const socketServer = require('./socket/socketServer')
const app = express()

app.get('/', (req, res) => {
  res.status(200).send('Nothing to see')
})
app.use('/public', express.static(path.resolve(__dirname, 'public')));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.json());
app.use('/signup', signup)
app.use('/login', login)
app.use('/logout', logout)
app.use('/contacts', contacts)

mongoose.connect(
  process.env.DB_STRING, 
  { 
    useNewUrlParser: true,
    useFindAndModify: false,
    autoIndex: true
  }
  )
  .then(() => console.log('DB Connected'))
  .catch(err => console.log(err))
  mongoose.set('useCreateIndex', true);
socketServer.listen(app)
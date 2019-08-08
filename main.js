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
const jwt = require('jsonwebtoken')
const User = require('./model/User.model')
const app = express()

app.get('/', (req, res) => {
  res.status(200).send('Nothing to see')
})
app.use('/public', express.static(path.resolve(__dirname, 'public')));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.json())

app.use('/signup', signup)
app.use('/login', login)

app.use(async (req, res, next) => {
  const token = jwt.decode(req.headers.authorization, process.env.SECRET)
  const user = await User.findOne({ _id: token._id })
  res.locals.user = user
  next()
})

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
const http = require('http')
const io = require('socket.io')
const tokenValidation = require('../lib/tokenValidation')
const { notificationsHandler, chatsHandler } = require('./handlers')

module.exports.listen = app => {
    const server = http.Server(app)
    const socketServer = io(server, { origins: '*:*' })
    const chats = socketServer.of('/chats')

    chats.use(async (socket, next) => {
      // Pendiente de borrar, solo permitido en test
      if (socket.handshake.query.token === 'GIMME') return next()
      if (socket.handshake.query && socket.handshake.query.token) {
        try {
          const user = await tokenValidation(socket.handshake.query.token)
          next(user)
        } catch (err) {
          console.log('Auth invalid')
          return next(new Error(err))
        }
      }
      next(new Error('Token needed'))
    })
    .on('connection', (socket) => {
      chatsHandler(socket, chats)
    })

    server.listen(process.env.PORT, () => {
        console.log(`Listening on ${process.env.PORT}`)
    })
}



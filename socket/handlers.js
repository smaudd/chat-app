const Message = require('../model/Message.model')

exports.chatsHandler = (socket, chats) => {
    socket.join(socket.handshake.query.token)
    socket.on('message', async (data) => {
        const { 
            body,
            from,
            to
        } = data
        const message = new Message({
            body,
            from,
            to
        })
        try {
            const result = await message.save()
            console.log(result)
            chats.to(from._id).emit('message', result)
            messages.to.forEach(recipient => {
                chats.to(recipient._id).emit('message', result);
            })
        } catch (err) {
            console.log(err)
        }
    })
}


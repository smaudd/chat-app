const User = require('../model/User.model')
const Chat = require('../model/Chat.model')
const Message = require('../model/Message.model')

exports.chatsHandler = (socket, chats) => {
    socket.on('openChat', async (data) => {
        try {
            const result = await findChatU2U(data)
            socket.join(result._id)
            chats.to(result._id).emit('chatInfo', result)
        } catch (err) {
            console.log(err)
            socket.emit('close', err)
            socket.disconnect()
        }
    })
    socket.on('message', async (data) => {
        const { from, chatId, body } = data
        const message = new Message({
            body,
            chatId,
            from
        })
        try {
            const chat = await Chat.findOneAndUpdate(
                { _id: chatId },
                { updatedAt: Date.now() }
            )
            const result = await message.save()
            chats.to(chatId).emit('message', result)
        } catch (err) {
            console.log(err)
        }
    })
}

const findChatU2U = (data) => {
    return new Promise(async (resolve, reject) => {
        const { users } = data
        try {
            // In case someone tries to open a chat between two users that are not contacts
            const contact1 = await User.findOne(
                { _id: users[0]._id, "contacts._id": users[1]._id },
            )
            const contact2 = await User.findOne(
                { _id: users[1]._id, "contacts._id": users[0]._id },
            )
            if (contact1.length === 0 || contact2.length === 0) reject('Participants are not contacts')
            const chat = await Chat
                .findOneAndUpdate(
                    { users: [
                        { nickname: contact1.nickname, _id: contact1._id },
                        { nickname: contact2.nickname, _id: contact2._id }
                    ]},
                    { createdAt: Date.now() },
                    { 
                        new: true,
                        upsert: true 
                    }
                )
            const messages = await Message
                .find({ chatId: chat._id })
                .sort({ createdAt: 1 })
            resolve({
                ...chat.toObject(),
                messages
            })
        } catch (err) {
            console.log(err)
            reject(err)
            return err
        }
    })
}

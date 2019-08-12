const User = require('../model/User.model')
const Chat = require('../model/Chat.model')
const Message = require('../model/Message.model')
const jwt = require('jsonwebtoken')

exports.chatsHandler = (socket, chats) => {
    // const token = jwt.decode(socket.handshake.query.token, process.env.SECRET)
    // console.log(token)
    socket.join(socket.handshake.query.token)
    // socket.on('openChat', async (data) => {
    //     try {
    //         const result = await findChatU2U(data)
    //         socket.join(result._id)
    //         chats.to(result._id).emit('chatInfo', result)
    //     } catch (err) {
    //         console.log(err)
    //         socket.emit('close', err)
    //         socket.disconnect()
    //     }
    // })
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
            chats.to(to._id).emit('message', result)
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
            const contact1 = await User.find(
                { _id: [users[0]._id, users[1]._id], "contacts._id": [users[1]._id, users[0]._id] },
            )
            console.log(contact1)
            const contact2 = await User.findOne(
                { _id: users[1]._id, "contacts._id": users[0]._id },
            )
            if (contact1.length === 0 || contact2.length === 0) reject('Participants are not contacts')
            const chat = await Chat
                .findOneAndUpdate(
                    { "users._id": [contact2._id, contact1._id] },     
                    { users: [
                                { 
                                    nickname: contact1.nickname, 
                                    _id: contact1._id,
                                },
                                { 
                                    nickname: contact2.nickname, 
                                    _id: contact2._id,
                                }
                            ]
                    },
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

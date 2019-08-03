const User = require('../model/User.model')
const Chat = require('../model/Chat.model')
const Message = require('../model/Message.model')
const Notification = require('../model/Notification.model')


exports.chatsHandler = (socket, chats) => {
    socket.on('openChat', async (data) => {
        console.log(data)
        try {
            console.log(data)
            const result = await findChatU2U(data.participant2)
            socket.join(result.chat._id)
            chats.to(result.chat._id).emit('chatInfo', result.chat._id)
        } catch (err) {
            socket.emit('close', err)
            socket.disconnect()
        }
    })
    socket.on('message', async (data) => {
        const { from, chat_id, body } = data
        const message = new Message({
            body,
            chat_id,
            from
        })
        await message.save()
        chats.to(chat_id).emit('message', data.body)
    })
}

exports.notificationsHandler = (socket, notifications) => {
    socket.on('openNotifications', (data) => {
        socket.join(data._id)
        notifications.to(data._id).emit('channelInfo', data._id)
    })

    socket.on('notification', async (data) => {
        console.log(data)
        const { 
            to, 
            body, 
            code, 
        } = data
        const notification = new Notification({
            to,
            body,
            code,
        })
        console.log(to)
        notifications.to(data.to).emit('pushNotification', notification)
    })
}

const findChatU2U = (data) => {
    return new Promise(async (resolve, reject) => {
        participant2 = data
        try {
            const contacts = await User.find({ contacts: participant2 }, { _id: 1 })
            if (contacts.length === 0) reject('Participants are not contacts') 
            const chat = await Chat
                .findOneAndUpdate(
                    { users: [data.paticipant1, data.participant2] },
                    { updatedAt: Date.now() },
                    { 
                        new: true,
                        upsert: true 
                    }
                )
            const messages = await Message
                .find({ chat_id: chat.id })
                .sort({ createdAt: -1 })
            resolve({ chat, messages })
        } catch (err) {
            console.log(err)
            reject(err)
            return err
        }
    })
}

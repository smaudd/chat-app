const io = require('socket.io-client')

const socket = io('http://localhost:3000/notifications', {
    query: {
        token: 'GIMME'
    }
})
socket.on('connect', () => {
    socket.emit('openNotifications', { paticipant1: '5d3b67a4cf2a9e0814b5c318', participant2: '5d3b69727a65072a9098e69e' })
    socket.on('chatInfo', data => {
        console.log(data)
        socket.emit('message', { chat_id: data, from: '5d3b67a4cf2a9e0814b5c318', body: 'patatinhaaa' })
    })
    socket.on('message', data => console.log(data))
})
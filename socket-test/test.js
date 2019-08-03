const io = require('socket.io-client')

const socket = io('http://localhost:3000/chats', {
    query: {
        token: 'GIMME'
    }
})
socket.on('connect', () => {
    socket.emit('openChat', {
          paticipant1: { _id: '5d3b57fb75f90714dcbadc39', status: false }, 
          participant2: { _id: '5d3b6dc254c3fb16901cbf8e', status: false } 
        })
    socket.on('chatInfo', data => {
        console.log(data)
        socket.emit('message', { chat_id: data, from: '5d3b57fb75f90714dcbadc39', body: 'HOLA ESTE ES MI MENSAJssE' })
    })
    socket.on('message', data => console.log(data))
})
socket.on('close', data => console.log(data))
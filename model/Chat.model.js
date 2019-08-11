const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true
    },
    _id: {
        type: String,
        required: true,
    }
})

const ChatSchema = new mongoose.Schema({
        users: [userSchema],
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('Chat', ChatSchema);
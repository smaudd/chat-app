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
        users: [{
            nickname: {
                type: String,
                required: true
            },
            _id: {
                type: String,
                required: true
            }
        }]
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('Chat', ChatSchema);
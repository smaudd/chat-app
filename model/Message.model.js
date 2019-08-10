const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
        body: {
            type: String,
            required: true
        },
        chatId: {
            type: String,
            required: true
        },
        from: {
            _id: String,
            nickname: String,
        }
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('Message', MessageSchema);
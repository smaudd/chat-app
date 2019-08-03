const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
        body: {
            type: String,
            required: true
        },
        chat_id: {
            type: String,
            required: true
        },
        from: {
            type: String,
            required: true
        }
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('Message', MessageSchema);
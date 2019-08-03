const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
        users: [String]
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('Chat', ChatSchema);
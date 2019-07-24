const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
        email: {
            type: String,
            index: true
        },
        nickname: {
            type: String,
            index: true
        },
        password: {
            type: String,
            required: true
        },
        signature: {
            type: String,
            required: true
        }
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
    {
        status: {
            type: Boolean
        },
        _id: {
            type: String
        },
        nickname: {
            type: String
        }
}
)

const UserSchema = new mongoose.Schema(
    {
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
        },
        state: {
            type: Boolean,
            default: true  
        },
        player_id: {
            type: String,
        },
        contacts: [ContactSchema]
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('User', UserSchema);
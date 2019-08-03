const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
        body: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        },
        code: {
            type: Number,
            required: true
        },
    }, 
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('Notification', NotificationSchema);
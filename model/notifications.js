const mongoose = require('mongoose')


const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    from: {
        type: Object,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    responded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const notify = mongoose.model('notifications', notificationSchema)
module.exports=notify
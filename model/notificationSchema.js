const mongoose = require('mongoose')
const  {Schema} = mongoose

const notificationSchema = Schema({
    message: {type:String},
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    lecturerId: {type: Schema.Types.ObjectId, ref: "Lecturer"},
    link: {type: String},
    isRead: {type: Boolean, default: false}
}, {timestamps:true})


module.exports = mongoose.model("Notification", notificationSchema )
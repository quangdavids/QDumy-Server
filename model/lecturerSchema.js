const mongoose = require('mongoose')
const {Schema} = mongoose;

const lecturerSchema = Schema({
    lecturerId: {type: Schema.Types.ObjectId, ref: "User"},
    lecturerName:{type: String},
    jobTitle: {type: String, default: "Instructor at QDumy"},
    profilePic: {type: String, default: "https://media.istockphoto.com/id/469962702/photo/blonde-teacher-smiling-in-front-of-blurred-class-background.jpg?s=612x612&w=0&k=20&c=ZyXhvpHtlRnuecENnacaHgu4pOuE-Zg-U_LftX0P1CU="},
    biography: String,
    email: {type: String},
    ownedCourses: [{type: Schema.Types.ObjectId, ref:"Course"}],
    socialLinks: { // Social media links
        facebook: String,
        twitter: String,
        linkedin: String,
        link: String
    },
    revenue: { type: Number, min: 0, default: 0 }
}, { timestamps: true })


module.exports = mongoose.model('Lecturer', lecturerSchema)

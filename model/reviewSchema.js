const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = mongoose.Schema(
    {
        courseId: {type: Schema.Types.ObjectId, ref: "Course"},
        userId: { type: Schema.Types.ObjectId, ref: "User"},
        content: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 }
    },
    { timestamps: true }
);
module.exports = mongoose.model("Review", reviewSchema);



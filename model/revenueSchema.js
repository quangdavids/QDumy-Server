const mongoose = require("mongoose");
const { Schema } = mongoose;

const revenueSchema = Schema({
    revenue: {type:Number, default: 0}
}, {timestamps: true})

module.exports = mongoose.model("Revenue", revenueSchema)
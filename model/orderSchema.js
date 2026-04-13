const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courses: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    stripeSessionId: { type: String, unique: true, sparse: true },
    stripePaymentIntentId: { type: String, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
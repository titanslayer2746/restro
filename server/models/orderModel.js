const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerDetails: {
        name: { type: String, required: true },
        phone: { type: String, required: true},
        guests: { type: Number, required: true },
    },
    orderStatus: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default : Date.now
    },
    bills: {
        total: { type: Number, required: true },
        tax: { type: Number, required: true },
        totalWithTax: { type: Number, required: true }
    },
    items: [],
    customer: {type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true},
    table: {type: mongoose.Schema.Types.ObjectId, ref: "Table"},
    paymentMethod: { type: String, enum: ["Cash", "Online"], required: true },
    // A cashier confirms each payment by hand (cash counted / online transfer seen)
    paymentStatus: { type: String, enum: ["Pending", "Verified"], default: "Pending", index: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date
}, { timestamps : true } );

module.exports = mongoose.model("Order", orderSchema);
const mongoose = require("mongoose");

// A guest, identified by phone number. Every order they place links back here,
// so one customer can have many orders over one visit or many visits.
const customerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);

const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    // Optional label shown on the dish, e.g. "Vegetarian"
    tag: { type: String, trim: true }
}, { timestamps: true });

// A dish name only needs to be unique within its category
dishSchema.index({ category: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("Dish", dishSchema);

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // Lower-cased name, so "Salads" and "salads" can't both exist
    key: { type: String, required: true, unique: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.pre("validate", function (next) {
    if (this.name) this.key = this.name.trim().toLowerCase();
    next();
});

module.exports = mongoose.model("Category", categorySchema);

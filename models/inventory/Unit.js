const mongoose = require('mongoose');
const schema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true },   // e.g., "kg", "pack", "pc"
    multiplier: { type: Number, default: 1 }                             // optional unit math
  },
  { timestamps: true }
);
module.exports = mongoose.model('Unit', schema);

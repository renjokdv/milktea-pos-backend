const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    sku:         { type: String, unique: true, sparse: true, trim: true },
    category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand:       { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    variant:     { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
    unit:        { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },

    costPrice:   { type: Number, required: true, min: 0 }, // base cost
    markupType:  { type: String, enum: ['PERCENT', 'ABSOLUTE'], default: 'PERCENT' },
    markupValue: { type: Number, default: 0 },             // 30 => 30% OR 30 => ₱30

    // Live stock count calculated via adjustments + sales (optional denorm)
    stock:       { type: Number, default: 0 }
  },
  { timestamps: true }
);

// virtual to compute selling price
schema.virtual('sellPrice').get(function () {
  if (this.markupType === 'ABSOLUTE') return this.costPrice + this.markupValue;
  const pct = (this.markupValue || 0) / 100;
  return Math.round((this.costPrice * (1 + pct)) * 100) / 100;
});

module.exports = mongoose.model('Product', schema);

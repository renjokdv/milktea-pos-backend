const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty:     { type: Number, required: true },           // + for add, - for subtract
    reason:  { type: String, enum: ['RECEIVE','CORRECTION','SPOILAGE','RETURN','OTHER'], default: 'OTHER' },
    note:    { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockAdjustment', schema);

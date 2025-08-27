const StockAdjustment = require('../../models/inventory/StockAdjustment');
const Product = require('../../models/inventory/Product');

exports.create = async (req, res, next) => {
  try {
    const { product, qty, reason, note } = req.body;
    const adj = await StockAdjustment.create({ product, qty, reason, note });

    // Update product stock (denormalized for speed at POS)
    await Product.findByIdAndUpdate(product, { $inc: { stock: qty } });

    res.status(201).json(adj);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const q = await StockAdjustment.find().populate('product').sort({ createdAt: -1 }).limit(200);
    res.json(q);
  } catch (e) { next(e); }
};

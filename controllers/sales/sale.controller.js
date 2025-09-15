// backend/controllers/sales/sale.controller.js
const mongoose = require('mongoose');
const Sale = require('../../models/sales/Sale');
const Product = require('../../models/inventory/Product');

exports.create = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { items, paid, note } = req.body;

    // build item details first (with current prices)
    const built = [];
    for (const it of items) {
      const prod = await Product.findById(it.product).session(session);
      if (!prod) return res.status(400).json({ message: 'Invalid product' });
      const price = prod.sellPrice ?? prod.costPrice ?? 0;
      if (price < 0) return res.status(400).json({ message: `Invalid price for ${prod.name}` });
      built.push({
        product: prod._id,
        name: prod.name,
        qty: it.qty,
        price,
        subtotal: Math.round(price * it.qty * 100) / 100,
      });
    }

    const total = built.reduce((a, b) => a + b.subtotal, 0);
    const change = Math.max(0, (paid || 0) - total);

    // transaction for stock decrement + sale create
    let created;
    await session.withTransaction(async () => {
      // atomic decrement with guard (avoid negative)
      for (const it of built) {
        const resUpd = await Product.updateOne(
          { _id: it.product, stock: { $gte: it.qty } },
          { $inc: { stock: -it.qty } },
          { session }
        );
        if (resUpd.modifiedCount !== 1) {
          throw new Error(`Insufficient stock for ${it.name}`);
        }
      }

      created = await Sale.create([{
        cashier: req.user.id,
        items: built,
        total,
        paid,
        change,
        note,
      }], { session });

    });

    res.status(201).json(created[0]);
  } catch (e) {
    if (e.message && e.message.startsWith('Insufficient stock')) {
      return res.status(400).json({ message: e.message });
    }
    next(e);
  } finally {
    session.endSession();
  }
};

exports.list = async (req, res, next) => {
  try {
    const filter = req.isCashierSelfOnly ? { cashier: req.user.id } : {};
    const sales = await Sale.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(sales);
  } catch (e) { next(e); }
};

const Sale = require('../../models/sales/Sale');
const Product = require('../../models/inventory/Product');

exports.create = async (req, res, next) => {
  try {
    const { items, paid, note } = req.body;

    // Build items with price pulled now (stable record)
    const built = [];
    for (const it of items) {
      const prod = await Product.findById(it.product);
      if (!prod) return res.status(400).json({ message: 'Invalid product' });
      if (prod.stock < it.qty) return res.status(400).json({ message: `Insufficient stock for ${prod.name}` });

      const price = prod.sellPrice || prod.costPrice; // ensure price exists
      built.push({
        product: prod._id,
        name: prod.name,
        qty: it.qty,
        price,
        subtotal: Math.round(price * it.qty * 100) / 100
      });
    }

    const total = built.reduce((a, b) => a + b.subtotal, 0);
    const change = Math.max(0, (paid || 0) - total);

    const sale = await Sale.create({
      cashier: req.user.id,
      items: built,
      total,
      paid,
      change,
      note
    });

    // Decrement stock
    for (const it of items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
    }

    res.status(201).json(sale);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    // Cashiers can see their own, admins see all (handled in route)
    const filter = req.isCashierSelfOnly ? { cashier: req.user.id } : {};
    const sales = await Sale.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(sales);
  } catch (e) { next(e); }
};

const Product = require('../../models/inventory/Product');

exports.create = async (req, res, next) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const items = await Product.find()
      .populate('category brand variant unit')
      .sort({ name: 1 });
    // include virtual sellPrice
    res.json(items.map(i => ({ ...i.toObject({ virtuals: true }) })));
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).populate('category brand variant unit');
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p.toObject({ virtuals: true }));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p.toObject({ virtuals: true }));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

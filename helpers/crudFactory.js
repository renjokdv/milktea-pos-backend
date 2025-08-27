// backend/helpers/crudFactory.js
// Generic CRUD for simple "name" collections
exports.makeCrud = (Model) => ({
  create: async (req, res, next) => {
    try {
      const doc = await Model.create({ name: req.body.name });
      res.status(201).json(doc);
    } catch (e) { next(e); }
  },
  list: async (req, res, next) => {
    try {
      const docs = await Model.find().sort({ name: 1 });
      res.json(docs);
    } catch (e) { next(e); }
  },
  get: async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (e) { next(e); }
  },
  update: async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true }
      );
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (e) { next(e); }
  },
  remove: async (req, res, next) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (e) { next(e); }
  }
});

// backend/controllers/user.controller.js
const { User, ROLES } = require('../models/User');

exports.createUser = async (req, res, next) => {
  try {
    const { email, name, role, password } = req.body;
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.create({ email, name, role, password });
    res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role });
  } catch (e) { next(e); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (e) { next(e); }
};

exports.getUser = async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(u);
  } catch (e) { next(e); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const update = { name, role, isActive };
    const u = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(u);
  } catch (e) { next(e); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

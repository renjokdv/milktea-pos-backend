// backend/controllers/user.controller.js
const fs = require('fs');
const path = require('path');
const { User, ROLES } = require('../models/User');

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const avatarDir = path.join(uploadsRoot, 'avatars');

function pickDefined(obj, keys) {
  const out = {};
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
}

exports.createUser = async (req, res, next) => {
  try {
    const { email, name, role, password } = req.body;
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.create({ email, name, role, password });
    res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role, isActive: user.isActive, avatarUrl: user.avatarUrl });
  } catch (e) {
    // handle duplicate email nicely
    if (e && e.code === 11000) return res.status(409).json({ message: 'Email already exists' });
    next(e);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
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
    const { name, role, isActive } = req.body || {};
    if (role && !ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const update = pickDefined({ name, role, isActive }, ['name', 'role', 'isActive']);
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(u);
  } catch (e) { next(e); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    // try to clean avatar file if any
    if (u?.avatarUrl) {
      const abs = path.join(__dirname, '..', u.avatarUrl.replace(/^\//, ''));
      fs.promises.unlink(abs).catch(() => {});
    }
    res.status(204).end();
  } catch (e) { next(e); }
};

// --- Avatar handlers ---
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // ensure dirs exist
    fs.mkdirSync(avatarDir, { recursive: true });

    const filename = `${req.params.id}_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
    const absPath = path.join(avatarDir, filename);
    fs.writeFileSync(absPath, req.file.buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    // remove previous avatar if any
    const userPrev = await User.findById(req.params.id).select('avatarUrl');
    if (userPrev?.avatarUrl) {
      const oldAbs = path.join(__dirname, '..', userPrev.avatarUrl.replace(/^\//, ''));
      fs.promises.unlink(oldAbs).catch(() => {});
    }

    const u = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { avatarUrl } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json({ avatarUrl, user: u });
  } catch (e) { next(e); }
};

exports.deleteAvatar = async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('avatarUrl');
    if (!u) return res.status(404).json({ message: 'Not found' });

    if (u.avatarUrl) {
      const abs = path.join(__dirname, '..', u.avatarUrl.replace(/^\//, ''));
      fs.promises.unlink(abs).catch(() => {});
    }

    await User.findByIdAndUpdate(req.params.id, { $set: { avatarUrl: null } }, { runValidators: true });
    res.status(204).end();
  } catch (e) { next(e); }
};

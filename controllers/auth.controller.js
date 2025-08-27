// backend/controllers/auth.controller.js
const { User } = require('../models/User');
const { sign } = require('../utils/jwt');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = sign({ id: user._id, role: user.role, name: user.name, email: user.email });
    res.json({ token, user: { id: user._id, role: user.role, name: user.name, email: user.email } });
  } catch (e) {
    next(e);
  }
};

// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ROLES = ['ADMIN', 'INVENTORY', 'CASHIER']; // fixed roles

const userSchema = new mongoose.Schema(
  {
    email:     { type: String, unique: true, required: true, lowercase: true, trim: true },
    name:      { type: String, required: true, trim: true },
    role:      { type: String, enum: ROLES, required: true },
    password:  { type: String, required: true, minlength: 6 },
    isActive:  { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); // saltRounds=10
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = {
  User: mongoose.model('User', userSchema),
  ROLES
};

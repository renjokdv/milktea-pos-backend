// backend/seed/seedAdmin.js
require('dotenv').config();
const { connectDB } = require('../config/db');
const { User } = require('../models/User');

(async () => {
  await connectDB();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@pos.test';
  const exists = await User.findOne({ email });

  if (exists) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const admin = await User.create({
    email,
    name: 'System Admin',
    role: 'ADMIN',
    password: process.env.SEED_ADMIN_PASSWORD || 'admin123'
  });

  console.log('✅ Admin created:', admin.email);
  process.exit(0);
})();

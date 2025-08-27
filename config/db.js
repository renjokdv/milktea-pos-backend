// backend/config/db.js
// Central Mongo connection so the rest of the app doesn't worry about URIs
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return; // prevent duplicate connections in dev/hot reload

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in .env');

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, { autoIndex: true });
    isConnected = true;
    console.log('🗄️  MongoDB connected');
  } catch (err) {
    console.error('Mongo connection error:', err.message);
    process.exit(1); // crash fast if DB is unreachable
  }
}

module.exports = { connectDB };

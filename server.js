// backend/server.js
// ENTRY POINT: starts HTTP server (kept tiny)
require('dotenv').config();               // Loads .env variables
const http = require('http');             // Node's HTTP server
const app = require('./app');             // Our Express app

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);    // Wrap express in HTTP server

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

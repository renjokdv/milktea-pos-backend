// backend/scripts/smoke.js
// PURPOSE: Quick CLI smoke that pings /health to verify boot and DB connect.
// USAGE: npm run smoke (server must be running)

const http = require('http');

const HOST = 'localhost';
const PORT = process.env.PORT || 4000;

const req = http.request({ host: HOST, port: PORT, path: '/health', method: 'GET' }, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.ok) {
        console.log('✅ Smoke: /health OK', json);
        process.exit(0);
      } else {
        console.error('❌ Smoke: /health returned', json);
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Smoke: invalid JSON', data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Smoke: request error', err.message);
  process.exit(1);
});

req.end();

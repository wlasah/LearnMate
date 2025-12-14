const express = require('express');
const app = express();
const PORT = 4000;

// Simple health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

app.get('/status', (req, res) => {
  res.json({ status: 'running', port: PORT });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`TEST SERVER listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep process alive
setInterval(() => {
  console.log('Server is still running...');
}, 5000);

const express = require('express');
const app = express();
const PORT = 5001;

// Simple test routes
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

app.get('/admin/high-attendance', (req, res) => {
  res.json({ message: 'High attendance route working' });
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});

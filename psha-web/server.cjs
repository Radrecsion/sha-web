// server.cjs
const express = require('express');
const path = require('path');
const app = express();

// Port Railway akan memberikan lewat env variable
const PORT = process.env.PORT || 8080;

// Serve folder 'dist' hasil build Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all: jika request tidak ketemu file, kirim index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});

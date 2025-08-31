// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname untuk ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files dari build React
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route untuk SPA React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});

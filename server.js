import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const publicDir = path.join(__dirname, 'public');

// Stub Hugo livereload script if requested
app.get('/livereload.js', (_req, res) => {
  res.type('application/javascript').send('// Static server\n');
});

app.use(express.static(publicDir, { extensions: ['html'] }));

// Fallback for trailing-slash or directory routes in public/
app.use((req, res) => {
  const cleanPath = req.path.replace(/^\/+/, '');
  const indexCandidate = path.join(publicDir, cleanPath, 'index.html');
  if (fs.existsSync(indexCandidate)) {
    return res.sendFile(indexCandidate);
  }
  const rootIndex = path.join(publicDir, 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.status(404).sendFile(rootIndex);
  }
  res.status(404).send('Not Found');
});

app.listen(PORT, HOST, () => {
  console.log(`Math Code Center static preview server listening on http://${HOST}:${PORT}`);
});

import express from 'express';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { createHash, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 4001;
const here = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.resolve(here, '../.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
app.use(express.json({ limit: '20kb' }));

const destinations = [
  { id: 'nohradhar', name: 'Nohradhar', subtitle: 'A village at the edge of the wild', image: '/images/churdhar-temple.jpg', tag: 'THE BASECAMP' },
  { id: 'churdhar', name: 'Churdhar Peak', subtitle: 'A trail to the highest shrine in the Shivaliks', image: '/images/snow-trail.jpg', tag: 'THE SUMMIT' },
  { id: 'the-journey', name: 'The way up', subtitle: 'Mountain roads, slow journeys, open skies', image: '/images/mountain-bus.jpg', tag: 'THE JOURNEY' }
];

app.get('/api/destinations', (_req, res) => res.json(destinations));
app.get('/api/guide', (_req, res) => res.json({
  title: 'Plan a thoughtful visit',
  notes: ['Start early and check local trail conditions before setting out.', 'Carry warm layers, water and cash; services become limited beyond the village.', 'Respect the shrine, local customs and the mountain environment.']
}));

app.post('/api/inquiries', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const digits = phone.replace(/\D/g, '');

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Please enter a name between 2 and 100 characters.' });
  }
  if (digits.length < 7 || digits.length > 15) {
    return res.status(400).json({ error: 'Please enter a valid contact number.' });
  }
  if (message.length < 5 || message.length > 2000) {
    return res.status(400).json({ error: 'Please enter a message between 5 and 2,000 characters.' });
  }

  try {
    const dataDirectory = path.join(here, 'data');
    await mkdir(dataDirectory, { recursive: true });
    await appendFile(path.join(dataDirectory, 'inquiries.jsonl'), `${JSON.stringify({ name, phone, message, receivedAt: new Date().toISOString() })}\n`, { mode: 0o600 });
    return res.status(201).json({ message: 'Thanks! Your enquiry has been received.' });
  } catch (error) {
    console.error('Unable to save tourism enquiry:', error.message);
    return res.status(500).json({ error: 'We could not save your enquiry. Please try calling Rahul instead.' });
  }
});

app.get('/api/admin/inquiries', async (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    return res.status(503).json({ error: 'Admin inbox is not configured. Set ADMIN_PASSWORD to at least 12 characters in the server environment.' });
  }

  const match = /^Basic\s+([A-Za-z0-9+/=]+)$/i.exec(req.get('authorization') || '');
  const credentials = match ? Buffer.from(match[1], 'base64').toString('utf8') : '';
  const separator = credentials.indexOf(':');
  const username = separator >= 0 ? credentials.slice(0, separator) : '';
  const suppliedPassword = separator >= 0 ? credentials.slice(separator + 1) : '';
  const expectedDigest = createHash('sha256').update(adminPassword).digest();
  const suppliedDigest = createHash('sha256').update(suppliedPassword).digest();
  if (username !== 'admin' || !timingSafeEqual(suppliedDigest, expectedDigest)) {
    res.set('WWW-Authenticate', 'Basic realm="Nohradhar enquiry inbox", charset="UTF-8"');
    return res.status(401).json({ error: 'That admin password did not match.' });
  }

  try {
    const filePath = path.join(here, 'data', 'inquiries.jsonl');
    const contents = await readFile(filePath, 'utf8').catch(error => error.code === 'ENOENT' ? '' : Promise.reject(error));
    const inquiries = contents.split('\n').filter(Boolean).slice(-500).reverse().flatMap(line => {
      try { return [JSON.parse(line)]; } catch { return []; }
    });
    res.set('Cache-Control', 'no-store');
    return res.json({ inquiries });
  } catch (error) {
    console.error('Unable to read tourism enquiries:', error.message);
    return res.status(500).json({ error: 'Could not load enquiries from the server.' });
  }
});

app.use(express.static(path.resolve(here, '../dist')));
app.get('*', (_req, res) => res.sendFile(path.resolve(here, '../dist/index.html')));
app.listen(port, () => console.log(`Nohradhar guide server listening on http://localhost:${port}`));

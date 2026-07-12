require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes     = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlists');
const birthdayRoutes = require('./routes/birthdays');
const searchRoutes   = require('./routes/search');

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

// ── Middleware ──────────────────────────────────────────────────────────────

// In production on Vercel the frontend is served from the same origin,
// so CORS is only needed locally during development.
if (!isProd) {
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
}

app.use(express.json());

// ── API routes ──────────────────────────────────────────────────────────────

app.use('/api/auth',      authRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/birthdays', birthdayRoutes);
app.use('/api/search',    searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Static frontend (production only) ───────────────────────────────────────
// On Vercel, static assets are served by the CDN layer via vercel.json rewrites,
// so this block only runs when the app is self-hosted (e.g. Railway fallback).

if (isProd) {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Error handler ───────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server in development  ────────────────────────────────────────────
// Vercel imports this file as a module and calls it as a function,
// so we only bind to a port when running locally.

if (!isProd) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`AllIWant server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');

// Initialize the database (runs CREATE TABLE IF NOT EXISTS on startup)
require('./database');

const authRoutes      = require('./routes/auth');
const wishlistRoutes  = require('./routes/wishlists');
const birthdayRoutes  = require('./routes/birthdays');
const searchRoutes    = require('./routes/search');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────

// Allow the React dev server (port 3000) to call our API
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Parse incoming JSON request bodies
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth',      authRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/birthdays', birthdayRoutes);
app.use('/api/search',    searchRoutes);

// Health check — useful for confirming the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 catch-all ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WishDay server running on http://localhost:${PORT}`);
});

const express = require('express');
const { searchProducts, getByCategory, ALL_PRODUCTS } = require('../data/products');

const router = express.Router();

const CATEGORIES = [
  { id: 'tech',       label: 'Tech & Gadgets',     icon: '💻', terms: ['wireless earbuds', 'smart watch', 'phone stand', 'portable charger'] },
  { id: 'home',       label: 'Home & Kitchen',     icon: '🏠', terms: ['candle set', 'coffee maker', 'cozy blanket', 'picture frame'] },
  { id: 'beauty',     label: 'Beauty & Self-Care', icon: '✨', terms: ['skincare set', 'perfume', 'bath bomb set', 'makeup palette'] },
  { id: 'fashion',    label: 'Fashion',             icon: '👗', terms: ['silk scarf', 'leather wallet', 'sunglasses', 'jewelry set'] },
  { id: 'books',      label: 'Books & Learning',   icon: '📚', terms: ['bestseller novels', 'cookbook', 'journal notebook', 'puzzle'] },
  { id: 'experience', label: 'Experiences',         icon: '🎉', terms: ['spa gift card', 'restaurant gift card', 'cooking class', 'concert tickets'] },
  { id: 'sports',     label: 'Sports & Outdoors',  icon: '🏃', terms: ['yoga mat', 'water bottle', 'hiking gear', 'fitness tracker'] },
  { id: 'food',       label: 'Food & Drink',       icon: '🍫', terms: ['chocolate box', 'wine gift set', 'gourmet popcorn', 'tea collection'] },
];

// Returns the approved affiliate tag, or null if not yet set.
// Links work either way — we just don't earn commission until approved.
function getTag() {
  const tag = process.env.AMAZON_AFFILIATE_TAG;
  if (!tag || tag.includes('your-real-tag')) return null;
  return tag;
}

function buildAmazonUrl(term) {
  const encodedTerm = encodeURIComponent(term.trim());
  const tag = getTag();
  const tagParam = tag ? `&tag=${tag}` : '';
  return `https://www.amazon.com/s?k=${encodedTerm}${tagParam}`;
}

function injectAffiliateTag(url) {
  const tag = getTag();
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('amazon.com')) return url;
    // Only inject the tag when we have an approved one
    if (tag) parsed.searchParams.set('tag', tag);
    return parsed.toString();
  } catch {
    return url;
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/search/products?q=...&category=...
router.get('/products', (req, res) => {
  const { q, category } = req.query;
  let results;
  if (q?.trim()) {
    results = searchProducts(q);
  } else if (category) {
    results = getByCategory(category);
  } else {
    // Shuffle on the unfiltered browse so every category appears evenly
    results = shuffle(ALL_PRODUCTS);
  }
  // Static catalog — safe to cache in browser for 10 minutes
  res.set('Cache-Control', 'public, max-age=600');
  res.json({ products: results, total: results.length });
});

// GET /api/search?q=...
router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return res.status(400).json({ error: 'Search query is required' });

  res.json({
    query:      q,
    amazon_url: buildAmazonUrl(q),
    suggestions: [
      `${q} gift set`, `${q} for her`, `${q} for him`, `unique ${q}`, `personalized ${q}`,
    ].map((term) => ({ term, url: buildAmazonUrl(term) })),
  });
});

// GET /api/search/categories
router.get('/categories', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // category list is static — cache 1 hour
  res.json({
    categories: CATEGORIES.map((cat) => ({
      ...cat,
      links: cat.terms.map((term) => ({ term, url: buildAmazonUrl(term) })),
    })),
  });
});

// POST /api/search/tag-url
router.post('/tag-url', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  res.json({ original_url: url, affiliate_url: injectAffiliateTag(url) });
});

module.exports = router;

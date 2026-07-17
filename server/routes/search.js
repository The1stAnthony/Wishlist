const express = require('express');
const { searchProducts, getByCategory, getBrowseAll } = require('../data/products');

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

const AFFILIATE_TAGS = {
  'www.amazon.com':    'alliwant0a-20',
  'www.amazon.ca':     'alliwant0e-20',
  'www.amazon.co.uk':  'alliwant0c-21',
  'www.amazon.de':     'alliwant06-21',
  'www.amazon.fr':     'alliwant08-21',
  'www.amazon.it':     'alliwant04-21',
  'www.amazon.es':     'alliwant01-21',
  'www.amazon.nl':     'alliwant031-21',
  'www.amazon.com.be': 'alliwant0f1-21',
  'www.amazon.se':     'alliwant09-21',
  'www.amazon.pl':     'alliwant054-21',
};

function buildAmazonUrl(term) {
  const encodedTerm = encodeURIComponent(term.trim());
  return `https://www.amazon.com/s?k=${encodedTerm}&tag=alliwant0a-20`;
}

function injectAffiliateTag(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('amazon.')) return url;
    const tag = AFFILIATE_TAGS[parsed.hostname];
    if (tag) parsed.searchParams.set('tag', tag);
    return parsed.toString();
  } catch {
    return url;
  }
}

// Named fallback — always available. Future tower layer calls this on any API error.
function staticSearch(q, category) {
  if (q?.trim())  return searchProducts(q);
  if (category)   return getByCategory(category);
  return getBrowseAll();
}

// GET /api/search/products?q=...&category=...
router.get('/products', (req, res) => {
  const { q, category } = req.query;
  const results = staticSearch(q, category);
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

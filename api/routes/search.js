const express = require('express');

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

function buildAmazonUrl(term) {
  const tag   = process.env.AMAZON_AFFILIATE_TAG || 'alliwant-20';
  const query = encodeURIComponent(term.trim());
  return `https://www.amazon.com/s?k=${query}&tag=${tag}`;
}

function injectAffiliateTag(url) {
  const tag = process.env.AMAZON_AFFILIATE_TAG || 'alliwant-20';
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('amazon.com')) return url;
    parsed.searchParams.set('tag', tag);
    return parsed.toString();
  } catch {
    return url;
  }
}

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

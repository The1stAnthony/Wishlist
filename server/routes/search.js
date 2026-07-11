const express = require('express');

const router = express.Router();

// ── Gift categories with suggested search terms ─────────────────────────────
// Used to populate the "Browse by category" section on the search page
const CATEGORIES = [
  { id: 'tech',       label: 'Tech & Gadgets',   icon: '💻', terms: ['wireless earbuds', 'smart watch', 'phone stand', 'portable charger'] },
  { id: 'home',       label: 'Home & Kitchen',   icon: '🏠', terms: ['candle set', 'coffee maker', 'cozy blanket', 'picture frame'] },
  { id: 'beauty',     label: 'Beauty & Self-Care', icon: '✨', terms: ['skincare set', 'perfume', 'bath bomb set', 'makeup palette'] },
  { id: 'fashion',    label: 'Fashion',           icon: '👗', terms: ['silk scarf', 'leather wallet', 'sunglasses', 'jewelry set'] },
  { id: 'books',      label: 'Books & Learning',  icon: '📚', terms: ['bestseller novels', 'cookbook', 'journal notebook', 'puzzle'] },
  { id: 'experience', label: 'Experiences',       icon: '🎉', terms: ['spa gift card', 'restaurant gift card', 'cooking class', 'concert tickets'] },
  { id: 'sports',     label: 'Sports & Outdoors', icon: '🏃', terms: ['yoga mat', 'water bottle', 'hiking gear', 'fitness tracker'] },
  { id: 'food',       label: 'Food & Drink',      icon: '🍫', terms: ['chocolate box', 'wine gift set', 'gourmet popcorn', 'tea collection'] },
];

/**
 * Builds an Amazon search URL with the affiliate tag appended.
 * When users click this link and buy anything within 24 hours, we earn a commission.
 */
function buildAmazonAffiliateUrl(searchTerm) {
  const tag    = process.env.AMAZON_AFFILIATE_TAG || 'wishday-20';
  const query  = encodeURIComponent(searchTerm.trim());
  return `https://www.amazon.com/s?k=${query}&tag=${tag}`;
}

/**
 * Builds an affiliate URL for a specific product page on Amazon.
 * Used when a user pastes an Amazon product URL into the wishlist.
 */
function injectAffiliateTag(url) {
  const tag = process.env.AMAZON_AFFILIATE_TAG || 'wishday-20';

  try {
    const parsed = new URL(url);

    // Only modify amazon.com URLs
    if (!parsed.hostname.includes('amazon.com')) {
      return url; // return original URL unchanged for non-Amazon links
    }

    parsed.searchParams.set('tag', tag);
    return parsed.toString();
  } catch {
    return url; // if URL parsing fails, return original
  }
}

// ── GET /api/search?q=birthday+gift+ideas ───────────────────────────────────
// Returns an affiliate search URL + curated suggestions for the query

router.get('/', (req, res) => {
  const query = req.query.q || '';

  if (!query.trim()) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // The main affiliate link — clicking this takes the user to Amazon's search results
  const amazonUrl = buildAmazonAffiliateUrl(query);

  // Surface a few related suggested searches so the user can explore
  const suggestions = generateSuggestions(query);

  res.json({
    query,
    amazon_url:  amazonUrl, // open this in a new tab to earn affiliate commission
    suggestions,            // quick re-search options
  });
});

// ── GET /api/search/categories ──────────────────────────────────────────────

router.get('/categories', (req, res) => {
  const tag = process.env.AMAZON_AFFILIATE_TAG || 'wishday-20';

  // Attach an affiliate URL to each category's suggested search terms
  const categoriesWithUrls = CATEGORIES.map((cat) => ({
    ...cat,
    links: cat.terms.map((term) => ({
      term,
      url: buildAmazonAffiliateUrl(term),
    })),
  }));

  res.json({ categories: categoriesWithUrls });
});

// ── POST /api/search/tag-url ────────────────────────────────────────────────
// Converts a plain Amazon product URL into an affiliate-tagged URL

router.post('/tag-url', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const affiliateUrl = injectAffiliateTag(url);
  res.json({ original_url: url, affiliate_url: affiliateUrl });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateSuggestions(query) {
  const base = query.toLowerCase();
  // Simple complementary search ideas based on common birthday gift patterns
  return [
    `${query} gift set`,
    `${query} for her`,
    `${query} for him`,
    `unique ${query}`,
    `personalized ${query}`,
  ].map((term) => ({
    term,
    url: buildAmazonAffiliateUrl(term),
  }));
}

module.exports = router;

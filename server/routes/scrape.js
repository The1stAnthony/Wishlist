const express     = require('express');
const https       = require('https');
const http        = require('http');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Fetch raw HTML from a URL, following up to 3 redirects.
function fetchHtml(rawUrl, redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    if (redirectsLeft < 0) return reject(new Error('Too many redirects'));

    let parsed;
    try { parsed = new URL(rawUrl); } catch { return reject(new Error('Invalid URL')); }

    const mod = parsed.protocol === 'https:' ? https : http;

    const req = mod.get(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000,
    }, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.origin}${res.headers.location}`;
        res.destroy();
        return fetchHtml(next, redirectsLeft - 1).then(resolve).catch(reject);
      }

      let html = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        html += chunk;
        // Stop reading after 150 KB — we only need the <head>
        if (html.length > 150_000) res.destroy();
      });
      res.on('end', () => resolve(html));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

function ogTag(html, prop) {
  const re1 = new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i');
  const m = html.match(re1) || html.match(re2);
  return m ? m[1].trim() : null;
}

function metaName(html, name) {
  const re1 = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i');
  const m = html.match(re1) || html.match(re2);
  return m ? m[1].trim() : null;
}

function htmlTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function extractPrice(html) {
  // JSON-LD structured data (schema.org Product)
  const jsonld = html.match(/"price"\s*:\s*"?([\d.]+)"?/);
  if (jsonld) return parseFloat(jsonld[1]);

  // USD currency meta
  const og = html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([\d.]+)["']/i);
  if (og) return parseFloat(og[1]);

  // Loose USD amount in page
  const loose = html.match(/\$\s*([\d,]+\.?\d{0,2})/);
  if (loose) return parseFloat(loose[1].replace(/,/g, ''));

  return null;
}

// POST /api/scrape
// Requires auth so we can't be used as an open proxy.
router.post('/', requireAuth, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Only allow http/https
  let parsed;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Amazon blocks server-side requests — tell the user to fill in manually
  if (parsed.hostname.includes('amazon.com')) {
    return res.status(422).json({
      error: 'Amazon blocks automated lookups. Search our gift catalog to find Amazon products instead.',
      amazon: true,
    });
  }

  try {
    const html = await fetchHtml(url);

    const name        = ogTag(html, 'title')       || metaName(html, 'twitter:title') || htmlTitle(html);
    const image_url   = ogTag(html, 'image:secure_url') || ogTag(html, 'image');
    const description = ogTag(html, 'description') || metaName(html, 'description');
    const price       = extractPrice(html);

    res.json({
      name:        name        ? name.slice(0, 200)        : null,
      description: description ? description.slice(0, 300) : null,
      image_url:   image_url   || null,
      price,
    });
  } catch {
    res.status(422).json({ error: 'Could not fetch that URL. Try adding the item manually.' });
  }
});

module.exports = router;

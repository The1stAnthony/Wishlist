import { useState, useEffect } from 'react';
import axios from 'axios';
import AdBanner from '../components/AdBanner';
import '../styles/pages/search.css';

export default function Search() {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [searching,   setSearching]   = useState(false);
  const [error,       setError]       = useState('');

  // Load browse categories on mount
  useEffect(() => {
    axios.get('/api/search/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => {}); // non-critical — page still works without categories
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError('');
    setResults(null);

    try {
      const res = await axios.get('/api/search', { params: { q: query } });
      setResults(res.data);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  // Run a pre-filled category search term
  function searchTerm(term) {
    setQuery(term);
    setSearching(true);
    setResults(null);

    axios.get('/api/search', { params: { q: term } })
      .then((res) => setResults(res.data))
      .catch(() => setError('Search failed.'))
      .finally(() => setSearching(false));
  }

  return (
    <div>
      {/* ── Top banner ad ───────────────────────────────────────────────── */}
      <AdBanner format="horizontal" />

      {/* ── Search hero ─────────────────────────────────────────────────── */}
      <div className="search-hero">
        <h1 className="search-hero-title">🔍 Find the perfect gift</h1>
        <p className="search-hero-sub">
          Search Amazon and add items directly to your wishlist
        </p>

        <form onSubmit={handleSearch}>
          <div className="search-bar-wrapper">
            <input
              className="search-bar-input"
              type="text"
              placeholder='Try "wireless earbuds", "spa gift set", "cookbook"…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="search-bar-btn" disabled={searching}>
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      <div className="page-with-sidebar">
        <div>
          {/* ── Search results ─────────────────────────────────────────── */}
          {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

          {results && (
            <div className="search-results">
              <p className="search-results-title">
                Results for "<strong>{results.query}</strong>"
              </p>

              {/* Primary search CTA */}
              <a
                href={results.amazon_url}
                target="_blank"
                rel="noopener noreferrer"
                className="amazon-cta"
              >
                <div className="amazon-cta-left">
                  <span className="amazon-cta-label">Shop on Amazon</span>
                  <span className="amazon-cta-text">
                    See all results for "{results.query}" →
                  </span>
                </div>
                <span className="amazon-cta-arrow">🛒</span>
              </a>

              {/* Related search suggestions */}
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                Try a more specific search:
              </p>
              <div className="suggestion-chips">
                {results.suggestions.map((s) => (
                  <a
                    key={s.term}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="suggestion-chip"
                  >
                    {s.term}
                  </a>
                ))}
              </div>

              {/* Horizontal ad between results and categories */}
              <AdBanner format="horizontal" />
            </div>
          )}

          {/* ── Browse categories ──────────────────────────────────────── */}
          {categories.length > 0 && (
            <div style={{ marginTop: results ? '2rem' : '0' }}>
              <p className="section-subtitle" style={{ textAlign: 'center' }}>BROWSE BY CATEGORY</p>
              <h2 className="section-title" style={{ fontSize: '1.25rem', textAlign: 'center' }}>
                What kind of gift are you looking for?
              </h2>

              <div className="category-grid" style={{ marginTop: '1rem' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="category-tile"
                    onClick={() => searchTerm(cat.terms[0])}
                  >
                    <span className="category-tile-icon">{cat.icon}</span>
                    <span className="category-tile-label">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Show popular searches within a clicked category */}
              {results && categories.find((c) => c.terms[0] === query) && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Popular searches in this category:
                  </p>
                  <div className="suggestion-chips">
                    {categories
                      .find((c) => c.terms[0] === query)
                      ?.links.map((l) => (
                        <a
                          key={l.term}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="suggestion-chip"
                        >
                          {l.term}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ads ───────────────────────────────────────────────── */}
        <aside className="sidebar-ads ad-sidebar">
          <AdBanner format="sidebar" />
          <AdBanner format="sidebar" />
          <AdBanner format="sidebar" />
          <AdBanner format="sidebar" />
        </aside>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import '../styles/pages/search.css';

const CATEGORY_META = {
  tech:       { label: 'Tech & Gadgets',     color: '#EDE9FE', icon: '💻' },
  home:       { label: 'Home & Kitchen',     color: '#FEF3C7', icon: '🏠' },
  beauty:     { label: 'Beauty & Self-Care', color: '#FCE7F3', icon: '✨' },
  fashion:    { label: 'Fashion',             color: '#DBEAFE', icon: '👗' },
  books:      { label: 'Books & Learning',   color: '#D1FAE5', icon: '📚' },
  experience: { label: 'Experiences',         color: '#FEE2E2', icon: '🎉' },
  sports:     { label: 'Sports & Outdoors',  color: '#ECFDF5', icon: '🏃' },
  food:       { label: 'Food & Drink',       color: '#FFF7ED', icon: '🍫' },
};

export default function Search() {
  const { user } = useAuth();

  const [query,          setQuery]          = useState('');
  const [products,       setProducts]       = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searching,      setSearching]      = useState(false);

  // Add-to-wishlist modal state
  const [modalItem,    setModalItem]    = useState(null);
  const [wishlists,    setWishlists]    = useState([]);
  const [adding,       setAdding]       = useState(false);
  const [addSuccess,   setAddSuccess]   = useState('');
  const [addError,     setAddError]     = useState('');

  // Auth prompt for non-logged-in users who click "Add to list"
  const [authPromptItem, setAuthPromptItem] = useState(null);

  // Load all products on mount
  useEffect(() => {
    axios.get('/api/search/products')
      .then((r) => setProducts(r.data.products))
      .catch(() => {});
  }, []);

  const loadProducts = useCallback((q, category) => {
    setSearching(true);
    const params = {};
    if (q)        params.q        = q;
    if (category) params.category = category;
    axios.get('/api/search/products', { params })
      .then((r) => setProducts(r.data.products))
      .catch(() => {})
      .finally(() => setSearching(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    setActiveCategory(null);
    loadProducts(query.trim(), null);
  }

  function handleCategory(cat) {
    setQuery('');
    setActiveCategory(cat);
    loadProducts(null, cat);
  }

  function clearFilters() {
    setQuery('');
    setActiveCategory(null);
    loadProducts(null, null);
  }

  // ── Add-to-wishlist modal ─────────────────────────────────────────────────

  async function openModal(product) {
    setModalItem(product);
    setAddSuccess('');
    setAddError('');
    if (wishlists.length === 0) {
      try {
        const r = await axios.get('/api/wishlists/my');
        setWishlists(r.data.wishlists);
      } catch {
        setAddError('Could not load your wishlists.');
      }
    }
  }

  async function addToWishlist(wishlistId) {
    if (!modalItem) return;
    setAdding(true);
    setAddError('');
    try {
      await axios.post(`/api/wishlists/${wishlistId}/items`, {
        name:        modalItem.name,
        description: modalItem.description,
        price:       modalItem.price,
        url:         modalItem.amazon_url,
      });
      setAddSuccess(`Added to your list!`);
      setTimeout(() => { setModalItem(null); setAddSuccess(''); }, 1500);
    } catch {
      setAddError('Could not add item. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const catLabel = activeCategory ? CATEGORY_META[activeCategory]?.label : null;

  return (
    <div>
      <AdBanner format="horizontal" />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="search-hero">
        <h1 className="search-hero-title">🔍 Find the perfect gift</h1>
        <p className="search-hero-sub">Browse gift ideas and add them to your wishlist in one click</p>
        <form onSubmit={handleSearch}>
          <div className="search-bar-wrapper">
            <input
              className="search-bar-input"
              type="text"
              placeholder='Search "candles", "headphones", "yoga"…'
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

      {/* ── Centred content ───────────────────────────────────────────────── */}
      <div className="search-body">

        {/* Category filter pills */}
        <div className="search-category-pills">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              className={`search-cat-pill ${activeCategory === key ? 'active' : ''}`}
              onClick={() => activeCategory === key ? clearFilters() : handleCategory(key)}
            >
              {meta.icon} {meta.label}
            </button>
          ))}
        </div>

        {/* Active filter label */}
        {(activeCategory || query.trim()) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Showing: <strong style={{ color: 'var(--color-text)' }}>{catLabel || `"${query}"`}</strong>
              {' '}— {products.length} gift{products.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearFilters}
              style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* ── Product grid (3 columns) ───────────────────────────────────── */}
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
            No gifts found — try a different search.
          </p>
        ) : (
          <div className="product-grid">
            {products.map((p) => {
              const meta = CATEGORY_META[p.category] || {};
              return (
                <div key={p.id} className="product-card">
                  {/* Image area */}
                  <div
                    className="product-card-image"
                    style={{ backgroundColor: meta.color || '#F3F4F6' }}
                  >
                    <span className="product-card-icon">{p.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="product-card-body">
                    <p className="product-card-name">{p.name}</p>
                    <p className="product-card-desc">{p.description}</p>
                    <p className="product-card-price">${p.price.toLocaleString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="product-card-actions">
                    <a
                      href={p.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="product-card-amazon"
                    >
                      🛒 View on Amazon
                    </a>
                    {user ? (
                      <button
                        className="product-card-add"
                        onClick={() => openModal(p)}
                      >
                        + Add to list
                      </button>
                    ) : (
                      <button
                        className="product-card-add"
                        onClick={() => setAuthPromptItem(p)}
                      >
                        + Add to list
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bottom Amazon CTA ─────────────────────────────────────────── */}
        <div className="search-amazon-fallback">
          <p className="search-amazon-fallback-text">Didn't find what you were looking for?</p>
          <div className="search-amazon-fallback-links">
            <a
              href={`https://www.amazon.com/s?k=${encodeURIComponent(query || 'birthday gifts')}&tag=alliwant0a-20`}
              target="_blank"
              rel="noopener noreferrer"
              className="search-amazon-fallback-btn"
            >
              🛒 Search all of Amazon
            </a>
          </div>
        </div>

      </div>

      {/* ── Auth prompt modal (non-logged-in users) ───────────────────────── */}
      {authPromptItem && (
        <div className="modal-overlay" onClick={() => setAuthPromptItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setAuthPromptItem(null)} style={{ position: 'absolute', top: 12, right: 12 }}>✕</button>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</p>
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
              Save <em>{authPromptItem.name}</em> to your wishlist
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Create a free account to build wishlists from any store and share them with friends &amp; family.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" onClick={() => setAuthPromptItem(null)}>
                Create free account
              </Link>
              <Link to="/login" className="btn-ghost" onClick={() => setAuthPromptItem(null)}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Add-to-wishlist modal ──────────────────────────────────────────── */}
      {modalItem && (
        <div className="modal-overlay" onClick={() => setModalItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <p className="modal-title">Add to which wishlist?</p>
              <button className="modal-close" onClick={() => setModalItem(null)}>✕</button>
            </div>

            <div
              className="product-card-image"
              style={{ backgroundColor: CATEGORY_META[modalItem.category]?.color || '#F3F4F6', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', height: 80 }}
            >
              <span style={{ fontSize: '2rem' }}>{modalItem.icon}</span>
            </div>
            <p style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{modalItem.name}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>${modalItem.price.toLocaleString()}</p>

            {addSuccess && <p style={{ color: '#059669', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>✅ {addSuccess}</p>}
            {addError   && <p style={{ color: '#EF4444', marginBottom: '0.75rem', fontSize: '0.875rem' }}>{addError}</p>}

            {wishlists.length === 0 && !addError && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No wishlists yet — <a href="/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>create one first</a>.
              </p>
            )}

            <div className="modal-wishlist-list">
              {wishlists.map((w) => (
                <button
                  key={w.id}
                  className="modal-wishlist-btn"
                  onClick={() => addToWishlist(w.id)}
                  disabled={adding}
                >
                  <span>🎁 {w.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{w.item_count} item{w.item_count !== 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

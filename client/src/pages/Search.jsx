import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdBanner, { AD_SLOTS } from '../components/AdBanner';
import '../styles/pages/search.css';

const AMAZON_DOMAINS = {
  US: 'www.amazon.com',    CA: 'www.amazon.ca',       GB: 'www.amazon.co.uk',
  DE: 'www.amazon.de',     FR: 'www.amazon.fr',       IT: 'www.amazon.it',
  ES: 'www.amazon.es',     NL: 'www.amazon.nl',       SE: 'www.amazon.se',
  PL: 'www.amazon.pl',     AU: 'www.amazon.com.au',   MX: 'www.amazon.com.mx',
};

function regionalizeAmazonUrl(url, country) {
  if (!url || !country) return url;
  const domain = AMAZON_DOMAINS[country];
  if (!domain || domain === 'www.amazon.com') return url;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('amazon.')) return url;
    parsed.hostname = domain;
    parsed.searchParams.delete('tag');
    return parsed.toString();
  } catch {
    return url;
  }
}

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

const EMPTY_WRITE_IN = { name: '', url: '', description: '', price: '', image_url: '', quantity: 1, priority: 2 };

// Client-side image compression — keeps modal uploads lightweight
function compressImage(file, maxSide = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (Math.max(w, h) > maxSide) {
          if (w > h) { h = Math.round(h * maxSide / w); w = maxSide; }
          else       { w = Math.round(w * maxSide / h); h = maxSide; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Search() {
  const { user } = useAuth();
  const imageInputRef = useRef(null);

  // Products / search
  const [query,          setQuery]          = useState('');
  const [products,       setProducts]       = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searching,      setSearching]      = useState(false);

  // Modal: null | 'product' | 'write-in' | 'auth-prompt'
  const [modalMode,       setModalMode]       = useState(null);
  const [modalProduct,    setModalProduct]    = useState(null);
  const [wishlists,       setWishlists]       = useState([]);
  const [selectedListIds, setSelectedListIds] = useState(new Set());

  // Product modal overrides
  const [productQuantity, setProductQuantity] = useState(1);
  const [productPriority, setProductPriority] = useState(2);

  // Write-in form
  const [writeInForm, setWriteInForm] = useState(EMPTY_WRITE_IN);
  const [scraping,    setScraping]    = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  // Status
  const [adding,     setAdding]     = useState(false);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError,   setAddError]   = useState('');

  useEffect(() => { document.title = 'Find Gifts – All I Want'; }, []);

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

  // ── Modal helpers ─────────────────────────────────────────────────────────

  async function loadWishlists() {
    if (wishlists.length > 0) return;
    try {
      const r = await axios.get('/api/wishlists/my');
      setWishlists(r.data.wishlists);
    } catch {
      setAddError('Could not load your wishlists.');
    }
  }

  function closeModal() {
    setModalMode(null);
    setModalProduct(null);
    setSelectedListIds(new Set());
    setWriteInForm(EMPTY_WRITE_IN);
    setProductQuantity(1);
    setProductPriority(2);
    setAddSuccess('');
    setAddError('');
    setScrapeError('');
  }

  function toggleList(id) {
    setSelectedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function openProductModal(product) {
    if (!user) { setModalProduct(product); setModalMode('auth-prompt'); return; }
    setModalProduct(product);
    setSelectedListIds(new Set());
    setProductQuantity(1);
    setProductPriority(2);
    setAddSuccess('');
    setAddError('');
    setModalMode('product');
    await loadWishlists();
  }

  function openWriteIn() {
    if (!user) { setModalProduct(null); setModalMode('auth-prompt'); return; }
    setWriteInForm(EMPTY_WRITE_IN);
    setSelectedListIds(new Set());
    setAddSuccess('');
    setAddError('');
    setScrapeError('');
    setModalMode('write-in');
    loadWishlists();
  }

  async function scrapeUrl() {
    if (!writeInForm.url.trim()) return;
    setScraping(true);
    setScrapeError('');
    try {
      // Scraper is POST /api/scrape with { url } in body — requires auth
      const r = await axios.post('/api/scrape', { url: writeInForm.url.trim() });
      const d = r.data;
      setWriteInForm((prev) => ({
        ...prev,
        name:        d.name        || prev.name,
        description: d.description || prev.description,
        price:       d.price != null ? String(d.price) : prev.price,
        image_url:   d.image_url   || prev.image_url,
      }));
    } catch (err) {
      const msg = err.response?.data?.error;
      setScrapeError(msg || 'Could not fetch that URL — fill in manually.');
    } finally {
      setScraping(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800);
      setWriteInForm((prev) => ({ ...prev, image_url: compressed }));
    } catch {
      // silent — user can still paste a URL
    }
    e.target.value = '';
  }

  async function addToSelectedLists() {
    if (selectedListIds.size === 0) return;
    setAdding(true);
    setAddError('');

    const itemData = modalMode === 'write-in'
      ? {
          name:        writeInForm.name.trim(),
          description: writeInForm.description || undefined,
          price:       writeInForm.price ? parseFloat(writeInForm.price) : undefined,
          url:         writeInForm.url.trim() || undefined,
          image_url:   writeInForm.image_url  || undefined,
          quantity:    parseInt(writeInForm.quantity) || 1,
          priority:    parseInt(writeInForm.priority) || 2,
        }
      : {
          name:        modalProduct.name,
          description: modalProduct.description,
          price:       modalProduct.price,
          url:         modalProduct.amazon_url,
          quantity:    productQuantity,
          priority:    productPriority,
        };

    try {
      for (const listId of selectedListIds) {
        await axios.post(`/api/wishlists/${listId}/items`, itemData);
      }
      const count = selectedListIds.size;
      setAddSuccess(`Added to ${count} list${count !== 1 ? 's' : ''}!`);
      setTimeout(() => closeModal(), 1500);
    } catch {
      setAddError('Could not add item. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const catLabel  = activeCategory ? CATEGORY_META[activeCategory]?.label : null;
  const canSubmit = selectedListIds.size > 0 && (modalMode === 'product' || writeInForm.name.trim());

  return (
    <div>
      <AdBanner format="horizontal" slot={AD_SLOTS.horizontal} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="search-hero" style={{ position: 'relative' }}>
        <button className="write-in-btn" onClick={openWriteIn}>
          ✏️ Write in a gift
        </button>
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

      {/* ── Three-column layout: sidebar | results | sidebar ──────────────── */}
      <div className="search-layout">

        <aside className="search-sidebar">
          <AdBanner format="sidebar" slot={AD_SLOTS.vertical} />
          <AdBanner format="sidebar" slot={AD_SLOTS.square} />
        </aside>

        {/* ── Results ─────────────────────────────────────────────────────── */}
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

          {/* Product grid */}
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
                    <div
                      className="product-card-image"
                      style={{ backgroundColor: p.image ? 'var(--color-surface)' : (meta.color || '#F3F4F6') }}
                    >
                      {p.image
                        ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }} />
                        : <span className="product-card-icon">{p.icon}</span>
                      }
                    </div>
                    <div className="product-card-body">
                      <p className="product-card-name">{p.name}</p>
                      <p className="product-card-desc">{p.description}</p>
                      <p className="product-card-price">${p.price.toLocaleString()}</p>
                    </div>
                    <div className="product-card-actions">
                      <a
                        href={regionalizeAmazonUrl(p.amazon_url, user?.country || 'US')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="product-card-amazon"
                      >
                        🛒 View on Amazon
                      </a>
                      <button className="product-card-add" onClick={() => openProductModal(p)}>
                        + Add to list
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Amazon CTA */}
          <div className="search-amazon-fallback">
            <p className="search-amazon-fallback-text">Didn't find what you were looking for?</p>
            <div className="search-amazon-fallback-links">
              <a
                href={(() => {
                  const country = user?.country || 'US';
                  const domain  = AMAZON_DOMAINS[country] || 'www.amazon.com';
                  const tag     = country === 'US' ? '&tag=alliwant0a-20' : '';
                  return `https://${domain}/s?k=${encodeURIComponent(query || 'birthday gifts')}${tag}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="search-amazon-fallback-btn"
              >
                🛒 Search all of Amazon
              </a>
            </div>
          </div>

        </div>{/* end search-body */}

        <aside className="search-sidebar">
          <AdBanner format="sidebar" slot={AD_SLOTS.vertical} />
          <AdBanner format="sidebar" slot={AD_SLOTS.square} />
        </aside>

      </div>{/* end search-layout */}

      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* ── Auth prompt modal ─────────────────────────────────────────────── */}
      {modalMode === 'auth-prompt' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <button className="modal-close" onClick={closeModal} style={{ position: 'absolute', top: 12, right: 12 }}>✕</button>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</p>
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
              {modalProduct ? `Save ${modalProduct.name} to your wishlist` : 'Write in a gift'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Create a free account to build wishlists from any store and share them with friends &amp; family.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" onClick={closeModal}>Create free account</Link>
              <Link to="/login" className="btn-ghost" onClick={closeModal}>Sign in</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Add-to-list / Write-in modal ──────────────────────────────────── */}
      {(modalMode === 'product' || modalMode === 'write-in') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box modal-box--tall" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <p className="modal-title">
                {modalMode === 'write-in' ? '✏️ Write in a gift' : '+ Add to wishlist'}
              </p>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* Product preview (product mode only) */}
            {modalMode === 'product' && modalProduct && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10, flexShrink: 0, fontSize: '1.5rem',
                  background: modalProduct.image ? 'var(--color-surface)' : (CATEGORY_META[modalProduct.category]?.color || '#F3F4F6'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {modalProduct.image
                    ? <img src={modalProduct.image} alt={modalProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                    : modalProduct.icon
                  }
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>{modalProduct.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>${modalProduct.price?.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Write-in form */}
            {modalMode === 'write-in' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>

                <div>
                  <label className="write-in-label">Gift name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Instant Print Camera"
                    value={writeInForm.name}
                    onChange={(e) => setWriteInForm((f) => ({ ...f, name: e.target.value }))}
                    style={{ fontSize: '0.875rem' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="write-in-label">
                    Link <span style={{ fontWeight: 400 }}>(optional — paste to auto-fill)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={writeInForm.url}
                      onChange={(e) => setWriteInForm((f) => ({ ...f, url: e.target.value }))}
                      style={{ fontSize: '0.875rem', flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={scrapeUrl}
                      disabled={scraping || !writeInForm.url.trim()}
                      className="autofill-btn"
                    >
                      {scraping ? '…' : 'Auto-fill ↓'}
                    </button>
                  </div>
                  {scrapeError && <p style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '0.2rem' }}>{scrapeError}</p>}
                </div>

                {/* Image — URL or upload */}
                <div>
                  <label className="write-in-label">
                    Photo <span style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Image URL or upload →"
                      value={writeInForm.image_url.startsWith('data:') ? '' : writeInForm.image_url}
                      onChange={(e) => setWriteInForm((f) => ({ ...f, image_url: e.target.value }))}
                      style={{ fontSize: '0.875rem', flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="autofill-btn"
                    >
                      Upload
                    </button>
                  </div>
                  {writeInForm.image_url && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={writeInForm.image_url}
                        alt="preview"
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setWriteInForm((f) => ({ ...f, image_url: '' }))}
                        style={{ fontSize: '0.72rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label className="write-in-label">Price <span style={{ fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={writeInForm.price}
                      onChange={(e) => setWriteInForm((f) => ({ ...f, price: e.target.value }))}
                      style={{ fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label className="write-in-label">Note <span style={{ fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Any details…"
                      value={writeInForm.description}
                      onChange={(e) => setWriteInForm((f) => ({ ...f, description: e.target.value }))}
                      style={{ fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Quantity + Priority — shown in both modes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="write-in-label">Quantity wanted</label>
                {modalMode === 'write-in' ? (
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={writeInForm.quantity}
                    onChange={(e) => setWriteInForm((f) => ({ ...f, quantity: e.target.value }))}
                    style={{ fontSize: '0.875rem' }}
                  />
                ) : (
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ fontSize: '0.875rem' }}
                  />
                )}
              </div>
              <div>
                <label className="write-in-label">Priority</label>
                {modalMode === 'write-in' ? (
                  <select
                    className="form-input"
                    value={writeInForm.priority}
                    onChange={(e) => setWriteInForm((f) => ({ ...f, priority: e.target.value }))}
                    style={{ fontSize: '0.875rem' }}
                  >
                    <option value={1}>⬆ High</option>
                    <option value={2}>➡ Medium</option>
                    <option value={3}>⬇ Low</option>
                  </select>
                ) : (
                  <select
                    className="form-input"
                    value={productPriority}
                    onChange={(e) => setProductPriority(parseInt(e.target.value))}
                    style={{ fontSize: '0.875rem' }}
                  >
                    <option value={1}>⬆ High</option>
                    <option value={2}>➡ Medium</option>
                    <option value={3}>⬇ Low</option>
                  </select>
                )}
              </div>
            </div>

            {/* Status */}
            {addSuccess && <p style={{ color: '#059669', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>✅ {addSuccess}</p>}
            {addError   && <p style={{ color: '#EF4444', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{addError}</p>}

            {/* Wishlist checkboxes */}
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
              Choose wishlists:
            </p>

            {wishlists.length === 0 && !addError ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                No wishlists yet — <a href="/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>create one first</a>.
              </p>
            ) : (
              <div className="modal-wishlist-list">
                {wishlists.map((w) => (
                  <label key={w.id} className="modal-wishlist-check">
                    <input
                      type="checkbox"
                      checked={selectedListIds.has(w.id)}
                      onChange={() => toggleList(w.id)}
                      style={{ accentColor: 'var(--color-primary)', width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
                      🎁 {w.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {w.item_count} item{w.item_count !== 1 ? 's' : ''}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Confirm button */}
            {wishlists.length > 0 && (
              <button
                onClick={addToSelectedLists}
                disabled={!canSubmit || adding}
                className={`modal-confirm-btn ${canSubmit ? 'active' : ''}`}
              >
                {adding
                  ? 'Adding…'
                  : selectedListIds.size === 0
                    ? 'Select a wishlist'
                    : `Add to ${selectedListIds.size} list${selectedListIds.size !== 1 ? 's' : ''}`
                }
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

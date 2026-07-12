import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import WishlistItem from '../components/WishlistItem';
import '../styles/pages/wishlist.css';

const EMPTY_FORM = {
  name: '', description: '', price: '', url: '', image_url: '', priority: '2', quantity: '1',
};

export default function Wishlist() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState(null);
  const [items,    setItems]    = useState([]);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    axios.get(`/api/wishlists/${id}`)
      .then((res) => {
        setWishlist(res.data.wishlist);
        setItems(res.data.items);
      })
      .catch(() => {
        setError('Wishlist not found or you don\'t have access.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      // If the URL is an Amazon link, ask the server to tag it with our affiliate ID
      let affiliateUrl = '';
      if (form.url && form.url.includes('amazon.com')) {
        const tagRes = await axios.post('/api/search/tag-url', { url: form.url });
        affiliateUrl = tagRes.data.affiliate_url;
      }

      const payload = {
        ...form,
        price:         form.price    ? parseFloat(form.price) : null,
        priority:      parseInt(form.priority, 10),
        quantity:      parseInt(form.quantity, 10) || 1,
        affiliate_url: affiliateUrl || form.url || '',
      };

      const res = await axios.post(`/api/wishlists/${id}/items`, payload);
      setItems((prev) => [...prev, res.data.item]);
      setForm(EMPTY_FORM);
    } catch {
      setError('Could not add item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(itemId) {
    try {
      await axios.delete(`/api/wishlists/items/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch {
      setError('Could not delete item.');
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/list/${wishlist.share_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <div className="page-loading">Loading wishlist…</div>;
  if (error && !wishlist) return (
    <div className="page-loading">
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
      </div>
    </div>
  );

  const shareUrl = `${window.location.origin}/list/${wishlist?.share_token}`;

  return (
    <div className="page-with-sidebar">
      <div>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="wishlist-page-header">
          <div>
            <button className="btn-ghost" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }} onClick={() => navigate('/dashboard')}>
              ← Back to dashboard
            </button>
            <h1 className="wishlist-page-title">{wishlist?.title}</h1>
            {wishlist?.event_date && (
              <p className="wishlist-page-date">
                🎂 {new Date(wishlist.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Quick navigation to gift search */}
          <Link to="/search" className="btn-secondary" style={{ flexShrink: 0 }}>
            🔍 Find gifts
          </Link>
        </div>

        {/* ── Share banner ─────────────────────────────────────────────────── */}
        {wishlist?.is_public && (
          <div className="share-banner">
            <div>
              <p className="share-banner-text">📤 Share your wishlist with friends & family</p>
              <p className="share-banner-url">{shareUrl}</p>
            </div>
            <button className="share-banner-btn" onClick={copyShareLink}>
              {copied ? '✅ Copied!' : 'Copy link'}
            </button>
          </div>
        )}

        {/* ── Name display toggle ──────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '0.75rem',
        }}>
          <input
            id="use_real_name"
            type="checkbox"
            style={{ marginTop: '0.2rem', accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
            checked={Boolean(wishlist?.use_real_name)}
            onChange={async (e) => {
              const newVal = e.target.checked;
              try {
                const res = await axios.patch(`/api/wishlists/${wishlist.id}`, {
                  ...wishlist, use_real_name: newVal,
                });
                setWishlist(res.data.wishlist);
              } catch {
                setError('Could not update name setting.');
              }
            }}
          />
          <label htmlFor="use_real_name" style={{ cursor: 'pointer', flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
              👤 Show my real name on this list
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              {Boolean(wishlist?.use_real_name)
                ? 'Your full name is shown — great for sharing with family and close friends.'
                : 'Your display name / alias is shown instead — better for public sharing or social media.'}
            </p>
          </label>
        </div>

        {/* ── Address sharing toggle ───────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: wishlist?.share_address ? '#F0FDF4' : 'var(--color-surface)',
          border: `1px solid ${wishlist?.share_address ? '#86EFAC' : 'var(--color-border)'}`,
          marginBottom: '1.5rem',
        }}>
          <input
            id="share_address"
            type="checkbox"
            style={{ marginTop: '0.2rem', accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
            checked={Boolean(wishlist?.share_address)}
            onChange={async (e) => {
              const newVal = e.target.checked;
              try {
                const res = await axios.patch(`/api/wishlists/${wishlist.id}`, {
                  ...wishlist, share_address: newVal,
                });
                setWishlist(res.data.wishlist);
              } catch {
                setError('Could not update address sharing setting.');
              }
            }}
          />
          <label htmlFor="share_address" style={{ cursor: 'pointer', flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
              🏠 Let gifters ship directly to me
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              {wishlist?.share_address
                ? 'Your saved address will be visible on the shared list. Gifters can ship gifts straight to you.'
                : 'Off — your address is hidden. Gifters can still buy from your list to give in person or use a gift note.'}
            </p>
            {wishlist?.share_address && !user?.street_address && (
              <p style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.35rem', fontWeight: 500 }}>
                ⚠️ No address saved yet —{' '}
                <Link to="/profile" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                  add one in your profile
                </Link>
              </p>
            )}
          </label>
        </div>

        {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

        {/* ── Add item form ─────────────────────────────────────────────────── */}
        <form className="add-item-form" onSubmit={handleAddItem}>
          <p className="add-item-form-title">+ Add a gift idea</p>

          <div className="add-item-grid">
            <div className="full-width">
              <label className="form-label">Item name *</label>
              <input
                name="name"
                className="form-input"
                placeholder='e.g. "Apple AirPods Pro" or "Spa gift card"'
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">Price (optional)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                placeholder="49.99"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select name="priority" className="form-input" value={form.priority} onChange={handleChange}>
                <option value="1">🔴 High — really want this</option>
                <option value="2">🟡 Medium — would love it</option>
                <option value="3">🟢 Low — nice to have</option>
              </select>
            </div>

            <div>
              <label className="form-label">Quantity wanted</label>
              <input
                name="quantity"
                type="number"
                min="1"
                max="99"
                className="form-input"
                placeholder="1"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="full-width">
              <label className="form-label">
                Product link — paste any URL (Amazon, Target, Etsy, anywhere)
              </label>
              <input
                name="url"
                type="url"
                className="form-input"
                placeholder="https://www.amazon.com/dp/..."
                value={form.url}
                onChange={handleChange}
              />
            </div>

            <div className="full-width">
              <label className="form-label">Description (optional)</label>
              <input
                name="description"
                className="form-input"
                placeholder='e.g. "Size M, color blue" or "I love lavender scents"'
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={saving}>
            {saving ? 'Adding…' : 'Add to wishlist'}
          </button>
        </form>

        {/* ── Items list ───────────────────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">🎁</div>
            <p className="wishlist-empty-title">Your wishlist is empty</p>
            <p className="wishlist-empty-desc">
              Add items above, or{' '}
              <Link to="/search" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                browse gift ideas
              </Link>
              {' '}on Amazon.
            </p>
          </div>
        ) : (
          <div className="wishlist-items-list">
            {items.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sidebar ads ───────────────────────────────────────────────────── */}
      <aside className="sidebar-ads ad-sidebar">
        <AdBanner format="sidebar" />
        <AdBanner format="sidebar" />
      </aside>
    </div>
  );
}

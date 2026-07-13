import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AdBanner from '../components/AdBanner';
import WishlistItem from '../components/WishlistItem';
import '../styles/pages/wishlist.css';

const AMAZON_DOMAINS = {
  US: 'amazon.com',   CA: 'amazon.ca',    GB: 'amazon.co.uk',
  DE: 'amazon.de',    FR: 'amazon.fr',    IT: 'amazon.it',
  ES: 'amazon.es',    NL: 'amazon.nl',    SE: 'amazon.se',
  PL: 'amazon.pl',    AU: 'amazon.com.au',MX: 'amazon.com.mx',
};

function regionalizeAmazonUrl(url, country) {
  if (!url || !country) return url;
  const domain = AMAZON_DOMAINS[country];
  if (!domain || domain === 'amazon.com') return url;
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

const EMPTY_FORM = {
  name: '', description: '', price: '', url: '', image_url: '', priority: '2', quantity: '1',
};

export default function Wishlist() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { showToast } = useToast();

  const [wishlist,    setWishlist]    = useState(null);
  const [items,       setItems]       = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [enriching,   setEnriching]   = useState(false);
  const [enrichHint,  setEnrichHint]  = useState('');
  const [editingDate, setEditingDate] = useState(false);
  const [dateValue,   setDateValue]   = useState('');
  const [friends,     setFriends]     = useState([]);
  const [permittedIds, setPermittedIds] = useState(new Set());
  const [themeUrl,    setThemeUrl]    = useState('');
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/wishlists/${id}`),
      axios.get('/api/friendships').catch(() => ({ data: { friends: [] } })),
    ]).then(([res, friendsRes]) => {
        const w = res.data.wishlist;
        setWishlist(w);
        setItems(res.data.items);
        setThemeUrl(w.theme_image_url || '');
        setFriends(friendsRes.data.friends || []);
        if (w.visibility === 'specific') {
          axios.get(`/api/wishlists/${id}/permissions`)
            .then((r) => setPermittedIds(new Set((r.data.permitted || []).map((u) => u.id))))
            .catch(() => {});
        }
      })
      .catch(() => {
        setError('Wishlist not found or you don\'t have access.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Auto-fill name/description/price/image from OG tags when user pastes a URL
  async function handleUrlBlur() {
    const url = form.url.trim();
    if (!url.startsWith('http')) return;
    setEnriching(true);
    setEnrichHint('');
    try {
      const res = await axios.post('/api/scrape', { url });
      const { name, description, image_url, price } = res.data;
      setForm((prev) => ({
        ...prev,
        name:        name        && !prev.name.trim()        ? name             : prev.name,
        description: description && !prev.description.trim() ? description      : prev.description,
        image_url:   image_url   && !prev.image_url.trim()   ? image_url        : prev.image_url,
        price:       price       && !prev.price               ? String(price)    : prev.price,
      }));
      if (name) setEnrichHint('✅ Auto-filled from link!');
    } catch (err) {
      const msg = err.response?.data?.error;
      if (err.response?.data?.amazon) {
        setEnrichHint('💡 Amazon links: use the Search page to find & add Amazon gifts instead.');
      } else if (msg) {
        setEnrichHint(`ℹ️ ${msg}`);
      }
    } finally {
      setEnriching(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      // if the URL is an Amazon link, ask the server to tag it with our affiliate ID
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

  // Owner self-purchase: marks items they've bought for themselves in shopping mode.
  // Once fully purchased, the item disappears from shopping mode view (server filters it out).
  async function handleSelfPurchase(itemId, qty) {
    try {
      await axios.post(`/api/wishlists/items/${itemId}/purchase`, { qty });
      // Re-fetch so shopping mode filters correctly
      const res = await axios.get(`/api/wishlists/${id}`);
      setItems(res.data.items);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not mark item.');
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/list/${wishlist.share_token}`;
    navigator.clipboard.writeText(url).then(() => showToast('✅ Link copied to clipboard!'));
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

  async function handleVisibilityChange(vis) {
    try {
      const res = await axios.patch(`/api/wishlists/${wishlist.id}`, {
        ...wishlist, visibility: vis,
      });
      setWishlist(res.data.wishlist);
      if (vis === 'specific' && permittedIds.size === 0) {
        axios.get(`/api/wishlists/${wishlist.id}/permissions`)
          .then((r) => setPermittedIds(new Set((r.data.permitted || []).map((u) => u.id))))
          .catch(() => {});
      }
    } catch {
      setError('Could not update visibility.');
    }
  }

  async function handlePermissionToggle(friendId) {
    const next = new Set(permittedIds);
    if (next.has(friendId)) next.delete(friendId); else next.add(friendId);
    setPermittedIds(next);
    try {
      await axios.put(`/api/wishlists/${wishlist.id}/permissions`, {
        user_ids: [...next],
      });
    } catch {
      setError('Could not update permissions.');
    }
  }

  async function handleSaveTheme() {
    setSavingTheme(true);
    try {
      const res = await axios.patch(`/api/wishlists/${wishlist.id}`, {
        ...wishlist, theme_image_url: themeUrl.trim() || null,
      });
      setWishlist(res.data.wishlist);
      showToast('✅ Theme image saved!');
    } catch {
      setError('Could not save theme image.');
    } finally {
      setSavingTheme(false);
    }
  }

  async function handleDateSave() {
    try {
      const res = await axios.patch(`/api/wishlists/${wishlist.id}`, {
        ...wishlist, event_date: dateValue || null,
      });
      setWishlist(res.data.wishlist);
      setEditingDate(false);
    } catch {
      setError('Could not update event date.');
    }
  }

  const currentVisibility = wishlist?.visibility || (wishlist?.is_public ? 'public' : 'friends');
  const shareUrl = `${window.location.origin}/list/${wishlist?.share_token}`;

  const ownerCountry = user?.country || 'US';
  function regionalize(item) {
    if (ownerCountry === 'US') return item;
    const regional = regionalizeAmazonUrl(item.affiliate_url || item.url, ownerCountry);
    return regional !== (item.affiliate_url || item.url)
      ? { ...item, affiliate_url: regional }
      : item;
  }

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
            {editingDate ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <input
                  type="date"
                  className="form-input"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', width: 'auto' }}
                  autoFocus
                />
                <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} onClick={handleDateSave}>Save</button>
                <button className="btn-ghost"   style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} onClick={() => setEditingDate(false)}>Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => { setDateValue(wishlist?.event_date || ''); setEditingDate(true); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
              >
                {wishlist?.event_date ? (
                  <p className="wishlist-page-date" style={{ textDecoration: 'underline dotted', textDecorationColor: 'var(--color-text-muted)' }}>
                    🎂 {new Date(wishlist.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ✏️
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    + Set an event date
                  </p>
                )}
              </button>
            )}
          </div>

          {/* Quick navigation to gift search */}
          <Link to="/search" className="btn-secondary" style={{ flexShrink: 0 }}>
            🔍 Find gifts
          </Link>
        </div>

        {/* ── Theme image ──────────────────────────────────────────────────── */}
        <div style={{
          padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          marginBottom: '0.75rem',
        }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            🖼 Wishlist theme image
          </p>
          {(themeUrl || wishlist?.theme_image_url) && (
            <img
              src={themeUrl || wishlist.theme_image_url}
              alt="Theme preview"
              style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {/* File upload */}
          <label style={{ display: 'inline-block', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <span className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem' }}>
              📁 Upload photo
            </span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const canvas = document.createElement('canvas');
                const img = new Image();
                const reader = new FileReader();
                reader.onload = (ev) => {
                  img.onload = () => {
                    const MAX_W = 1200, MAX_H = 600;
                    let w = img.width, h = img.height;
                    if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
                    if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    setThemeUrl(canvas.toDataURL('image/jpeg', 0.75));
                  };
                  img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              className="form-input"
              placeholder="…or paste an image URL"
              value={themeUrl.startsWith('data:') ? '' : themeUrl}
              onChange={(e) => setThemeUrl(e.target.value)}
              style={{ flex: 1, fontSize: '0.8rem' }}
            />
            <button
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem', flexShrink: 0 }}
              onClick={handleSaveTheme}
              disabled={savingTheme}
            >
              {savingTheme ? 'Saving…' : 'Save'}
            </button>
            {wishlist?.theme_image_url && (
              <button
                className="btn-ghost"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#EF4444', flexShrink: 0 }}
                onClick={async () => {
                  setSavingTheme(true);
                  try {
                    const res = await axios.patch(`/api/wishlists/${wishlist.id}`, {
                      ...wishlist, theme_image_url: null,
                    });
                    setWishlist(res.data.wishlist);
                    setThemeUrl('');
                    showToast('Theme image removed.');
                  } catch {
                    setError('Could not remove theme image.');
                  } finally {
                    setSavingTheme(false);
                  }
                }}
                disabled={savingTheme}
              >
                Remove
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
            This image appears as the wishlist cover in event cards. Falls back to your profile picture.
          </p>
        </div>

        {/* ── Visibility selector ──────────────────────────────────────────── */}
        <div style={{
          padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          marginBottom: '0.75rem',
        }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            👁 Who can see this wishlist?
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { value: 'public',   label: '🌎 Public',          tip: 'Anyone with the link can view this wishlist.', disabled: !user?.creator_mode, disabledTip: 'Enable creator mode in your profile to make wishlists public.' },
              { value: 'friends',  label: '👥 Friends',         tip: 'Only your accepted friends can view this wishlist.' },
              { value: 'specific', label: '🔒 Specific people', tip: 'Only friends you hand-pick can view this wishlist.', disabled: friends.length === 0, disabledTip: 'Add friends first to use this feature.' },
            ].map(({ value, label, tip, disabled, disabledTip }) => (
              <button
                key={value}
                type="button"
                onClick={() => !disabled && handleVisibilityChange(value)}
                title={disabled ? disabledTip : tip}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem', fontWeight: 600,
                  border: currentVisibility === value ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: currentVisibility === value ? '#EDE9FE' : 'var(--color-background)',
                  color: currentVisibility === value ? 'var(--color-primary)' : disabled ? '#D1D5DB' : 'var(--color-text-muted)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {currentVisibility === 'public'
              ? 'Anyone with the link can view this wishlist.'
              : currentVisibility === 'friends'
              ? 'Only your accepted friends can view this wishlist.'
              : 'Only specific friends you choose can view this wishlist.'}
          </p>

          {/* Friend picker — only shown when visibility is 'specific' */}
          {currentVisibility === 'specific' && friends.length > 0 && (
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                Choose who can see this wishlist:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {friends.map((f) => (
                  <label key={f.friend_id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <input
                      type="checkbox"
                      checked={permittedIds.has(f.friend_id)}
                      onChange={() => handlePermissionToggle(f.friend_id)}
                      style={{ accentColor: 'var(--color-primary)', width: 15, height: 15 }}
                    />
                    {f.avatar_url
                      ? <img src={f.avatar_url} alt={f.friend_name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(f.display_name || f.friend_name || '?').charAt(0).toUpperCase()}
                        </div>
                    }
                    <span style={{ color: 'var(--color-text)' }}>{f.display_name || f.friend_name}</span>
                  </label>
                ))}
              </div>
              {permittedIds.size === 0 && (
                <p style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '0.4rem' }}>
                  Select at least one friend to allow access.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Share banner ─────────────────────────────────────────────────── */}
        {currentVisibility === 'public' && (
          <div className="share-banner">
            <div>
              <p className="share-banner-text">📤 Share your wishlist with friends & family</p>
              <p className="share-banner-url">{shareUrl}</p>
            </div>
            <button className="share-banner-btn" onClick={copyShareLink}>
              Copy link
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

        {/* ── Surprise / Shopping mode toggle ──────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: wishlist?.spoiler_free ? '#FFF7ED' : '#F0FDF4',
          border: `1px solid ${wishlist?.spoiler_free ? '#FCD34D' : '#86EFAC'}`,
          marginBottom: '1rem',
        }}>
          <input
            id="spoiler_free"
            type="checkbox"
            style={{ marginTop: '0.2rem', accentColor: '#F59E0B', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
            checked={Boolean(wishlist?.spoiler_free)}
            onChange={async (e) => {
              const newVal = e.target.checked;
              try {
                const patchRes = await axios.patch(`/api/wishlists/${wishlist.id}`, {
                  ...wishlist, spoiler_free: newVal,
                });
                setWishlist(patchRes.data.wishlist);
                // Re-fetch items — backend returns different data for each mode
                const itemsRes = await axios.get(`/api/wishlists/${wishlist.id}`);
                setItems(itemsRes.data.items);
              } catch {
                setError('Could not update mode.');
              }
            }}
          />
          <label htmlFor="spoiler_free" style={{ cursor: 'pointer', flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
              {wishlist?.spoiler_free ? '🎂 No Spoilers mode is ON' : '🛒 Shopping mode is ON'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              {Boolean(wishlist?.spoiler_free)
                ? 'Your full list is shown with no purchase info — you\'ll be surprised on your birthday. Uncheck to switch to shopping mode.'
                : 'Showing items you still need. You can see how many are left and mark things you\'ve bought yourself. Check to switch to No Spoilers mode.'}
            </p>
          </label>
        </div>

        {wishlist?.spoiler_free && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem',
            borderRadius: 'var(--radius-md)',
            background: '#FFFBEB', border: '1px solid #FCD34D',
            fontSize: '0.8rem', color: '#92400E',
          }}>
            🎂 <strong>No Spoilers mode:</strong> All purchase activity is hidden from you — your friends and family still see what's been claimed. You'll be surprised on the big day.
          </div>
        )}

        {!wishlist?.spoiler_free && items.length > 0 && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem',
            borderRadius: 'var(--radius-md)',
            background: '#F0FDF4', border: '1px solid #86EFAC',
            fontSize: '0.8rem', color: '#065F46',
          }}>
            🛒 <strong>Shopping mode:</strong> Showing {items.length} item{items.length !== 1 ? 's' : ''} you still need. Use "I bought this" to mark things off as you get them yourself.
          </div>
        )}

        {!wishlist?.spoiler_free && items.length === 0 && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem',
            borderRadius: 'var(--radius-md)',
            background: '#F0FDF4', border: '1px solid #86EFAC',
            fontSize: '0.8rem', color: '#065F46',
          }}>
            🎉 Everything on this list has been accounted for! Switch to surprise mode if you want to see the full list without purchase details.
          </div>
        )}

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
                Product link — paste any URL and we'll auto-fill the details
                {enriching && <span style={{ color: 'var(--color-primary)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>Looking up…</span>}
              </label>
              <input
                name="url"
                type="url"
                className="form-input"
                placeholder="https://www.target.com/p/... or any product page"
                value={form.url}
                onChange={handleChange}
                onBlur={handleUrlBlur}
              />
              {enrichHint && (
                <p style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: enrichHint.startsWith('✅') ? '#059669' : 'var(--color-text-muted)' }}>
                  {enrichHint}
                </p>
              )}
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
                item={regionalize(item)}
                onDelete={handleDeleteItem}
                spoilerFree={Boolean(wishlist?.spoiler_free)}
                onSelfPurchase={!wishlist?.spoiler_free ? handleSelfPurchase : undefined}
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

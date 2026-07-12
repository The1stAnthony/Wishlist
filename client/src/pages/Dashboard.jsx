import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import '../styles/pages/dashboard.css';

export default function Dashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [wishlists, setWishlists]     = useState([]);
  const [upcoming,  setUpcoming]      = useState([]);
  const [showForm,  setShowForm]      = useState(false);
  const [newList,   setNewList]       = useState({ title: '', event_date: '' });
  const [creating,  setCreating]      = useState(false);
  const [loading,   setLoading]       = useState(true);
  const [error,     setError]         = useState('');

  // Load wishlists and upcoming birthdays on mount
  useEffect(() => {
    Promise.all([
      axios.get('/api/wishlists/my'),
      axios.get('/api/birthdays/upcoming'),
    ])
      .then(([listRes, bdayRes]) => {
        setWishlists(listRes.data.wishlists);
        setUpcoming(bdayRes.data.upcoming);
      })
      .catch(() => setError('Failed to load your data. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  async function createWishlist(e) {
    e.preventDefault();
    if (!newList.title.trim() || creating) return;
    setCreating(true);
    try {
      const res = await axios.post('/api/wishlists', newList);
      setWishlists((prev) => [res.data.wishlist, ...prev]);
      setNewList({ title: '', event_date: '' });
      setShowForm(false);
      navigate(`/wishlist/${res.data.wishlist.id}`);
    } catch {
      setError('Could not create wishlist. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteList(listId, listTitle) {
    if (!window.confirm(`Delete "${listTitle}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/wishlists/${listId}`);
      setWishlists((prev) => prev.filter((w) => w.id !== listId));
    } catch {
      setError('Could not delete wishlist.');
    }
  }

  // Format a date like "July 15"
  function formatDate(dateStr) {
    if (!dateStr) return null;
    const [, month, day] = dateStr.split('-');
    return new Date(0, Number(month) - 1, Number(day)).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) return <div className="page-loading">Loading your dashboard…</div>;

  return (
    <div className="page-with-sidebar">
      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div>
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            Hey, <span>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="dashboard-date">{today}</p>
        </div>

        {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

        {/* ── Upcoming birthdays strip ─────────────────────────────────── */}
        {upcoming.length > 0 && (
          <section className="upcoming-section">
            <h2 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              🎂 Upcoming birthdays
            </h2>
            <div className="upcoming-scroll">
              {upcoming.map((contact) => (
                <div key={contact.id} className="birthday-chip">
                  <div className="birthday-chip-avatar">
                    {contact.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="birthday-chip-name">{contact.contact_name.split(' ')[0]}</span>
                  <span className={`birthday-chip-days ${contact.days_until <= 7 ? 'soon' : ''}`}>
                    {contact.days_until === 0
                      ? '🎉 Today!'
                      : contact.days_until === 1
                        ? 'Tomorrow'
                        : `in ${contact.days_until}d`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Wishlists ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.1rem', marginBottom: 0 }}>
            My wishlists
          </h2>
          <button className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={() => setShowForm(true)}>
            + New list
          </button>
        </div>

        {/* Create new wishlist inline form */}
        {showForm && (
          <form className="add-item-form" onSubmit={createWishlist} style={{ marginBottom: '1.25rem' }}>
            <p className="add-item-form-title">Create a new wishlist</p>
            <div className="add-item-grid">
              <div className="full-width">
                <label className="form-label">List name</label>
                <input
                  className="form-input"
                  placeholder="e.g. My 30th Birthday Wishlist"
                  value={newList.title}
                  onChange={(e) => setNewList((p) => ({ ...p, title: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label">Birthday / event date (optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={newList.event_date}
                  onChange={(e) => setNewList((p) => ({ ...p, event_date: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create list'}</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="wishlists-grid">
          {/* Existing wishlists */}
          {wishlists.map((list) => (
            <div key={list.id} className="wishlist-card" onClick={() => navigate(`/wishlist/${list.id}`)}>
              <div>
                <p className="wishlist-card-title">{list.title}</p>
                {list.event_date && (
                  <p className="wishlist-card-date">🎂 {formatDate(list.event_date)}</p>
                )}
              </div>
              <div className="wishlist-card-meta">
                <span className="badge badge-purple">{list.item_count} item{list.item_count !== 1 ? 's' : ''}</span>
                {list.is_public ? (
                  <span className="badge badge-green">Public</span>
                ) : (
                  <span className="badge">Private</span>
                )}
              </div>
              <div className="wishlist-card-footer">
                <Link
                  to={`/list/${list.share_token}`}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                >
                  Share link
                </Link>
                <button
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', color: '#EF4444' }}
                  onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id, list.title); }}
                  title="Delete this wishlist"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}

          {/* Add new list tile */}
          {!showForm && (
            <div className="wishlist-card-new" onClick={() => setShowForm(true)}>
              <span className="wishlist-card-new-icon">＋</span>
              <span className="wishlist-card-new-label">New wishlist</span>
            </div>
          )}
        </div>

        {wishlists.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎁</p>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No wishlists yet</p>
            <p style={{ fontSize: '0.875rem' }}>Create your first wishlist so friends know exactly what to get you.</p>
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

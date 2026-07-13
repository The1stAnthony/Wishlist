import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import '../styles/pages/dashboard.css';

const AVATAR_COLORS = ['#7C3AED', '#DC2626', '#2563EB', '#059669', '#D97706', '#DB2777', '#1F2937'];

function hashColor(str) {
  if (!str) return AVATAR_COLORS[0];
  return AVATAR_COLORS[str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

function daysUntilDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d - today) / 86400000);
}

function DaysTag({ n }) {
  if (n < 0)   return <span className="event-days-tag event-days-tag--past">{Math.abs(n)}d ago</span>;
  if (n === 0) return <span className="event-days-tag event-days-tag--today">🎉 Today!</span>;
  if (n === 1) return <span className="event-days-tag event-days-tag--soon">Tomorrow</span>;
  if (n <= 7)  return <span className="event-days-tag event-days-tag--soon">in {n}d</span>;
  return <span className="event-days-tag">in {n}d</span>;
}

function MiniAvatar({ name, url, size = 22 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: hashColor(name),
      color: '#fff', fontSize: size * 0.42, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{initial}</div>
  );
}

function EventCard({ item }) {
  const coverSrc = item.theme_image || item.cover_image || item.owner_avatar || null;
  const inner = (
    <div className="event-card">
      {/* Cover: theme image → first item image → owner pfp → colored initial */}
      {coverSrc ? (
        <img src={coverSrc} alt={item.title} className="event-card-image" />
      ) : (
        <div className="event-card-placeholder" style={{ background: hashColor(item.owner_name || item.title) }}>
          <span>{(item.owner_name || item.title || '?').charAt(0).toUpperCase()}</span>
        </div>
      )}

      <div className="event-card-body">
        <p className="event-card-title">{item.title}</p>
        {item.owner_name && (
          <div className="event-card-owner">
            <MiniAvatar name={item.owner_name} url={item.owner_avatar} />
            <span className="event-card-owner-name">{item.owner_name}</span>
          </div>
        )}
        <DaysTag n={item.days_until} />
      </div>
    </div>
  );

  if (!item.link) return inner;
  if (item.isExternal) return <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>;
  return <Link to={item.link} style={{ textDecoration: 'none' }}>{inner}</Link>;
}

function WishlistCard({ list, onDelete, userAvatarUrl }) {
  const navigate = useNavigate();
  const vis = list.visibility || (list.is_public ? 'public' : 'friends');
  const coverSrc = list.theme_image_url || userAvatarUrl || null;

  return (
    <div className="wishlist-card" onClick={() => navigate(`/wishlist/${list.id}`)}>
      {coverSrc && (
        <img
          src={coverSrc}
          alt={list.title}
          style={{
            width: '100%',
            height: list.theme_image_url ? 100 : 40,
            objectFit: 'cover',
            borderRadius: list.theme_image_url ? 'var(--radius-md) var(--radius-md) 0 0' : '50%',
            display: 'block',
            marginBottom: '0.5rem',
            ...(list.theme_image_url
              ? { margin: '-1rem -1rem 0.75rem', width: 'calc(100% + 2rem)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }
              : { width: 40, height: 40, borderRadius: '50%', margin: '0 0 0.5rem' }),
          }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div>
        <p className="wishlist-card-title">{list.title}</p>
        {list.event_date && (
          <p className="wishlist-card-date">🎂 {new Date(list.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        )}
      </div>
      <div className="wishlist-card-meta">
        <span className="badge badge-purple">{list.item_count} item{list.item_count !== 1 ? 's' : ''}</span>
        {vis === 'public'   && <span className="badge badge-green">Public</span>}
        {vis === 'friends'  && <span className="badge badge-amber">Friends</span>}
        {vis === 'specific' && <span className="badge">Specific</span>}
      </div>
      <div className="wishlist-card-footer">
        {vis === 'public' && (
          <Link
            to={`/list/${list.share_token}`}
            onClick={(e) => e.stopPropagation()}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
          >
            Share link
          </Link>
        )}
        <button
          className="btn-ghost"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', color: '#EF4444', marginLeft: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onDelete(list.id, list.title); }}
          title="Delete this wishlist"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [wishlists,         setWishlists]         = useState([]);
  const [upcomingBdays,     setUpcomingBdays]     = useState([]);
  const [networkUpcoming,   setNetworkUpcoming]   = useState([]);
  const [friendsUpcoming,   setFriendsUpcoming]   = useState([]);
  const [friendsFeed,       setFriendsFeed]       = useState([]);
  const [creatorFeed,       setCreatorFeed]       = useState([]);
  const [showForm,          setShowForm]          = useState(false);
  const [newList,           setNewList]           = useState({ title: '', event_date: '' });
  const [creating,          setCreating]          = useState(false);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');

  const scrollRef = useRef(null);

  useEffect(() => { document.title = 'Dashboard – All I Want'; }, []);

  useEffect(() => {
    const safe = (p, label) => p.catch((err) => {
      console.warn(`[Dashboard] ${label} failed:`, err?.response?.data?.error || err?.message);
      return { data: { wishlists: [], upcoming: [] } };
    });

    Promise.all([
      axios.get('/api/wishlists/my'),
      axios.get('/api/birthdays/upcoming'),
      safe(axios.get('/api/follows/network-upcoming'), 'network-upcoming'),
      safe(axios.get('/api/follows/feed'),             'creator-feed'),
      safe(axios.get('/api/friendships/feed'),         'friends-feed'),
      safe(axios.get('/api/friendships/upcoming'),     'friends-upcoming'),
    ]).then(([listRes, bdayRes, netRes, feedRes, friendsFeedRes, friendsUpcomingRes]) => {
      setWishlists(listRes.data.wishlists);
      setUpcomingBdays(bdayRes.data.upcoming);
      setNetworkUpcoming(netRes.data.wishlists);
      setCreatorFeed(feedRes.data.wishlists);
      setFriendsFeed(friendsFeedRes.data.wishlists);
      setFriendsUpcoming(friendsUpcomingRes.data.wishlists);
    }).catch((err) => {
      console.error('[Dashboard] Critical load error:', err);
      setError('Failed to load your dashboard. Please refresh.');
    })
      .finally(() => setLoading(false));
  }, []);

  // Combine birthday contacts + friends' upcoming + creator network into one sorted list.
  // Friends go before network so their version wins dedup (real name preferred over alias).
  const allUpcoming = [
    ...upcomingBdays.map((c) => ({
      id:           `b-${c.id}`,
      rawId:        c.id,
      type:         'birthday',
      title:        c.contact_name,
      days_until:   c.days_until,
      link:         c.wishlist_url || null,
      isExternal:   true,
      theme_image:  null,
      cover_image:  null,
      owner_name:   null,
      owner_avatar: null,
    })),
    // Friends first so they win dedup over creator-network entries for the same wishlist
    ...friendsUpcoming
      .map((w) => ({
        id:           `f-${w.id}`,
        rawId:        w.id,
        type:         'wishlist',
        title:        w.title,
        days_until:   daysUntilDate(w.event_date),
        link:         `/list/${w.share_token}`,
        isExternal:   false,
        theme_image:  w.theme_image_url || null,
        cover_image:  w.cover_image,
        owner_name:   w.owner_name,
        owner_avatar: w.owner_avatar,
      }))
      .filter((w) => w.days_until >= -7 && w.days_until <= 90),
    // Creator network: show alias (display_name)
    ...networkUpcoming
      .map((w) => ({
        id:           `n-${w.id}`,
        rawId:        w.id,
        type:         'wishlist',
        title:        w.title,
        days_until:   daysUntilDate(w.event_date),
        link:         `/list/${w.share_token}`,
        isExternal:   false,
        theme_image:  w.theme_image_url || null,
        cover_image:  w.cover_image,
        owner_name:   w.display_name || w.owner_name,
        owner_avatar: w.owner_avatar,
      }))
      .filter((w) => w.days_until >= -7 && w.days_until <= 90),
  ]
    // Deduplicate by raw numeric wishlist id — friends version (which comes first) wins
    .filter((item, idx, arr) => arr.findIndex((x) => x.rawId === item.rawId) === idx)
    .sort((a, b) => a.days_until - b.days_until)
    .slice(0, 20);

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

  function scrollEvents(dir) {
    scrollRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Birthday reminder: show if user has a birthday within 90 days and <10 items total
  const birthdayReminder = (() => {
    if (!user?.birthday) return null;
    const bd = new Date(user.birthday + 'T00:00:00');
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
    const next = thisYear < now ? new Date(now.getFullYear() + 1, bd.getMonth(), bd.getDate()) : thisYear;
    const daysAway = Math.ceil((next - now) / 86400000);
    if (daysAway > 90) return null;
    const totalItems = wishlists.reduce((s, w) => s + (w.item_count || 0), 0);
    return { daysAway, totalItems };
  })();

  if (loading) return <div className="page-loading">Loading your dashboard…</div>;

  return (
    <div className="page-with-sidebar">
      <div>
        {/* ── Greeting ──────────────────────────────────────────────────────── */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            Hey, <span>{user?.display_name || user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="dashboard-date">{today}</p>
        </div>

        {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

        {/* ── Birthday reminder banner ──────────────────────────────────────── */}
        {birthdayReminder && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
            gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #EDE9FE, #FAF9FF)',
            border: '1.5px solid var(--color-primary-light)', marginBottom: '1.5rem',
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>
                🎂 Your birthday is in {birthdayReminder.daysAway} days!
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                {birthdayReminder.totalItems < 10
                  ? `You only have ${birthdayReminder.totalItems} gift idea${birthdayReminder.totalItems !== 1 ? 's' : ''} — we suggest at least 10 so friends have great options.`
                  : 'Make sure your wishlist is up to date and shared!'}
              </p>
            </div>
            {wishlists.length === 0 ? (
              <button
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', flexShrink: 0 }}
                onClick={() => setShowForm(true)}
              >
                + Create wishlist
              </button>
            ) : (
              <button
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', flexShrink: 0 }}
                onClick={() => navigate(`/wishlist/${wishlists[0].id}`)}
              >
                + Add gifts
              </button>
            )}
          </div>
        )}

        {/* ── Upcoming Birthdays / Events ───────────────────────────────────── */}
        <section className="dashboard-section" style={{ marginBottom: '2rem', border: 'none', padding: 0 }}>
          <div className="dashboard-section-header">
            <h2 className="section-title">🎂 Upcoming Birthdays / Events</h2>
            {allUpcoming.length > 0 && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="scroll-arrow" onClick={() => scrollEvents(-1)} aria-label="Scroll left">‹</button>
                <button className="scroll-arrow" onClick={() => scrollEvents(1)} aria-label="Scroll right">›</button>
              </div>
            )}
          </div>
          {allUpcoming.length > 0 ? (
            <div className="event-scroll" ref={scrollRef}>
              {allUpcoming.map((item) => <EventCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '0.4rem' }}>No upcoming events yet.</p>
              <p>
                <Link to="/friends" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Add friends</Link>
                {' '}or{' '}
                <Link to="/friends" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>follow creators</Link>
                {' '}to see their upcoming wishlists here.
              </p>
            </div>
          )}
        </section>

        {/* ── My Wishlists ──────────────────────────────────────────────────── */}
        <section className="dashboard-section dashboard-section--mine">
          <div className="dashboard-section-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>My wishlists</h2>
            <button
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
              onClick={() => setShowForm(true)}
            >
              + New list
            </button>
          </div>

          {showForm && (
            <form className="add-item-form" onSubmit={createWishlist} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
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

          <div className="wishlists-grid" style={{ marginTop: '1rem' }}>
            {wishlists.map((list) => (
              <WishlistCard key={list.id} list={list} onDelete={handleDeleteList} userAvatarUrl={user?.avatar_url} />
            ))}
            {!showForm && (
              <div className="wishlist-card-new" onClick={() => setShowForm(true)}>
                <span className="wishlist-card-new-icon">＋</span>
                <span className="wishlist-card-new-label">New wishlist</span>
              </div>
            )}
          </div>

          {wishlists.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</p>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No wishlists yet</p>
              <p style={{ fontSize: '0.875rem' }}>Create your first wishlist so friends know exactly what to get you.</p>
            </div>
          )}
        </section>

        {/* ── Friends' Wishlists ────────────────────────────────────────────── */}
        <section className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="dashboard-section-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Friends' Wishlists</h2>
            <Link to="/friends" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              {friendsFeed.length > 0 ? 'Manage friends →' : 'Add friends →'}
            </Link>
          </div>

          {friendsFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🤝</p>
              <p style={{ fontSize: '0.875rem' }}>
                Add friends to see their wishlists here.{' '}
                <Link to="/friends" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Find friends →</Link>
              </p>
            </div>
          ) : (
            <div className="wishlists-grid" style={{ marginTop: '1rem' }}>
              {friendsFeed.map((w) => (
                <Link key={w.id} to={`/list/${w.share_token}`} style={{ textDecoration: 'none' }}>
                  <div className="wishlist-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <MiniAvatar name={w.owner_name} url={w.owner_avatar} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {w.owner_name}
                      </span>
                    </div>
                    <p className="wishlist-card-title">{w.title}</p>
                    {w.event_date && (
                      <p className="wishlist-card-date">
                        🎂 {new Date(w.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    <div className="wishlist-card-meta">
                      <span className="badge badge-purple">{w.item_count} item{w.item_count !== 1 ? 's' : ''}</span>
                      {w.visibility === 'friends'  && <span className="badge badge-amber">Friends</span>}
                      {w.visibility === 'specific' && <span className="badge">Specific</span>}
                      {w.visibility === 'public'   && <span className="badge badge-green">Public</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Ad banner between sections ────────────────────────────────────── */}
        <div style={{ marginTop: '2rem' }}>
          <AdBanner format="horizontal" />
        </div>

        {/* ── Creators' Wishlists ───────────────────────────────────────────── */}
        <section className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="dashboard-section-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Creators' Wishlists</h2>
            <Link to="/friends" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              Find creators →
            </Link>
          </div>

          {creatorFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🌟</p>
              <p style={{ fontSize: '0.875rem' }}>
                Follow your favorite creators to see their wishlists here.
              </p>
            </div>
          ) : (
            <div className="wishlists-grid" style={{ marginTop: '1rem' }}>
              {creatorFeed.map((w) => (
                <Link key={w.id} to={`/list/${w.share_token}`} style={{ textDecoration: 'none' }}>
                  <div className="wishlist-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <MiniAvatar name={w.display_name || w.owner_name} url={w.owner_avatar} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        @{w.display_name || w.owner_name}
                      </span>
                    </div>
                    <p className="wishlist-card-title">{w.title}</p>
                    {w.event_date && (
                      <p className="wishlist-card-date">
                        🎂 {new Date(w.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Right sidebar ads (start at Friends' Wishlists level) ────────────── */}
      <aside className="sidebar-ads ad-sidebar" style={{ paddingTop: '2rem' }}>
        <AdBanner format="sidebar" />
        <AdBanner format="sidebar" />
      </aside>
    </div>
  );
}

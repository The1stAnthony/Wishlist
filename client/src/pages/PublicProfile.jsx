import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GiftCard from '../components/GiftCard';
import JsonLd from '../components/JsonLd';
import '../styles/pages/public-profile.css';

const AVATAR_COLORS = ['#7C3AED', '#DC2626', '#2563EB', '#059669', '#D97706', '#DB2777'];

function hashColor(str) {
  if (!str) return AVATAR_COLORS[0];
  return AVATAR_COLORS[str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000)      return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function PublicProfile() {
  const { handle }  = useParams();
  const { user }    = useAuth();

  const [data,      setData]      = useState(null);
  const [following, setFollowing] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [toggling,  setToggling]  = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/users/${handle}`),
      user ? axios.get(`/api/users/${handle}/follow-status`).catch(() => ({ data: { following: false } })) : Promise.resolve({ data: { following: false } }),
    ]).then(([profileRes, followRes]) => {
      setData(profileRes.data);
      setFollowing(followRes.data.following);
    }).catch(() => setError('Creator not found.'))
      .finally(() => setLoading(false));
  }, [handle, user]);

  async function handleFollowToggle() {
    if (!user) return;
    setToggling(true);
    try {
      if (following) {
        await axios.delete(`/api/follows/${handle}`);
        setFollowing(false);
        setData((d) => d ? { ...d, creator: { ...d.creator, follower_count: (d.creator.follower_count || 1) - 1 } } : d);
      } else {
        await axios.post(`/api/follows/${handle}`);
        setFollowing(true);
        setData((d) => d ? { ...d, creator: { ...d.creator, follower_count: (d.creator.follower_count || 0) + 1 } } : d);
      }
    } catch { /* silent */ }
    finally { setToggling(false); }
  }

  if (loading) return <div className="page-loading">Loading profile…</div>;

  if (error || !data) {
    return (
      <div className="page-loading">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎂</p>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{error || 'Creator not found'}</p>
          <Link to="/" className="btn-primary">Go home</Link>
        </div>
      </div>
    );
  }

  const { creator, wishlists } = data;
  const displayName = creator.display_name || creator.name;
  const avatarColor = hashColor(displayName);

  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `@${displayName}'s Wishlists — All I Want`,
    url: `https://alliwant.xyz/u/${handle}`,
    dateCreated: creator.created_at,
    mainEntity: {
      '@type': 'Person',
      name: displayName,
      identifier: `@${displayName}`,
      url: `https://alliwant.xyz/u/${handle}`,
      ...(creator.avatar_url && { image: creator.avatar_url }),
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: creator.follower_count || 0,
      },
    },
    ...(wishlists.length > 0 && {
      hasPart: wishlists.map((w) => ({
        '@type': 'ItemList',
        name: w.title,
        url: `https://alliwant.xyz/list/${w.share_token}`,
        numberOfItems: w.item_count,
        ...(w.event_date && { 'schema:startDate': w.event_date }),
      })),
    }),
  };

  return (
    <div className="profile-pub-page">
      <JsonLd data={profileSchema} />
      {/* ── Creator header ─────────────────────────────────────────────────── */}
      <div className="profile-pub-header">
        {creator.avatar_url ? (
          <img src={creator.avatar_url} alt={displayName} className="profile-pub-avatar" />
        ) : (
          <div className="profile-pub-avatar profile-pub-avatar--initials" style={{ background: avatarColor }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="profile-pub-info">
          <h1 className="profile-pub-name">@{displayName}</h1>
          <p className="profile-pub-followers">
            {formatCount(creator.follower_count || 0)} followers
          </p>
          <p className="profile-pub-since">
            Member since {new Date(creator.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {user && user.id !== creator.id && (
          <button
            className={following ? 'btn-ghost' : 'btn-primary'}
            style={{ flexShrink: 0, alignSelf: 'flex-start' }}
            onClick={handleFollowToggle}
            disabled={toggling}
          >
            {toggling ? '…' : following ? 'Unfollow' : 'Follow'}
          </button>
        )}

        {!user && (
          <Link to="/register" className="btn-primary" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
            Follow
          </Link>
        )}
      </div>

      {/* ── Wishlists ──────────────────────────────────────────────────────── */}
      <h2 className="profile-pub-section-title">
        🎁 {displayName}'s Wishlists
      </h2>

      {wishlists.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
          No public wishlists yet.
        </p>
      ) : (
        <div className="profile-pub-wishlists">
          {wishlists.map((w) => (
            <Link key={w.id} to={`/list/${w.share_token}`} className="profile-pub-wishlist-card">
              {w.cover_image ? (
                <img src={w.cover_image} alt={w.title} className="profile-pub-wishlist-img" />
              ) : (
                <div className="profile-pub-wishlist-img profile-pub-wishlist-img--placeholder" style={{ background: avatarColor }}>
                  <span>🎁</span>
                </div>
              )}
              <div className="profile-pub-wishlist-body">
                <p className="profile-pub-wishlist-title">{w.title}</p>
                {w.event_date && (
                  <p className="profile-pub-wishlist-date">
                    🎂 {new Date(w.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                <p className="profile-pub-wishlist-count">{w.item_count} item{w.item_count !== 1 ? 's' : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Viral CTA ──────────────────────────────────────────────────────── */}
      {!user && (
        <div style={{
          marginTop: '3rem', padding: '2rem', borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          color: 'white', textAlign: 'center',
        }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🎂 Want your own birthday wishlist?
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem', fontSize: '0.9rem' }}>
            Create yours on All I Want — free forever.
          </p>
          <Link to="/register" style={{
            display: 'inline-block', background: 'var(--color-accent)', color: '#1F2937',
            fontWeight: 700, padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)',
          }}>
            Create my wishlist
          </Link>
        </div>
      )}
    </div>
  );
}

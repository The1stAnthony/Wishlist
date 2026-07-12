import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/friends.css';

const AVATAR_COLORS = ['#1F2937', '#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777'];

function hashColor(str) {
  if (!str) return AVATAR_COLORS[0];
  const i = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

function Avatar({ handle, url, size = 40 }) {
  const initial = (handle || '?').charAt(0).toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt={handle}
        className="friends-avatar-img"
        style={{ width: size, height: size, borderRadius: '50%' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div
      className="friends-avatar-initials"
      style={{ width: size, height: size, background: hashColor(handle), fontSize: size * 0.38 }}
    >
      {initial}
    </div>
  );
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000)      return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function Friends() {
  const { user } = useAuth();
  const [view, setView] = useState('main'); // 'main' | 'followers'

  const [followerData, setFollowerData] = useState({ followers: [], total: 0 });
  const [loading, setLoading]           = useState(false);
  const [actionError, setActionError]   = useState('');

  const loadFollowers = useCallback(() => {
    if (!user?.creator_mode) return;
    setLoading(true);
    axios.get('/api/follows/followers')
      .then((res) => setFollowerData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.creator_mode]);

  useEffect(() => { loadFollowers(); }, [loadFollowers]);

  async function handleFollow(handle) {
    setActionError('');
    try {
      await axios.post(`/api/follows/${handle}`);
      setFollowerData((prev) => ({
        ...prev,
        followers: prev.followers.map((f) =>
          f.display_name === handle ? { ...f, i_follow_them: true } : f
        ),
      }));
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not follow.');
    }
  }

  async function handleUnfollow(handle) {
    setActionError('');
    try {
      await axios.delete(`/api/follows/${handle}`);
      setFollowerData((prev) => ({
        ...prev,
        followers: prev.followers.map((f) =>
          f.display_name === handle ? { ...f, i_follow_them: false } : f
        ),
      }));
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not unfollow.');
    }
  }

  // ── Followers sub-view ────────────────────────────────────────────────────

  if (view === 'followers') {
    return (
      <div className="friends-page">
        <button className="friends-back-btn" onClick={() => setView('main')}>
          ← Back
        </button>

        <div className="friends-followers-header">
          <div>
            <h1 className="friends-page-title">Followers</h1>
            <p className="friends-creator-note">*You can only see other creator accounts here</p>
          </div>
          <span className="friends-follower-count-badge">{formatCount(followerData.total)}</span>
        </div>

        {actionError && <p className="friends-error">{actionError}</p>}

        {loading ? (
          <p className="friends-empty">Loading…</p>
        ) : followerData.followers.length === 0 ? (
          <div className="friends-empty-state">
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</p>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No creator followers yet</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Share your profile link so people can find and follow you.
            </p>
          </div>
        ) : (
          <div className="friends-list">
            {followerData.followers.map((f) => (
              <div key={f.id} className="friends-row">
                <Avatar handle={f.display_name} url={f.avatar_url} />
                <span className="friends-handle">@{f.display_name}</span>
                {f.i_follow_them ? (
                  <button
                    className="friends-btn friends-btn-unfollow"
                    onClick={() => handleUnfollow(f.display_name)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    className="friends-btn friends-btn-follow-back"
                    onClick={() => handleFollow(f.display_name)}
                  >
                    Follow Back!
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────

  const previewAvatars = followerData.followers.slice(0, 4);

  return (
    <div className="friends-page">

      {/* Creator block — only visible when creator mode is on */}
      {user?.creator_mode && (
        <button
          className="friends-creator-block"
          onClick={() => setView('followers')}
          aria-label="View your followers"
        >
          <div className="friends-creator-left">
            <p className="friends-follower-label">Followers:</p>
            {previewAvatars.length > 0 && (
              <div className="friends-avatar-stack">
                {previewAvatars.map((f) => (
                  <div key={f.id} className="friends-avatar-stack-item">
                    <Avatar handle={f.display_name} url={f.avatar_url} size={34} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="friends-follower-count-badge">{formatCount(followerData.total)}</span>
        </button>
      )}

      {/* Friends & Family section */}
      <h2 className="friends-section-title" style={{ marginTop: user?.creator_mode ? '2rem' : '0' }}>
        Friends &amp; Family:
      </h2>

      {/* Empty state — Phase 3 will populate this */}
      <div className="friends-empty-state" style={{ marginTop: '1.5rem' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝</p>
        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No friends yet</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Friend invites are coming soon — you'll be able to send a link or look someone up by email.
        </p>
      </div>
    </div>
  );
}

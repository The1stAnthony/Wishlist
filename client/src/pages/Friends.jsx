import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/friends.css';

const AVATAR_COLORS = ['#1F2937', '#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777'];

function hashColor(str) {
  if (!str) return AVATAR_COLORS[0];
  return AVATAR_COLORS[str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

function Avatar({ name, url, size = 40 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  if (url) {
    return (
      <img src={url} alt={name} className="friends-avatar-img"
        style={{ width: size, height: size }}
        onError={(e) => { e.target.style.display = 'none'; }} />
    );
  }
  return (
    <div className="friends-avatar-initials"
      style={{ width: size, height: size, background: hashColor(name), fontSize: size * 0.38 }}>
      {initial}
    </div>
  );
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000)      return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Small popup anchored to a row — shows action buttons
function RowPopup({ onClose, children }) {
  return (
    <div className="friends-popup">
      {children}
      <button className="friends-popup-close" onClick={onClose}>✕</button>
    </div>
  );
}

export default function Friends() {
  const { user } = useAuth();
  const [view, setView] = useState('main'); // 'main' | 'followers'

  // Followers (creator mode)
  const [followerData,   setFollowerData]   = useState({ followers: [], total: 0 });
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [followError,    setFollowError]    = useState('');

  // Friends & Family
  const [friends,  setFriends]  = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendsError,   setFriendsError]   = useState('');

  // Invite link + email
  const [inviteToken,  setInviteToken]  = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [emailInput,   setEmailInput]   = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg,     setEmailMsg]     = useState('');

  // Popup state: which row's popup is open
  const [openPopup, setOpenPopup] = useState(null); // { type: 'pending'|'incoming', id }

  // Creator search (Find & Follow)
  const [searchQ,       setSearchQ]       = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);

  const loadFollowers = useCallback(() => {
    if (!user?.creator_mode) return;
    setLoadingFollowers(true);
    axios.get('/api/follows/followers')
      .then((r) => setFollowerData(r.data))
      .catch(() => {})
      .finally(() => setLoadingFollowers(false));
  }, [user?.creator_mode]);

  const loadFriends = useCallback(() => {
    setLoadingFriends(true);
    axios.get('/api/friendships')
      .then((r) => { setFriends(r.data.friends); setOutgoing(r.data.outgoing); setIncoming(r.data.incoming); })
      .catch(() => {})
      .finally(() => setLoadingFriends(false));
  }, []);

  useEffect(() => { loadFollowers(); loadFriends(); }, [loadFollowers, loadFriends]);

  // ── Follow actions ───────────────────────────────────────────────────────

  async function handleFollow(handle) {
    setFollowError('');
    try {
      await axios.post(`/api/follows/${handle}`);
      setFollowerData((p) => ({ ...p, followers: p.followers.map((f) => f.display_name === handle ? { ...f, i_follow_them: true } : f) }));
      setSearchResults((p) => p.map((u) => u.display_name === handle ? { ...u, i_follow: true } : u));
    } catch (err) { setFollowError(err.response?.data?.error || 'Could not follow.'); }
  }

  async function handleUnfollow(handle) {
    setFollowError('');
    try {
      await axios.delete(`/api/follows/${handle}`);
      setFollowerData((p) => ({ ...p, followers: p.followers.map((f) => f.display_name === handle ? { ...f, i_follow_them: false } : f) }));
      setSearchResults((p) => p.map((u) => u.display_name === handle ? { ...u, i_follow: false } : u));
    } catch (err) { setFollowError(err.response?.data?.error || 'Could not unfollow.'); }
  }

  // ── Friend actions ───────────────────────────────────────────────────────

  async function handleGenerateInvite() {
    setInviteLoading(true);
    try {
      const r = await axios.post('/api/friendships/invite');
      setInviteToken(r.data.token);
    } catch { /* silent */ }
    finally { setInviteLoading(false); }
  }

  async function handleEmailRequest(e) {
    e.preventDefault();
    setEmailMsg('');
    setEmailSending(true);
    try {
      const r = await axios.post('/api/friendships/request-by-email', { email: emailInput });
      setEmailMsg(r.data.message);
      setEmailInput('');
      loadFriends();
    } catch (err) {
      setEmailMsg(err.response?.data?.error || 'Could not send request.');
    } finally {
      setEmailSending(false);
    }
  }

  async function handleAccept(id) {
    try {
      await axios.patch(`/api/friendships/${id}/accept`);
      setOpenPopup(null);
      loadFriends();
    } catch { /* silent */ }
  }

  async function handleDecline(id) {
    try {
      await axios.patch(`/api/friendships/${id}/decline`);
      setOpenPopup(null);
      loadFriends();
    } catch { /* silent */ }
  }

  async function handleCancel(id) {
    try {
      await axios.delete(`/api/friendships/${id}`);
      setOpenPopup(null);
      loadFriends();
    } catch { /* silent */ }
  }

  async function handleUnfriend(id) {
    try {
      await axios.delete(`/api/friendships/${id}`);
      loadFriends();
    } catch { /* silent */ }
  }

  // ── Creator search ───────────────────────────────────────────────────────

  useEffect(() => {
    if (searchQ.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      setSearching(true);
      axios.get(`/api/follows/search?q=${encodeURIComponent(searchQ)}`)
        .then((r) => setSearchResults(r.data.users))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  const inviteUrl = inviteToken ? `${window.location.origin}/friends/join/${inviteToken}` : '';

  // ── Followers sub-view ────────────────────────────────────────────────────

  if (view === 'followers') {
    return (
      <div className="friends-page">
        <button className="friends-back-btn" onClick={() => setView('main')}>← Back</button>
        <div className="friends-followers-header">
          <div>
            <h1 className="friends-page-title">Followers</h1>
            <p className="friends-creator-note">*You can only see other creator accounts here</p>
          </div>
          <span className="friends-follower-count-badge">{formatCount(followerData.total)}</span>
        </div>

        {followError && <p className="friends-error">{followError}</p>}

        {loadingFollowers ? (
          <p className="friends-empty">Loading…</p>
        ) : followerData.followers.length === 0 ? (
          <div className="friends-empty-state">
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</p>
            <p style={{ fontWeight: 600 }}>No creator followers yet</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Share your profile link so people can find and follow you.
            </p>
          </div>
        ) : (
          <div className="friends-list">
            {followerData.followers.map((f) => (
              <div key={f.id} className="friends-row">
                <Avatar name={f.display_name} url={f.avatar_url} />
                <span className="friends-handle">@{f.display_name}</span>
                {f.i_follow_them ? (
                  <button className="friends-btn friends-btn-unfollow" onClick={() => handleUnfollow(f.display_name)}>Unfollow</button>
                ) : (
                  <button className="friends-btn friends-btn-follow-back" onClick={() => handleFollow(f.display_name)}>Follow Back!</button>
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

      {/* Creator block */}
      {user?.creator_mode && (
        <button className="friends-creator-block" onClick={() => setView('followers')} aria-label="View your followers">
          <div className="friends-creator-left">
            <p className="friends-follower-label">Followers:</p>
            {previewAvatars.length > 0 && (
              <div className="friends-avatar-stack">
                {previewAvatars.map((f) => (
                  <div key={f.id} className="friends-avatar-stack-item">
                    <Avatar name={f.display_name} url={f.avatar_url} size={34} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="friends-follower-count-badge">{formatCount(followerData.total)}</span>
        </button>
      )}

      {/* ── Find & Follow creators ─────────────────────────────────────────── */}
      <div style={{ marginTop: user?.creator_mode ? '2rem' : '0', marginBottom: '2rem' }}>
        <h2 className="friends-section-title" style={{ marginBottom: '0.75rem' }}>Find Creators</h2>
        <div style={{ position: 'relative' }}>
          <input
            className="form-input"
            placeholder="Search by @handle…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
          {searching && (
            <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Searching…
            </span>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="friends-list" style={{ marginTop: '0.75rem' }}>
            {searchResults.map((u) => (
              <div key={u.id} className="friends-row">
                <Avatar name={u.display_name} url={u.avatar_url} />
                <Link to={`/u/${u.display_name}`} className="friends-handle" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                  @{u.display_name}
                </Link>
                {u.i_follow ? (
                  <button className="friends-btn friends-btn-unfollow" onClick={() => handleUnfollow(u.display_name)}>Unfollow</button>
                ) : (
                  <button className="friends-btn friends-btn-follow-back" onClick={() => handleFollow(u.display_name)}>Follow</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Friends & Family ─────────────────────────────────────────────────── */}
      <h2 className="friends-section-title">Friends &amp; Family:</h2>

      {/* Invite / email request tools */}
      <div className="friends-invite-section">
        {/* Generate invite link */}
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            📨 Send an invite link
          </p>
          {inviteUrl ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input className="form-input" value={inviteUrl} readOnly style={{ fontSize: '0.75rem' }} />
              <button
                className="friends-btn friends-btn-follow-back"
                style={{ flexShrink: 0 }}
                onClick={() => { navigator.clipboard.writeText(inviteUrl); }}
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              className="friends-btn friends-btn-follow-back"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={handleGenerateInvite}
              disabled={inviteLoading}
            >
              {inviteLoading ? 'Generating…' : 'Generate invite link'}
            </button>
          )}
        </div>

        {/* Email lookup */}
        <form onSubmit={handleEmailRequest}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            ✉️ Add by email
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="form-input"
              type="email"
              placeholder="their@email.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <button type="submit" className="friends-btn friends-btn-follow-back" style={{ flexShrink: 0 }} disabled={emailSending}>
              {emailSending ? '…' : 'Send'}
            </button>
          </div>
          {emailMsg && (
            <p style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: emailMsg.includes('sent') ? '#059669' : '#DC2626' }}>
              {emailMsg}
            </p>
          )}
        </form>
      </div>

      {friendsError && <p className="friends-error">{friendsError}</p>}

      {loadingFriends ? (
        <p className="friends-empty">Loading…</p>
      ) : (
        <div className="friends-list" style={{ marginTop: '1.25rem' }}>

          {/* Incoming pending (New!) */}
          {incoming.map((f) => (
            <div key={f.id} className="friends-row" style={{ position: 'relative' }}>
              <Avatar name={f.friend_name || f.display_name} url={f.avatar_url} />
              <span className="friends-real-name">{f.friend_name || f.display_name}</span>
              <button
                className="friends-btn friends-btn-new"
                onClick={() => setOpenPopup(openPopup?.id === f.id ? null : { type: 'incoming', id: f.id })}
              >
                New!
              </button>
              {openPopup?.id === f.id && openPopup.type === 'incoming' && (
                <RowPopup onClose={() => setOpenPopup(null)}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                    Friend request from {f.friend_name || f.display_name}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="friends-btn friends-btn-follow-back" onClick={() => handleAccept(f.id)}>Accept</button>
                    <button className="friends-btn friends-btn-unfollow" onClick={() => handleDecline(f.id)}>Decline</button>
                  </div>
                </RowPopup>
              )}
            </div>
          ))}

          {/* Outgoing pending */}
          {outgoing.map((f) => (
            <div key={f.id} className="friends-row" style={{ position: 'relative' }}>
              <Avatar name={f.friend_name || f.display_name} url={f.avatar_url} />
              <span className="friends-real-name">{f.friend_name || f.display_name}</span>
              <button
                className="friends-btn friends-btn-pending"
                onClick={() => setOpenPopup(openPopup?.id === f.id ? null : { type: 'pending', id: f.id })}
              >
                Pending
              </button>
              {openPopup?.id === f.id && openPopup.type === 'pending' && (
                <RowPopup onClose={() => setOpenPopup(null)}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                    Waiting for them to accept
                  </p>
                  <button className="friends-btn friends-btn-unfollow" onClick={() => handleCancel(f.id)}>Cancel request</button>
                </RowPopup>
              )}
            </div>
          ))}

          {/* Accepted friends */}
          {friends.map((f) => (
            <div key={f.id} className="friends-row">
              <Avatar name={f.friend_name || f.display_name} url={f.avatar_url} />
              <span className="friends-real-name">{f.friend_name || f.display_name}</span>
              <button className="friends-btn friends-btn-unfriend" onClick={() => handleUnfriend(f.id)}>Unfriend</button>
            </div>
          ))}

          {/* Empty state */}
          {friends.length === 0 && outgoing.length === 0 && incoming.length === 0 && (
            <div className="friends-empty-state">
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</p>
              <p style={{ fontWeight: 600 }}>No friends yet</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Use the invite link or email lookup above to add your first friend.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

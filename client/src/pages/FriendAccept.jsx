import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = ['#7C3AED', '#DC2626', '#2563EB', '#059669', '#D97706', '#DB2777'];

function hashColor(str) {
  if (!str) return AVATAR_COLORS[0];
  return AVATAR_COLORS[str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

export default function FriendAccept() {
  const { token }  = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [invite,    setInvite]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    axios.get(`/api/friendships/join/${token}`)
      .then((r) => setInvite(r.data.invite))
      .catch(() => setError('This invite link is invalid or has already been used.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    setError('');
    try {
      await axios.post(`/api/friendships/join/${token}`);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not accept invite.');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <div className="page-loading">Loading invite…</div>;

  // Must be logged in to accept
  if (!user) {
    return (
      <div className="page-loading">
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</p>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>You've been invited to connect!</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Sign in or create a free account to accept this friend invite.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to={`/login?redirect=/friends/join/${token}`} className="btn-primary">Sign in</Link>
            <Link to={`/register?redirect=/friends/join/${token}`} className="btn-ghost">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page-loading">
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</p>
          <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>You're now friends!</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            You can now see each other's friends-only wishlists.
          </p>
          <button className="btn-primary" onClick={() => navigate('/friends')}>
            View my friends →
          </button>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="page-loading">
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔗</p>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
          <Link to="/friends" className="btn-primary">My friends</Link>
        </div>
      </div>
    );
  }

  const name    = invite?.requester_name;
  const handle  = invite?.display_name;
  const avatar  = invite?.avatar_url;
  const initial = (name || handle || '?').charAt(0).toUpperCase();
  const color   = hashColor(name || handle);

  return (
    <div className="page-loading">
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {/* Inviter avatar */}
        {avatar ? (
          <img src={avatar} alt={name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: color, color: '#fff',
            fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            {initial}
          </div>
        )}

        <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
          {name || `@${handle}`} wants to be friends
        </p>
        {handle && name && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            @{handle}
          </p>
        )}

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', padding: '0 1rem' }}>
          Accept to see each other's friends-only wishlists. You can unfriend at any time.
        </p>

        {error && (
          <p style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={handleAccept} disabled={accepting}>
            {accepting ? 'Accepting…' : 'Accept invite'}
          </button>
          <button className="btn-ghost" onClick={() => navigate('/')}>Decline</button>
        </div>
      </div>
    </div>
  );
}

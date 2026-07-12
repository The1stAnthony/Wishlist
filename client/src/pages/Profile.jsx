import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/profile.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:           '',
    display_name:   '',
    birthday:       '',
    avatar_url:     '',
    street_address: '',
    city:           '',
    state:          '',
    zip_code:       '',
    country:        'US',
  });
  const [stats,   setStats]   = useState({ wishlists: 0, contacts: 0, items: 0 });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  // Creator mode state
  const [creatorMode,        setCreatorMode]        = useState(false);
  const [creatorModeLoading, setCreatorModeLoading] = useState(false);
  const [creatorModeError,   setCreatorModeError]   = useState('');

  // Password change state
  const [pwForm,    setPwForm]    = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwError,   setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // Delete account state
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name:           user.name           || '',
        display_name:   user.display_name   || '',
        birthday:       user.birthday       || '',
        avatar_url:     user.avatar_url     || '',
        street_address: user.street_address || '',
        city:           user.city           || '',
        state:          user.state          || '',
        zip_code:       user.zip_code       || '',
        country:        user.country        || 'US',
      });
      setCreatorMode(Boolean(user.creator_mode));
    }

    Promise.all([
      axios.get('/api/wishlists/my'),
      axios.get('/api/birthdays'),
    ]).then(([listRes, bdayRes]) => {
      const wishlists  = listRes.data.wishlists;
      const totalItems = wishlists.reduce((sum, w) => sum + (w.item_count || 0), 0);
      setStats({ wishlists: wishlists.length, contacts: bdayRes.data.contacts.length, items: totalItems });
    }).catch(() => {});
  }, [user]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await axios.patch('/api/auth/profile', form);
      updateUser(res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    setPwSaving(true);
    try {
      await axios.patch('/api/auth/password', {
        current_password: pwForm.current,
        new_password:     pwForm.newPw,
      });
      setPwSuccess(true);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Could not update password.');
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    setDeleting(true);
    try {
      await axios.delete('/api/auth/account', { data: { phrase: deletePhrase } });
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Could not delete account.');
      setDeleting(false);
    }
  }

  async function handleCreatorModeToggle() {
    setCreatorModeError('');
    if (!creatorMode && !form.display_name?.trim()) {
      setCreatorModeError('Add a display name / handle above and save before enabling creator mode.');
      return;
    }
    setCreatorModeLoading(true);
    try {
      const res = await axios.post('/api/follows/toggle-creator', { creator_mode: !creatorMode });
      setCreatorMode(res.data.creator_mode);
      updateUser({ ...user, creator_mode: res.data.creator_mode });
    } catch (err) {
      setCreatorModeError(err.response?.data?.error || 'Could not update creator mode.');
    } finally {
      setCreatorModeLoading(false);
    }
  }

  const initials    = user?.name?.charAt(0).toUpperCase() || '?';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const hasAddress = form.street_address || form.city || form.zip_code;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your account and shipping information</p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="profile-stats">
        <div className="profile-stat">
          <p className="profile-stat-value">{stats.wishlists}</p>
          <p className="profile-stat-label">Wishlists</p>
        </div>
        <div className="profile-stat">
          <p className="profile-stat-value">{stats.items}</p>
          <p className="profile-stat-label">Gift ideas</p>
        </div>
        <div className="profile-stat">
          <p className="profile-stat-value">{stats.contacts}</p>
          <p className="profile-stat-label">Birthdays tracked</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSave}>

        {/* ── Identity ──────────────────────────────────────────────────────── */}
        <div className="profile-card">
          <div className="profile-avatar-row">
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt="Profile"
                className="profile-avatar-large"
                style={{ objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="profile-avatar-large"
              style={form.avatar_url ? { display: 'none' } : {}}
            >
              {initials}
            </div>
            <div className="profile-name-block">
              <span className="profile-display-name">{user?.display_name || user?.name}</span>
              <span className="profile-email">{user?.email}</span>
              {memberSince && <span className="profile-member-since">Member since {memberSince}</span>}
            </div>
          </div>

          {success && <p className="profile-success">✅ Profile saved!</p>}
          {error   && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

          <div className="profile-form-grid">
            <div>
              <label className="form-label">Full name</label>
              <input name="name" className="form-input" value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="form-label">
                Display name / alias{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                  (shown on public wishlists)
                </span>
              </label>
              <input
                name="display_name"
                className="form-input"
                placeholder="@YourHandle or nickname"
                value={form.display_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Your birthday</label>
              <input name="birthday" type="date" className="form-input" value={form.birthday} onChange={handleChange} />
            </div>

            <div>
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                title="Email cannot be changed"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Profile photo URL{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                  (paste a direct image link)
                </span>
              </label>
              <input
                name="avatar_url"
                type="url"
                className="form-input"
                placeholder="https://example.com/your-photo.jpg"
                value={form.avatar_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ── Private shipping address ───────────────────────────────────────── */}
        <div className="profile-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                🏠 Private shipping address
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Stored securely. Only shared with gifters when <em>you</em> enable it per-wishlist — your address is never visible by default.
              </p>
            </div>
            {hasAddress && (
              <span className="badge badge-green" style={{ flexShrink: 0 }}>Saved</span>
            )}
          </div>

          <div className="profile-form-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Street address</label>
              <input
                name="street_address"
                className="form-input"
                placeholder="123 Main St, Apt 4B"
                value={form.street_address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">City</label>
              <input name="city" className="form-input" placeholder="New York" value={form.city} onChange={handleChange} />
            </div>

            <div>
              <label className="form-label">State / Province</label>
              <input name="state" className="form-input" placeholder="NY" value={form.state} onChange={handleChange} />
            </div>

            <div>
              <label className="form-label">ZIP / Postal code</label>
              <input name="zip_code" className="form-input" placeholder="10001" value={form.zip_code} onChange={handleChange} />
            </div>

            <div>
              <label className="form-label">Country</label>
              <select name="country" className="form-input" value={form.country} onChange={handleChange}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem', padding: '0.75rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
            💡 To let someone ship a gift to you without revealing your address to them, use Amazon's <strong>"ship as gift"</strong> feature — enter the address at checkout. You can share your list publicly and gifters will see instructions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save all changes'}
          </button>
          <Link to="/dashboard" className="btn-ghost">Cancel</Link>
        </div>
      </form>

      {/* ── Security / Change password ─────────────────────────────────────── */}
      <form className="profile-card" style={{ marginTop: '1.5rem' }} onSubmit={handleChangePassword}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          🔒 Change password
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          Use a strong password with at least 8 characters.
        </p>

        {pwSuccess && <p className="profile-success">✅ Password updated!</p>}
        {pwError   && <p className="auth-error" style={{ marginBottom: '0.75rem' }}>{pwError}</p>}

        <div className="profile-form-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Current password</label>
            <input
              type="password"
              className="form-input"
              value={pwForm.current}
              onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="form-label">New password</label>
            <input
              type="password"
              className="form-input"
              value={pwForm.newPw}
              onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="form-label">Confirm new password</label>
            <input
              type="password"
              className="form-input"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-secondary"
          style={{ marginTop: '1rem' }}
          disabled={pwSaving}
        >
          {pwSaving ? 'Updating…' : 'Update password'}
        </button>
      </form>

      {/* ── Creator mode ──────────────────────────────────────────────────── */}
      <div className="profile-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              🌟 Creator mode
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: 380 }}>
              Enable to get a public profile page, appear in search, and build a following.
              Requires a display name / handle.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreatorModeToggle}
            disabled={creatorModeLoading}
            style={{
              flexShrink: 0,
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: 'none',
              cursor: creatorModeLoading ? 'not-allowed' : 'pointer',
              background: creatorMode ? '#D1FAE5' : 'var(--color-primary)',
              color: creatorMode ? '#065F46' : 'white',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {creatorModeLoading ? '…' : creatorMode ? '✅ On — Disable' : 'Enable'}
          </button>
        </div>

        {creatorModeError && (
          <p style={{
            fontSize: '0.8rem',
            color: '#991B1B',
            background: '#FEE2E2',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.75rem',
            marginTop: '0.75rem',
          }}>
            {creatorModeError}
          </p>
        )}

        {creatorMode && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            Your public profile: <strong>alliwant.xyz/u/{user?.display_name}</strong>
          </p>
        )}
      </div>

      {/* ── Quick links ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
        <Link to="/dashboard" className="profile-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', padding: '1rem 1.25rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>🎁 My wishlists</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>→</span>
        </Link>
        <Link to="/birthdays" className="profile-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', padding: '1rem 1.25rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>🎂 Birthday tracker</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>→</span>
        </Link>
      </div>

      {/* ── Danger zone ───────────────────────────────────────────────────── */}
      <div
        className="profile-card"
        style={{ marginTop: '1.5rem', border: '1.5px solid #FCA5A5', background: '#FFF5F5' }}
      >
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#991B1B', marginBottom: '0.25rem' }}>
          ⚠️ Delete account
        </p>
        <p style={{ fontSize: '0.8rem', color: '#7F1D1D', marginBottom: '1.25rem' }}>
          This permanently deletes your account, all wishlists, and all items. This cannot be undone.
        </p>

        {deleteError && <p className="auth-error" style={{ marginBottom: '0.75rem' }}>{deleteError}</p>}

        <label className="form-label" style={{ color: '#7F1D1D' }}>
          Type <strong>Permanently Delete My Account</strong> to confirm
        </label>
        <input
          className="form-input"
          value={deletePhrase}
          onChange={(e) => setDeletePhrase(e.target.value)}
          placeholder="Permanently Delete My Account"
          style={{ marginBottom: '1rem', borderColor: '#FCA5A5' }}
        />

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting || deletePhrase !== 'Permanently Delete My Account'}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 700,
            fontSize: '0.875rem',
            border: 'none',
            cursor: deletePhrase === 'Permanently Delete My Account' && !deleting ? 'pointer' : 'not-allowed',
            background: deletePhrase === 'Permanently Delete My Account' ? '#DC2626' : '#FCA5A5',
            color: 'white',
            transition: 'background 0.15s',
          }}
        >
          {deleting ? 'Deleting…' : 'Delete my account forever'}
        </button>
      </div>
    </div>
  );
}

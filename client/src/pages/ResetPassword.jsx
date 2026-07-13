import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/pages/auth.css';

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get('token') || '';
  const navigate        = useNavigate();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔗</p>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Invalid reset link.</p>
          <Link to="/forgot-password" className="btn-primary">Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">All<span style={{ color: '#111827' }}> I </span><span>Want</span> 🎂</div>

        {done ? (
          <>
            <h1 className="auth-title">Password reset! ✅</h1>
            <p className="auth-subtitle">Redirecting you to sign in…</p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Set a new password</h1>
            <p className="auth-subtitle">Choose something strong — at least 8 characters.</p>

            {error && <p className="auth-error">{error}</p>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="confirm">Confirm new password</label>
                <input
                  id="confirm"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Saving…' : 'Reset password'}
              </button>
            </form>
          </>
        )}

        <p className="auth-switch">
          <Link to="/login">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
